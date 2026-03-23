export type ViewMode = 'anim' | 'fixed'

/** サイドバイサイド方向 */
export type StereoLayout = 'side-by-side' | 'over-under'

export interface StereoImage {
  left: HTMLCanvasElement
  right: HTMLCanvasElement
  /** 1眼分の幅（元のまま） */
  halfWidth: number
  /** 1眼分の高さ */
  height: number
  /**
   * 等倍化後のサイズ（SBS: height×height の正方形、O/U: width×width の正方形）
   * scale=1.0 のときに描画するサイズ
   */
  equalizedSize: { w: number; h: number }
  fileName: string
  originalSize: { w: number; h: number }
  /** 分割方向（横並び or 縦並び） */
  layout: StereoLayout
}

export interface AnimState {
  playing: boolean
  currentEye: 'left' | 'right'
  alpha: number        // 0..1 current draw opacity
  lastSwitchTime: number
}
