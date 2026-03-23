<template>
  <div class="slider-row">
    <div class="slider-label">
      <span>{{ label }}</span>
      <span class="val">{{ displayValue }}</span>
    </div>
    <input
      type="range"
      :min="min" :max="max" :step="step"
      :value="modelValue"
      @input="emit('update:modelValue', +($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: number
  min: number
  max: number
  step: number
  displayValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [v: number] }>()
</script>

<style scoped>
.slider-row { display: flex; flex-direction: column; gap: 0.3rem; }
.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.val {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--accent);
}
</style>
