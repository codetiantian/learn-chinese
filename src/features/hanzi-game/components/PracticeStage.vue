<script setup>
import { computed } from 'vue'

const props = defineProps({
  writerTarget: {
    type: Function,
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
  totalMistakes: {
    type: Number,
    default: 0,
  },
  quizDone: {
    type: Boolean,
    default: false,
  },
  missionTitle: {
    type: String,
    default: '',
  },
  goalText: {
    type: String,
    default: '',
  },
  rewardText: {
    type: String,
    default: '',
  },
  performanceTier: {
    type: String,
    default: 'complete',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['play', 'toggle-loop', 'start-quiz'])

const isAnimate = computed(() => props.mode === 'animate')
const primaryLabel = computed(() => (isAnimate.value ? '开始闯关' : '重新书写'))
const progressPct = computed(() => {
  if (!props.totalStrokes) return 0
  return Math.min(100, Math.round((props.currentStroke / props.totalStrokes) * 100))
})
</script>

<template>
  <section class="practice-stage">
    <div class="stage-head">
      <div class="stage-copy">
        <p class="eyebrow">{{ props.missionTitle }}</p>
        <h2>「{{ props.currentChar }}」练习区</h2>
        <p class="goal">{{ props.goalText }}</p>
      </div>
      <span class="stroke-chip">共 {{ props.totalStrokes }} 笔</span>
    </div>

    <div class="writer-shell">
      <div :ref="props.writerTarget" class="writer-target" />
      <div v-if="props.loading" class="writer-mask" aria-live="polite">加载中…</div>
    </div>

    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" :style="{ width: `${progressPct}%` }" />
    </div>
    <p class="progress">
      当前笔画：{{ props.currentStroke }}/{{ props.totalStrokes }}
      <span v-if="!isAnimate || props.totalMistakes" class="mistakes">· 错误 {{ props.totalMistakes }} 次</span>
    </p>

    <div class="feedback" :data-tier="props.performanceTier" :class="{ done: props.quizDone }">
      <p class="status" aria-live="polite">{{ props.status }}</p>
      <strong v-if="props.quizDone" class="reward">{{ props.rewardText }}</strong>
    </div>

    <div class="action-row">
      <button
        v-if="isAnimate"
        type="button"
        class="action ghost"
        :disabled="props.loading || !props.hasData"
        @click="emit('play')"
      >
        播放动画
      </button>
      <button
        v-if="isAnimate"
        type="button"
        class="action ghost"
        :disabled="props.loading || !props.hasData || !isAnimate"
        @click="emit('toggle-loop')"
      >
        {{ props.loop ? '停止连播' : '循环演示' }}
      </button>
      <button
        type="button"
        class="action primary"
        :disabled="props.disabled || props.loading || !props.hasData"
        @click="emit('start-quiz')"
      >
        {{ primaryLabel }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.practice-stage {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: var(--radius-card);
  background: var(--color-surface-strong);
  box-shadow: var(--shadow-soft);
}

.stage-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.stage-copy {
  min-width: 0;
}

.eyebrow,
.goal,
.status,
.progress,
h2 {
  margin: 0;
}

.eyebrow {
  color: var(--color-ink-soft);
  font-size: 0.8rem;
}

h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-ink-strong);
}

.goal {
  margin-top: 0.2rem;
  color: var(--color-accent-strong);
  font-size: 0.85rem;
}

.stroke-chip {
  flex-shrink: 0;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: var(--color-mint);
  background: var(--color-mint-soft);
  font-size: 0.85rem;
  white-space: nowrap;
}

.writer-shell {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 16rem;
  border-radius: 1rem;
  background:
    linear-gradient(0deg, rgba(212, 223, 240, 0.6), rgba(212, 223, 240, 0.6)),
    #f8fbff;
}

.writer-target {
  width: min(100%, 360px);
  aspect-ratio: 1 / 1;
}

.writer-target :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.writer-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-ink-soft);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
}

.progress-track {
  height: 0.4rem;
  border-radius: 999px;
  background: rgba(20, 34, 58, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-mint), #2fae7e);
  transition: width 0.3s ease;
}

.progress {
  color: var(--color-ink-soft);
  font-size: 0.85rem;
}

.mistakes {
  color: #c0473a;
}

.feedback {
  display: grid;
  gap: 0.25rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.9rem;
  background: #f3f6fb;
  min-height: 2.5rem;
}

.feedback.done[data-tier='perfect'] {
  background: #e2f3ea;
}

.feedback.done[data-tier='strong'] {
  background: #eef4ff;
}

.feedback.done[data-tier='complete'] {
  background: #fff3e0;
}

.status {
  color: var(--color-ink);
  font-size: 0.9rem;
}

.feedback.done .status {
  font-weight: 600;
  color: var(--color-ink-strong);
}

.reward {
  color: var(--color-accent-strong);
  font-size: 0.9rem;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.action {
  border: 0;
  border-radius: 999px;
  font: inherit;
  padding: 0.8rem 1rem;
}

.action.ghost {
  flex: 1 1 auto;
  color: var(--color-ink);
  background: #eef4ff;
}

.action.primary {
  flex: 1 1 100%;
  color: #fff;
  background: var(--color-mint);
  font-weight: 600;
}

.action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
