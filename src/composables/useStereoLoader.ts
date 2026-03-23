import { ref } from 'vue'
import type { StereoImage, StereoLayout, StretchMode } from '../types'

/** レイアウトに従い rawCanvas を left/right に分割して StereoImage を返す */
export function splitImage(
  raw: HTMLCanvasElement,
  fileName: string,
  layout: StereoLayout,
): StereoImage {
  const w = raw.width
  const h = raw.height

  let left: HTMLCanvasElement
  let right: HTMLCanvasElement
  let halfWidth: number
  let halfHeight: number

  if (layout === 'side-by-side') {
    halfWidth  = Math.floor(w / 2)
    halfHeight = h
    const make = (sx: number): HTMLCanvasElement => {
      const c = document.createElement('canvas')
      c.width = halfWidth; c.height = halfHeight
      c.getContext('2d')!.drawImage(raw, sx, 0, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
      return c
    }
    left  = make(0)
    right = make(halfWidth)
  } else {
    halfWidth  = w
    halfHeight = Math.floor(h / 2)
    const make = (sy: number): HTMLCanvasElement => {
      const c = document.createElement('canvas')
      c.width = halfWidth; c.height = halfHeight
      c.getContext('2d')!.drawImage(raw, 0, sy, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
      return c
    }
    left  = make(0)
    right = make(halfHeight)
  }

  // StretchMode 自動推定
  const eyeAspect = halfWidth / halfHeight!
  let defaultStretch: StretchMode
  if (layout === 'side-by-side') {
    defaultStretch = eyeAspect < 2.5 ? 'Wx2' : 'x1'
  } else {
    defaultStretch = 'Hx2'
  }

  return {
    left, right,
    halfWidth,
    height: halfHeight!,
    defaultStretch,
    fileName,
    originalSize: { w, h },
    rawCanvas: raw,
    layout,
  }
}

/** アスペクト比からレイアウトを自動推定 */
export function detectLayout(w: number, h: number): StereoLayout {
  const rSide      = (w / 2) / h
  const rOverUnder = w / (h / 2)
  return Math.abs(Math.log(rOverUnder) - Math.log(1.5)) <
         Math.abs(Math.log(rSide)      - Math.log(1.5))
    ? 'over-under'
    : 'side-by-side'
}

export function useStereoLoader() {
  const stereo  = ref<StereoImage | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function loadFile(file: File, forceLayout?: StereoLayout): Promise<void> {
    loading.value = true
    error.value   = null

    try {
      const url = URL.createObjectURL(file)
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const w = img.width
          const h = img.height

          // 元画像を rawCanvas に保存
          const raw = document.createElement('canvas')
          raw.width = w; raw.height = h
          raw.getContext('2d')!.drawImage(img, 0, 0)

          const layout = forceLayout ?? detectLayout(w, h)
          stereo.value = splitImage(raw, file.name, layout)

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

  /** レイアウトだけ変えて再分割（ファイル再読み込み不要） */
  function relayout(layout: StereoLayout): void {
    if (!stereo.value) return
    const { rawCanvas, fileName } = stereo.value
    stereo.value = splitImage(rawCanvas, fileName, layout)
  }

  return { stereo, loading, error, loadFile, relayout }
}
