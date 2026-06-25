<script setup>
const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  active: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:active'])

function select(key) {
  if (key === props.active) return
  emit('update:active', key)
}
</script>

<template>
  <nav class="mode-tabs" role="tablist">
    <button
      v-for="group in props.groups"
      :key="group.key"
      type="button"
      role="tab"
      :aria-selected="group.key === props.active"
      class="tab"
      :class="{ active: group.key === props.active }"
      @click="select(group.key)"
    >
      {{ group.label }}
    </button>
  </nav>
</template>

<style scoped>
.mode-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 999px;
  background: var(--color-surface-strong);
  box-shadow: var(--shadow-soft);
  overflow-x: auto;
  scrollbar-width: none;
}

.mode-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  flex: 1 0 auto;
  border: 0;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-ink);
  background: transparent;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;
}

.tab.active {
  background: var(--color-mint);
  color: #fff;
  font-weight: 600;
}
</style>
