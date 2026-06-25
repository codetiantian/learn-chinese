<script setup>
const props = defineProps({
  writerTarget: {
    default: null,
  },
  currentChar: {
    type: String,
    default: '',
  },
  mode: {
    type: String,
    default: 'animate',
  },
  loop: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hasData: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: '',
  },
  totalStrokes: {
    type: Number,
    default: 0,
  },
  currentStroke: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:mode', 'play', 'toggle-loop', 'start-quiz'])
</script>

<template>
  <section class="practice-stage">
    <div class="section-heading">
      <div>
        <p class="eyebrow">书写舞台</p>
        <h2>「{{ props.currentChar }}」练习区</h2>
      </div>
      <span class="stroke-chip">共 {{ props.totalStrokes }} 笔</span>
    </div>

    <div class="writer-shell">
      <div :ref="props.writerTarget" class="writer-target" />
    </div>

    <div class="mode-row" role="tablist" aria-label="练习模式">
      <button
        type="button"
        class="mode-pill"
        :class="{ active: props.mode === 'animate' }"
        @click="emit('update:mode', 'animate')"
      >
        动画演示
      </button>
      <button
        type="button"
        class="mode-pill"
        :class="{ active: props.mode === 'quiz' }"
        @click="emit('update:mode', 'quiz')"
      >
        书写练习
      </button>
    </div>

    <p class="status">{{ props.status }}</p>

    <div class="action-row">
      <button type="button" class="action ghost" :disabled="props.loading || !props.hasData" @click="emit('play')">
        播放动画
      </button>
      <button type="button" class="action ghost" :disabled="props.loading || !props.hasData" @click="emit('toggle-loop')">
        {{ props.loop ? '停止连播' : '循环演示' }}
      </button>
      <button type="button" class="action primary" :disabled="props.loading || !props.hasData" @click="emit('start-quiz')">
        开始闯关
      </button>
    </div>

    <p class="progress">当前笔画：{{ props.currentStroke }}/{{ props.totalStrokes }}</p>
  </section>
</template>

<style scoped>
.practice-stage {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.eyebrow,
.status,
.progress,
h2 {
  margin: 0;
}

.eyebrow,
.progress {
  color: #5f6b7a;
}

.stroke-chip {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: #1f7a5c;
  background: #e2f3ea;
}

.writer-shell {
  display: grid;
  place-items: center;
  min-height: 14rem;
  border-radius: 1rem;
  background:
    linear-gradient(0deg, rgba(212, 223, 240, 0.6), rgba(212, 223, 240, 0.6)),
    #f8fbff;
}

.writer-target {
  width: min(100%, 360px);
  min-height: 14rem;
}

.mode-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.mode-pill,
.action {
  border: 0;
  border-radius: 999px;
  font: inherit;
}

.mode-pill {
  padding: 0.65rem 0.95rem;
  color: #355070;
  background: #eef4ff;
}

.mode-pill.active {
  color: #fff;
  background: #355070;
}

.action {
  padding: 0.8rem 1rem;
}

.action.ghost {
  color: #234;
  background: #eef4ff;
}

.action.primary {
  color: #fff;
  background: #1f7a5c;
}

.action:disabled {
  opacity: 0.6;
}
</style>
