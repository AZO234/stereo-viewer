import { ref } from 'vue'
import type { StereoImage, StereoLayout } from '../types'

export function useStereoLoader() {
  const stereo = ref<StereoImage | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function loadFile(file: File): Promise<void> {
    loading.value = true
    error.value   = null

    try {
      const url = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const w = img.width
          const h = img.height

          // --- レイアウト自動判定 ---
          // 横÷2 と 縦÷2 のどちらが「正方形に近い1眼」かで判断する。
          // 比率が 1:1 に近い（アスペクト比の差が小さい）方を採用。
          const rSide      = (w / 2) / h        // Side-by-Side のアスペクト比
          const rOverUnder = w / (h / 2)        // Over-Under のアスペクト比
          // 1.0（正方形）に近い、または 16:9 等の横長に近い方を正とする
          // → 両者の対数差で判定（どちらも等距離なら Side-by-Side を優先）
          const layout: StereoLayout =
            Math.abs(Math.log(rOverUnder) - Math.log(1.5)) <
            Math.abs(Math.log(rSide)      - Math.log(1.5))
              ? 'over-under'
              : 'side-by-side'

          // Extract both halves via offscreen canvas
          const tmp = document.createElement('canvas')
          tmp.width = w; tmp.height = h
          tmp.getContext('2d')!.drawImage(img, 0, 0)

          let left: HTMLCanvasElement
          let right: HTMLCanvasElement
          let halfWidth: number
          let halfHeight: number

          if (layout === 'side-by-side') {
            halfWidth  = Math.floor(w / 2)
            halfHeight = h
            const makeHalf = (sx: number): HTMLCanvasElement => {
              const c = document.createElement('canvas')
              c.width = halfWidth; c.height = halfHeight
              c.getContext('2d')!.drawImage(tmp, sx, 0, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
              return c
            }
            left  = makeHalf(0)
            right = makeHalf(halfWidth)
          } else {
            // Over-Under: 上が左目、下が右目
            halfWidth  = w
            halfHeight = Math.floor(h / 2)
            const makeHalf = (sy: number): HTMLCanvasElement => {
              const c = document.createElement('canvas')
              c.width = halfWidth; c.height = halfHeight
              c.getContext('2d')!.drawImage(tmp, 0, sy, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
              return c
            }
            left  = makeHalf(0)
            right = makeHalf(halfHeight)
          }

          stereo.value = {
            left,
            right,
            halfWidth,
            height: halfHeight!,
            // 1眼(halfWidth×height)を元の全解像度(w×h)へ引き伸ばして表示
            equalizedSize: { w, h },
            fileName: file.name,
            originalSize: { w, h },
            layout,
          }

          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像の読み込みに失敗しました')) }
        img.src = url
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
    } finally {
      loading.value = false
    }
  }

  return { stereo, loading, error, loadFile }
}
