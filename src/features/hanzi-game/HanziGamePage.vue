<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { useHanziPractice } from '@/composables/useHanziPractice'

import { buildMissionFeedback } from './gameProgress'
import { GROUP_ORDER, LESSON_GROUPS, findItem, itemKey } from './lessons'
import { speak, ttsSupported } from './useTTS'
import CharacterPicker from './components/CharacterPicker.vue'
import ModeTabs from './components/ModeTabs.vue'
import PracticeStage from './components/PracticeStage.vue'
import TraceStage from './components/TraceStage.vue'

const writerTarget = ref(null)

// 当前学习分组：common / numbers / pinyin
const activeGroup = ref('common')
const ttsAvailable = ref(ttsSupported())

const group = computed(() => LESSON_GROUPS[activeGroup.value])
const stage = computed(() => group.value.stage) // 'hanzi' | 'trace'
const items = computed(() => group.value.items)

// 描红组当前对象（数字 / 拼音共用）。
const traceItem = ref(LESSON_GROUPS.numbers.items[0])

const practice = useHanziPractice({
  targetRef: writerTarget,
  initialChar: LESSON_GROUPS.common.items[0].char,
})

// 写汉字组的当前字元数据（拼音 / 释义）。
const commonItem = computed(() => findItem(practice.currentChar.value))

// 统一当前对象：写汉字取 commonItem，描红取 traceItem。
const currentItem = computed(() => (stage.value === 'hanzi' ? commonItem.value : traceItem.value))

// 选字区可选项与高亮 key。
const pickerItems = computed(() => items.value.map((item) => ({
  key: itemKey(item),
  label: itemKey(item),
})))
const activeKey = computed(() => (
  stage.value === 'hanzi' ? practice.currentChar.value : itemKey(traceItem.value)
))

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

// 切换分组：立即载入该分组首项，避免停留在旧字。
watch(activeGroup, (key) => {
  const first = LESSON_GROUPS[key].items[0]
  if (LESSON_GROUPS[key].stage === 'hanzi') {
    practice.pickPreset(first.char)
  } else {
    traceItem.value = first
  }
})

function handlePick(key) {
  const item = items.value.find((it) => itemKey(it) === key)
  if (!item) return
  if (stage.value === 'hanzi') {
    practice.pickPreset(item.char)
  } else {
    traceItem.value = item
  }
}

function updateInputChar(value) {
  practice.inputChar.value = value
}

function submitCharacter() {
  practice.submitChar()
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

// 发音：写汉字读当前字，数字读对应汉字，拼音读助记字。
function pronounce() {
  const item = currentItem.value
  if (!item) return
  if (stage.value === 'hanzi') speak(practice.currentChar.value)
  else if (activeGroup.value === 'numbers') speak(item.hanzi)
  else speak(item.mnemonic)
}
</script>

<template>
  <main class="hanzi-game-page">
    <ModeTabs
      :groups="GROUP_ORDER"
      :active="activeGroup"
      @update:active="activeGroup = $event"
    />

    <section class="region region-stage" data-region="stage">
      <PracticeStage
        v-show="stage === 'hanzi'"
        :writer-target="setWriterTarget"
        :current-char="practice.currentChar.value"
        :mode="practice.mode.value"
        :group-mode="activeGroup"
        :loop="practice.loop.value"
        :loading="practice.loading.value"
        :has-data="practice.hasData.value"
        :status="practice.status.value"
        :total-strokes="practice.totalStrokes.value"
        :current-stroke="practice.currentStroke.value"
        :total-mistakes="practice.totalMistakes.value"
        :quiz-done="practice.quizDone.value"
        :pinyin="commonItem?.pinyin || ''"
        :meaning="commonItem?.meaning || ''"
        :tts-available="ttsAvailable"
        :mission-title="missionTitle"
        :goal-text="missionGoal"
        :reward-text="missionRewardText"
        :performance-tier="missionTier"
        :disabled="!canStartMission"
        @play="practice.playAnimation"
        @toggle-loop="practice.toggleLoop"
        @start-quiz="startMission"
        @speak="pronounce"
      />
      <TraceStage
        v-show="stage !== 'hanzi'"
        :glyph="traceItem.glyph"
        :pinyin="traceItem.pinyin || ''"
        :hanzi="traceItem.hanzi || ''"
        :number="traceItem.number ?? null"
        :type-tag="traceItem.type || ''"
        :group-mode="activeGroup"
        :tts-available="ttsAvailable"
        @speak="pronounce"
      />
    </section>

    <section class="region region-picker" data-region="picker">
      <CharacterPicker
        :items="pickerItems"
        :active-key="activeKey"
        :loading="practice.loading.value"
        :allow-custom="stage === 'hanzi'"
        :input-char="practice.inputChar.value"
        @update:input-char="updateInputChar"
        @submit="submitCharacter"
        @pick="handlePick"
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

.region-stage :deep(.practice-stage),
.region-stage :deep(.trace-stage) {
  height: 100%;
}

@media (min-width: 768px) {
  .hanzi-game-page {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1.3fr) minmax(18rem, 0.7fr);
    grid-template-areas:
      'tabs tabs'
      'stage picker';
    align-items: start;
    padding-bottom: 2rem;
  }

  .mode-tabs {
    grid-area: tabs;
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
      'tabs tabs'
      'picker stage';
  }
}
</style>
