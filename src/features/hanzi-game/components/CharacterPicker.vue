<script setup>
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

function handleInput(event) {
  emit('update:inputChar', event.target.value)
}
</script>

<template>
  <section class="character-picker">
    <h2>选字开练</h2>
    <div class="input-row">
      <input
        :value="props.inputChar"
        type="text"
        maxlength="1"
        placeholder="输入一个汉字"
        @input="handleInput"
        @keyup.enter="emit('submit')"
      />
      <button type="button" :disabled="props.loading" @click="emit('submit')">
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
  padding: 1rem;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
}

input,
button,
.preset {
  border: 0;
  border-radius: 999px;
  font: inherit;
}

input {
  padding: 0.9rem 1rem;
  background: #f3f6fb;
}

button {
  padding: 0.9rem 1.1rem;
  background: #1f7a5c;
  color: #fff;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset {
  padding: 0.55rem 0.9rem;
  background: #eef4ff;
  color: #234;
}

.preset.active {
  background: #cfe7da;
}
</style>
