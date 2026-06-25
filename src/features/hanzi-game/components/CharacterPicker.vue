<script setup>
import { ref } from 'vue'

const props = defineProps({
  inputChar: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  presets: {
    type: Array,
    default: () => [],
  },
  currentChar: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:inputChar', 'submit', 'pick'])

const inputOpen = ref(false)

function handleInput(event) {
  emit('update:inputChar', event.target.value)
}

function handleSubmit() {
  if (props.loading) return
  emit('submit')
}

function toggleInput() {
  inputOpen.value = !inputOpen.value
}
</script>

<template>
  <section class="character-picker">
    <div class="picker-head">
      <h2>选字开练</h2>
      <button type="button" class="toggle" @click="toggleInput">
        {{ inputOpen ? '收起' : '自定义' }}
      </button>
    </div>

    <div v-if="inputOpen" class="input-row">
      <input
        :value="props.inputChar"
        type="text"
        maxlength="1"
        placeholder="输入一个汉字"
        @input="handleInput"
        @keyup.enter="handleSubmit"
      />
      <button type="button" :disabled="props.loading" @click="handleSubmit">
        {{ props.loading ? '加载中…' : '开始' }}
      </button>
    </div>

    <div class="presets">
      <button
        v-for="preset in props.presets"
        :key="preset"
        type="button"
        class="preset"
        :class="{ active: preset === props.currentChar }"
        @click="emit('pick', preset)"
      >
        {{ preset }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.character-picker {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-card);
  background: var(--color-surface-strong);
  box-shadow: var(--shadow-soft);
}

.picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

h2 {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-display);
}

.toggle {
  border: 0;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  color: var(--color-ink);
  background: #eef4ff;
}

.input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
}

input,
.presets button,
.input-row button {
  border: 0;
  border-radius: 999px;
  font: inherit;
}

input {
  padding: 0.75rem 1rem;
  background: #f3f6fb;
}

.input-row button {
  padding: 0.75rem 1rem;
  background: var(--color-mint);
  color: #fff;
}

.presets {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.2rem;
  scrollbar-width: thin;
}

.preset {
  flex: 0 0 auto;
  min-width: 2.6rem;
  padding: 0.55rem 0.9rem;
  background: #eef4ff;
  color: var(--color-ink);
  font-size: 1.05rem;
  font-family: var(--font-display);
}

.preset.active {
  background: var(--color-mint-soft);
  color: var(--color-mint);
  font-weight: 600;
}
</style>
