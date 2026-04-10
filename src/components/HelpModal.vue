<template>
  <Teleport to="body">
    <div class="hm-overlay" @click.self="emit('close')">
      <div class="hm-dialog">

        <!-- ヘッダー -->
        <div class="hm-header">
          <span class="hm-title">{{ t.helpTitle }}</span>
          <button class="hm-close" @click="emit('close')" aria-label="Close">✕</button>
        </div>

        <!-- ソース画像スライダー -->
        <section class="hm-section">
          <p class="hm-label">{{ t.helpSrcLabel }}</p>
          <div class="hm-slider-wrap" @mousemove="onMove" @touchmove.prevent="onTouch" ref="sliderEl">
            <!-- 右眼（ベース） -->
            <img class="hm-img hm-img--right" :src="srcRight" draggable="false" />
            <!-- 左眼（クリップして上に重ねる） -->
            <img class="hm-img hm-img--left"  :src="srcLeft"
              :style="{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }"
              draggable="false" />
            <!-- ハンドル -->
            <div class="hm-handle" :style="{ left: sliderPct + '%' }">
              <div class="hm-handle__line" />
              <div class="hm-handle__knob">⇔</div>
            </div>
            <!-- 眼ラベル -->
            <span class="hm-eye hm-eye--l">L</span>
            <span class="hm-eye hm-eye--r">R</span>
          </div>
          <p class="hm-hint">{{ t.helpSrcHint }}</p>
        </section>

        <!-- 生成GIF -->
        <section class="hm-section">
          <p class="hm-label">{{ t.helpGifLabel }}</p>
          <div class="hm-gif-wrap">
            <img class="hm-gif" :src="base + 'demo-generated.gif'" alt="Generated animation" />
          </div>
          <p class="hm-hint">{{ t.helpGifHint }}</p>
        </section>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const emit = defineEmits<{ close: [] }>()

// ── ソース画像を左右に分割 ────────────────────────────────
// source.jpg は 1920×1080 SBS → 左960px=L眼, 右960px=R眼
// CSS object-position で切り出す

// object-fit:cover + clip の代わりに
// 2枚の <img> を同じ src で表示し、object-position で左右を出し分ける
const base     = import.meta.env.BASE_URL
const srcLeft  = base + 'demo-source.jpg'
const srcRight = base + 'demo-source.jpg'

// ── スライダー ────────────────────────────────────────────
const sliderPct = ref(50)
const sliderEl  = ref<HTMLDivElement | null>(null)

function setPct(clientX: number) {
  if (!sliderEl.value) return
  const rect = sliderEl.value.getBoundingClientRect()
  const pct  = Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100))
  sliderPct.value = pct
}

function onMove(e: MouseEvent)  { if (e.buttons === 1) setPct(e.clientX) }
function onTouch(e: TouchEvent) { setPct(e.touches[0].clientX) }

// ESC で閉じる
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
})
</script>

<style scoped>
/* ── オーバーレイ ── */
.hm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* ── ダイアログ ── */
.hm-dialog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: min(92vw, 820px);
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── ヘッダー ── */
.hm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.7rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.hm-title {
  font-family: var(--mono);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  color: var(--accent);
}
.hm-close {
  background: none; border: none;
  color: var(--text-muted); font-size: 1rem;
  cursor: pointer; padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: background var(--transition), color var(--transition);
}
.hm-close:hover { background: var(--surface2); color: var(--text); }

/* ── セクション ── */
.hm-section {
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hm-section + .hm-section { border-top: 1px solid var(--border); }

.hm-label {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  color: var(--accent);
  text-transform: uppercase;
}
.hm-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ── スライダー ── */
.hm-slider-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: col-resize;
  user-select: none;
  background: #000;
}

/* 左右ともに全幅で表示し、object-position で左右の眼を見せる */
.hm-img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  pointer-events: none;
}
/* L眼: 元画像の左半分を表示 */
.hm-img--left  { object-position: left center; }
/* R眼: 元画像の右半分を表示 */
.hm-img--right { object-position: right center; }

/* ハンドル */
.hm-handle {
  position: absolute;
  top: 0; bottom: 0;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hm-handle__line {
  width: 2px;
  flex: 1;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 0 6px rgba(0,0,0,0.5);
}
.hm-handle__knob {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 0.75rem;
  padding: 0.2rem 0.35rem;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.3);
  white-space: nowrap;
}

/* 眼ラベル */
.hm-eye {
  position: absolute;
  top: 0.4rem;
  font-family: var(--mono);
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  background: rgba(0,0,0,0.5);
}
.hm-eye--l { left: 0.4rem;  color: var(--accent); }
.hm-eye--r { right: 0.4rem; color: var(--accent2); }

/* ── GIF ── */
.hm-gif-wrap {
  display: flex;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: #000;
}
.hm-gif {
  max-width: 100%;
  display: block;
}
</style>
