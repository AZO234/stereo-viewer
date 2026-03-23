<template>
  <div class="toggle-row">
    <span class="tgl-label">{{ label }}</span>
    <label class="sv-switch">
      <input type="checkbox" :checked="modelValue" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
      <span class="sv-switch-track" />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0;
}
.tgl-label { font-size: 0.78rem; color: var(--text-muted); }
</style>
