<script setup>
import { computed, onMounted, ref } from 'vue'

import { useHanziPractice } from '@/composables/useHanziPractice'

import { buildMissionFeedback } from './gameProgress'
import CharacterPicker from './components/CharacterPicker.vue'
import PracticeStage from './components/PracticeStage.vue'

const writerTarget = ref(null)
const presets = ['我', '你', '好', '学', '中', '国']

const practice = useHanziPractice({
  targetRef: writerTarget,
  initialChar: '我',
})

const missionTitle = computed(() => `完成「${practice.currentChar.value}」的书写练习`)
const missionGoal = '目标：错误少于 5 次'
const canStartMission = computed(() => !practice.loading.value && practice.hasData.value)
const missionFeedback = computed(() => buildMissionFeedback({
  character: practice.currentChar.value,
  mistakes: practice.totalMistakes.value,
}))
const missionRewardText = computed(() => (
  practice.quizDone.value ? missionFeedback.value.rewardText : '完成当前任务后查看书写评价'
))
const missionTier = computed(() => (
  practice.quizDone.value ? missionFeedback.value.performanceTier : 'complete'
))

onMounted(() => {
  practice.mount()
})

function updateInputChar(value) {
  practice.inputChar.value = value
}

function submitCharacter() {
  practice.submitChar()
}

function pickCharacter(character) {
  practice.pickPreset(character)
}

function setWriterTarget(el) {
  writerTarget.value = el
}

function startMission() {
  if (!canStartMission.value) return

  if (practice.mode.value === 'quiz') {
    practice.startQuiz()
    return
  }

  practice.mode.value = 'quiz'
}
</script>

<template>
  <main class="hanzi-game-page">
    <section class="region region-stage" data-region="stage">
      <PracticeStage
        :writer-target="setWriterTarget"
        :current-char="practice.currentChar.value"
        :mode="practice.mode.value"
        :loop="practice.loop.value"
        :loading="practice.loading.value"
        :has-data="practice.hasData.value"
        :status="practice.status.value"
        :total-strokes="practice.totalStrokes.value"
        :current-stroke="practice.currentStroke.value"
        :total-mistakes="practice.totalMistakes.value"
        :quiz-done="practice.quizDone.value"
        :mission-title="missionTitle"
        :goal-text="missionGoal"
        :reward-text="missionRewardText"
        :performance-tier="missionTier"
        :disabled="!canStartMission"
        @play="practice.playAnimation"
        @toggle-loop="practice.toggleLoop"
        @start-quiz="startMission"
      />
    </section>

    <section class="region region-picker" data-region="picker">
      <CharacterPicker
        :input-char="practice.inputChar.value"
        :loading="practice.loading.value"
        :presets="presets"
        :current-char="practice.currentChar.value"
        @update:input-char="updateInputChar"
        @submit="submitCharacter"
        @pick="pickCharacter"
      />
    </section>
  </main>
</template>

<style scoped>
.hanzi-game-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(100%, var(--page-max-width));
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(0.7rem, 2.5vw, 1.25rem) var(--page-padding) 1.25rem;
  color: var(--color-ink);
}

.region {
  min-width: 0;
}

.region-stage {
  flex: 1 1 auto;
}

.region :deep(section),
.region :deep(header) {
  min-height: 100%;
}

.region-stage :deep(.practice-stage) {
  height: 100%;
}

@media (min-width: 768px) {
  .hanzi-game-page {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1.3fr) minmax(18rem, 0.7fr);
    grid-template-areas:
      'stage picker';
    align-items: start;
    padding-bottom: 2rem;
  }

  .region-stage {
    grid-area: stage;
  }

  .region-picker {
    grid-area: picker;
  }
}

@media (min-width: 1080px) {
  .hanzi-game-page {
    grid-template-columns: minmax(16rem, 20rem) minmax(0, 1fr);
    grid-template-areas:
      'picker stage';
  }
}
</style>
