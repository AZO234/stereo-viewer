<template>
  <div
    class="sv-drop"
    :class="{ 'sv-drop--over': isDragging }"
    @click="inputEl?.click()"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputEl"
      type="file"
      accept=".jps,.pns,.jpg,.jpeg,.png"
      style="display:none"
      @change="onChange"
    />
    <div class="drop-icon">📂</div>
    <p class="drop-hint">クリックまたはドロップ</p>
    <div class="ext-row">
      <span class="ext-badge">.jps</span>
      <span class="ext-badge">.pns</span>
      <span class="ext-badge">.jpg/.png</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ file: [f: File] }>()
const inputEl   = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function onChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('file', f)
}
function onDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files[0]
  if (f) emit('file', f)
}
</script>

<style scoped>
.sv-drop {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition);
  user-select: none;
}
.sv-drop:hover, .sv-drop--over {
  border-color: var(--accent);
  background: rgba(0,229,255,0.04);
}
.drop-icon { font-size: 2rem; opacity: 0.5; margin-bottom: 0.4rem; }
.drop-hint { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem; }

.ext-row { display: flex; justify-content: center; gap: 0.3rem; flex-wrap: wrap; }
.ext-badge {
  display: inline-block;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-family: var(--mono);
  font-size: 0.62rem;
  padding: 1px 5px;
  color: var(--accent);
}
</style>
