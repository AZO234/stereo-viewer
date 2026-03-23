<template>
  <div class="anim-viewer">
    <canvas ref="canvasEl" class="anim-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { StereoImage } from '../types'
import { useAnimPlayer } from '../composables/useAnimPlayer'

const props = defineProps<{
  stereo: StereoImage
  speed: number   // ms
  scale: number   // 0.2 .. 2.0
  playing: boolean
}>()

const emit = defineEmits<{
  'update:playing': [v: boolean]
  'frame': [eye: string]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const player = useAnimPlayer()

// Expose toggle for parent
defineExpose({ toggle })

function toggle() {
  if (!canvasEl.value) return
  player.toggle(
    canvasEl.value,
    props.stereo,
    () => props.speed,
    () => props.scale,
  )
  emit('update:playing', player.playing.value)
}

// Watch playing prop from parent
watch(() => props.playing, (val) => {
  if (!canvasEl.value) return
  if (val && !player.playing.value) {
    player.start(canvasEl.value, props.stereo, () => props.speed, () => props.scale)
  } else if (!val && player.playing.value) {
    player.stop(canvasEl.value, props.stereo, props.scale)
  }
})

// Watch scale — redraw when paused
watch(() => props.scale, (s) => {
  if (!canvasEl.value) return
  player.redraw(canvasEl.value, props.stereo, s)
})

// Watch stereo — reset on new image
watch(() => props.stereo, () => {
  if (player.playing.value && canvasEl.value) {
    player.stop(canvasEl.value, props.stereo, props.scale)
    emit('update:playing', false)
  }
  if (canvasEl.value) {
    player.redraw(canvasEl.value, props.stereo, props.scale)
  }
})

// Watch frame for status
watch(player.currentEye, (eye) => emit('frame', eye))

onMounted(() => {
  if (canvasEl.value) player.redraw(canvasEl.value, props.stereo, props.scale)
})

onUnmounted(() => {
  if (canvasEl.value && player.playing.value)
    player.stop(canvasEl.value, props.stereo, props.scale)
})
</script>

<style scoped>
.anim-viewer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: auto;
}
.anim-canvas {
  border: 1px solid var(--border);
  border-radius: 4px;
  display: block;
  background: #000;
  box-shadow: 0 0 40px rgba(0,229,255,0.07);
  image-rendering: pixelated;
}
</style>
