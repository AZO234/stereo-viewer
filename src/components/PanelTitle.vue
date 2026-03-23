<template>
  <div class="panel-title">
    <slot />
  </div>
</template>

<style scoped>
.panel-title {
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.panel-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
</style>
