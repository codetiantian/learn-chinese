<script setup>
import { computed, onMounted, ref } from 'vue'

import { useHanziPractice } from '@/composables/useHanziPractice'

import { buildMissionFeedback } from './gameProgress'
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
const missionFeedback = computed(() => buildMissionFeedback({
  character: practice.currentChar.value,
  mistakes: practice.totalMistakes.value,
}))

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

function setMode(mode) {
  practice.mode.value = mode
}

function startMission() {
  if (practice.mode.value === 'quiz') {
    practice.startQuiz()
    return
  }

  practice.mode.value = 'quiz'
}
</script>

<template>
  <main class="hanzi-game-page">
    <GameHeader
      :chapter-title="chapterTitle"
      :daily-progress="dailyProgress"
      :streak="streak"
      :stars="stars"
    />

    <CharacterPicker
      :input-char="practice.inputChar.value"
      :loading="practice.loading.value"
      :presets="presets"
      :current-char="practice.currentChar.value"
      @update:input-char="updateInputChar"
      @submit="submitCharacter"
      @pick="pickCharacter"
    />

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

    <TaskPanel
      :mission-title="missionTitle"
      :goal-text="missionGoal"
      :status-text="missionFeedback.statusText"
      :reward-text="missionFeedback.rewardText"
      :performance-tier="missionFeedback.performanceTier"
      @start="startMission"
    />

    <ChapterMap
      :chapter-title="chapterTitle"
      :levels="levels"
      :active-level="activeLevel"
      :expanded="mapExpanded"
      @toggle="mapExpanded = !mapExpanded"
    />
  </main>
</template>

<style scoped>
.hanzi-game-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  color: #132238;
  background:
    radial-gradient(circle at top, rgba(255, 214, 102, 0.28), transparent 30%),
    linear-gradient(180deg, #fff9ef, #eef4ff 45%, #f8fbff);
}
</style>
