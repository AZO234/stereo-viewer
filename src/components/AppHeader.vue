<template>
  <header class="sv-header">
    <div class="sv-logo">
      <div class="logo-mark">
        <span /><span /><span /><span />
      </div>
      <div class="logo-text">
        <h1>STEREO VIEWER</h1>
        <small>JPS / PNS STEREOSCOPIC IMAGE BROWSER</small>
      </div>
    </div>

    <div class="sv-header-right">
      <div class="sv-header-meta" v-if="fileName">
        <i class="bi bi-file-earmark-image me-1" />
        <span class="filename">{{ fileName }}</span>
        <span class="sep">|</span>
        <span class="diminfo">{{ dimInfo }}</span>
      </div>
      <ThemeToggle
        :model-value="isDark"
        @update:model-value="emit('update:isDark', $event)"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'

defineProps<{
  fileName?: string
  dimInfo?:  string
  isDark:    boolean
}>()

const emit = defineEmits<{ 'update:isDark': [v: boolean] }>()
</script>

<style scoped>
.sv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.sv-logo { display: flex; align-items: center; gap: 0.9rem; }

.logo-mark {
  width: 32px; height: 32px;
  border: 2px solid var(--accent);
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px; padding: 5px;
  flex-shrink: 0;
}
.logo-mark span { border-radius: 1px; }
.logo-mark span:nth-child(odd)  { background: var(--accent); }
.logo-mark span:nth-child(even) { background: var(--accent2); }

h1 {
  font-family: var(--mono);
  font-size: 1rem;
  letter-spacing: 0.12em;
  color: var(--accent);
  line-height: 1;
}
small {
  display: block;
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin-top: 3px;
}

.sv-header-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.sv-header-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}
.filename { color: var(--text); }
.sep { opacity: 0.3; }
.diminfo { color: var(--accent); }
</style>
