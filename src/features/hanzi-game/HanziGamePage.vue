<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { useHanziPractice } from '@/composables/useHanziPractice'

import { buildMissionFeedback, buildRoundReward } from './gameProgress'
import ChapterMap from './components/ChapterMap.vue'
import CharacterPicker from './components/CharacterPicker.vue'
import GameHeader from './components/GameHeader.vue'
import PracticeStage from './components/PracticeStage.vue'
import TaskPanel from './components/TaskPanel.vue'

const chapterTitle = '第 1 章'
const dailyProgress = 42

const writerTarget = ref(null)
const mapExpanded = ref(true)
const streak = ref(3)
const stars = ref(18)
const presets = ['我', '你', '好', '学', '中', '国']
const levels = [
  { id: 1, name: '起步' },
  { id: 2, name: '笔顺' },
  { id: 3, name: '识记' },
]

const practice = useHanziPractice({
  targetRef: writerTarget,
  initialChar: '我',
})

const missionTitle = computed(() => `完成「${practice.currentChar.value}」的书写练习`)
const missionGoal = '目标：错误少于 5 次'
const activeLevel = computed(() => (practice.mode.value === 'quiz' ? 2 : 1))
const canStartMission = computed(() => !practice.loading.value && practice.hasData.value)
const missionFeedback = computed(() => buildMissionFeedback({
  character: practice.currentChar.value,
  mistakes: practice.totalMistakes.value,
}))
const missionStatusText = computed(() => (
  practice.quizDone.value ? missionFeedback.value.statusText : practice.status.value
))
const missionRewardText = computed(() => (
  practice.quizDone.value ? missionFeedback.value.rewardText : '完成当前任务后解锁星星奖励'
))
const missionTier = computed(() => (
  practice.quizDone.value ? missionFeedback.value.performanceTier : 'complete'
))

onMounted(() => {
  practice.mount()
})

watch(
  () => practice.quizDone.value,
  (isDone, wasDone) => {
    if (!isDone || wasDone) return

    const reward = buildRoundReward(missionFeedback.value.performanceTier)
    stars.value += reward.stars
    streak.value += reward.streakDelta
  },
  { immediate: true },
)

function updateInputChar(value) {
  practice.inputChar.value = value
}

function submitCharacter() {
  practice.submitChar()
}

function pickCharacter(character) {
  practice.pickPreset(character)
}

function setMode(mode) {
  if (mode === 'quiz' && !canStartMission.value) return
  practice.mode.value = mode
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
    <section class="region region-header" data-region="header">
      <GameHeader
        :chapter-title="chapterTitle"
        :daily-progress="dailyProgress"
        :streak="streak"
        :stars="stars"
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

    <section class="region region-stage" data-region="stage">
      <PracticeStage
        :writer-target="writerTarget"
        :current-char="practice.currentChar.value"
        :mode="practice.mode.value"
        :loop="practice.loop.value"
        :loading="practice.loading.value"
        :has-data="practice.hasData.value"
        :status="practice.status.value"
        :total-strokes="practice.totalStrokes.value"
        :current-stroke="practice.currentStroke.value"
        @update:mode="setMode"
        @play="practice.playAnimation"
        @toggle-loop="practice.toggleLoop"
        @start-quiz="startMission"
      />
    </section>

    <section class="region region-task" data-region="task-panel">
      <TaskPanel
        :mission-title="missionTitle"
        :goal-text="missionGoal"
        :status-text="missionStatusText"
        :reward-text="missionRewardText"
        :performance-tier="missionTier"
        :disabled="!canStartMission"
        @start="startMission"
      />
    </section>

    <section class="region region-map" data-region="chapter-map">
      <ChapterMap
        :chapter-title="chapterTitle"
        :levels="levels"
        :active-level="activeLevel"
        :expanded="mapExpanded"
        @toggle="mapExpanded = !mapExpanded"
      />
    </section>
  </main>
</template>

<style scoped>
.hanzi-game-page {
  display: grid;
  gap: 0.9rem;
  width: min(100%, var(--page-max-width));
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(0.9rem, 3vw, 1.5rem) var(--page-padding) 1.5rem;
  color: #132238;
}

.region {
  min-width: 0;
}

.region :deep(section),
.region :deep(header) {
  min-height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(10px);
}

.region-header :deep(.game-header) {
  padding: 1.25rem;
  background:
    radial-gradient(circle at top right, rgba(242, 181, 68, 0.3), transparent 36%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(244, 248, 255, 0.88));
  box-shadow: var(--shadow-soft);
}

.region-picker :deep(.character-picker),
.region-stage :deep(.practice-stage) {
  background: var(--color-surface-strong);
  box-shadow: var(--shadow-soft);
}

.region-task :deep(.task-panel),
.region-map :deep(.chapter-map) {
  box-shadow: var(--shadow-strong);
}

.region-picker :deep(.character-picker),
.region-stage :deep(.practice-stage),
.region-task :deep(.task-panel),
.region-map :deep(.chapter-map) {
  padding: 1rem;
}

.region-header :deep(h1),
.region-header :deep(.eyebrow),
.region-stage :deep(h2),
.region-task :deep(h2),
.region-map :deep(h2) {
  font-family: var(--font-display);
}

.region-header :deep(.stats) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.region-stage :deep(.writer-shell) {
  min-height: 16rem;
}

.region-stage :deep(.writer-target) {
  width: 100%;
  min-height: 16rem;
}

@media (min-width: 768px) {
  .hanzi-game-page {
    gap: 1rem;
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    grid-template-areas:
      'header header'
      'picker task'
      'stage task'
      'stage map';
    align-items: start;
    padding-bottom: 2rem;
  }

  .region-header {
    grid-area: header;
  }

  .region-picker {
    grid-area: picker;
  }

  .region-stage {
    grid-area: stage;
  }

  .region-task {
    grid-area: task;
    position: sticky;
    top: 1rem;
  }

  .region-map {
    grid-area: map;
  }
}

@media (min-width: 1080px) {
  .hanzi-game-page {
    grid-template-columns: minmax(16rem, 20rem) minmax(0, 1fr) minmax(18rem, 22rem);
    grid-template-areas:
      'header header header'
      'picker stage task'
      'map stage task';
  }

  .region-picker {
    align-self: start;
  }
}
</style>
