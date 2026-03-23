import { ref, readonly } from 'vue'
import type { StereoImage } from '../types'

export function useAnimPlayer() {
  const playing    = ref(false)
  const currentEye = ref<'left' | 'right'>('left')

  let rafId      = 0
  let lastSwitch = 0

  // ── クロスフェード用の状態 ──────────────────────────────────
  // fromEye: フェードアウト中の画像
  // toEye  : フェードイン中の画像（= currentEye）
  // t      : 0.0（from が100%表示）→ 1.0（to が100%表示）
  let fromEye: 'left' | 'right' = 'left'
  let crossT = 1.0   // 1.0 = 切替完了（単画像表示）状態

  function start(
    canvas: HTMLCanvasElement,
    stereo: StereoImage,
    getSpeed: () => number,
    getScale: () => number,
  ) {
    if (playing.value) return
    playing.value = true
    lastSwitch    = performance.now()
    crossT        = 1.0

    const loop = (ts: number) => {
      if (!playing.value) return

      const speed   = getSpeed()
      const elapsed = ts - lastSwitch

      if (elapsed >= speed) {
        // 前の「to」が次の「from」になる
        fromEye          = currentEye.value
        currentEye.value = currentEye.value === 'left' ? 'right' : 'left'
        lastSwitch = ts
        crossT     = 0.0
      }

      // t: 0 → 1 で線形補間（1 フレーム内に完結）
      crossT = Math.min((ts - lastSwitch) / speed, 1.0)

      crossfadeFrame(canvas, stereo, fromEye, currentEye.value, crossT, getScale())

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
  }

  function stop(canvas: HTMLCanvasElement, stereo: StereoImage, scale: number) {
    playing.value = false
    cancelAnimationFrame(rafId)
    // 停止時は現在の「to」画像を100%で描画
    drawSingle(canvas, stereo, currentEye.value, scale)
  }

  function toggle(
    canvas: HTMLCanvasElement,
    stereo: StereoImage,
    getSpeed: () => number,
    getScale: () => number,
  ) {
    if (playing.value) stop(canvas, stereo, getScale())
    else               start(canvas, stereo, getSpeed, getScale)
  }

  function redraw(canvas: HTMLCanvasElement, stereo: StereoImage, scale: number) {
    if (!playing.value) {
      drawSingle(canvas, stereo, currentEye.value, scale)
    }
  }

  return {
    playing:    readonly(playing),
    currentEye: readonly(currentEye),
    start, stop, toggle, redraw,
  }
}

// ── 単画像描画（停止時・リサイズ時） ──────────────────────────
function drawSingle(
  canvas: HTMLCanvasElement,
  stereo: StereoImage,
  eye: 'left' | 'right',
  scale: number,
) {
  const { w, h } = canvasSize(stereo, scale)
  resizeIfNeeded(canvas, w, h)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(eye === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
}

// ── クロスフェード描画 ─────────────────────────────────────────
// t=0: from が100% / t=1: to が100%
// 中間は from(1-t) + to(t) の透明度合成
function crossfadeFrame(
  canvas: HTMLCanvasElement,
  stereo: StereoImage,
  from: 'left' | 'right',
  to: 'left' | 'right',
  t: number,
  scale: number,
) {
  const { w, h } = canvasSize(stereo, scale)
  resizeIfNeeded(canvas, w, h)
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, w, h)

  if (t <= 0) {
    // フェード開始直前 — from を100%
    ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }
  if (t >= 1) {
    // フェード完了 — to を100%
    ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }

  // from: (1 - t) の不透明度で描画
  ctx.globalAlpha = 1 - t
  ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)

  // to: t の不透明度で重ねて描画
  ctx.globalAlpha = t
  ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)

  ctx.globalAlpha = 1
}

// ── ユーティリティ ────────────────────────────────────────────
function canvasSize(stereo: StereoImage, scale: number) {
  return {
    w: Math.round(stereo.equalizedSize.w * scale),
    h: Math.round(stereo.equalizedSize.h * scale),
  }
}

/** サイズが変わったときだけ canvas をリセット（毎フレームの不要リセットを防ぐ） */
function resizeIfNeeded(canvas: HTMLCanvasElement, w: number, h: number) {
  if (canvas.width !== w)  canvas.width  = w
  if (canvas.height !== h) canvas.height = h
}
