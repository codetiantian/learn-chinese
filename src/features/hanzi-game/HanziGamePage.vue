<script setup>
import { ref } from 'vue'

import ChapterMap from './components/ChapterMap.vue'
import CharacterPicker from './components/CharacterPicker.vue'
import GameHeader from './components/GameHeader.vue'

const chapterTitle = '第 1 章'
const dailyProgress = 42
const streak = 3
const stars = 18

const inputChar = ref('我')
const currentChar = ref('我')
const loading = ref(false)
const mapExpanded = ref(true)

const presets = ['我', '你', '好', '学', '中', '国']
const levels = [
  { id: 1, name: '起步' },
  { id: 2, name: '笔顺' },
  { id: 3, name: '识记' },
]

function submitCharacter() {}

function pickCharacter(character) {
  currentChar.value = character
  inputChar.value = character
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
      v-model:input-char="inputChar"
      :loading="loading"
      :presets="presets"
      :current-char="currentChar"
      @submit="submitCharacter"
      @pick="pickCharacter"
    />

    <section class="practice-shell">
      <div class="section-heading">
        <h2>书写舞台</h2>
        <p>{{ chapterTitle }}</p>
      </div>
      <PracticeStage />
    </section>

    <section class="task-shell">
      <div class="section-heading">
        <h2>快速任务</h2>
        <p>保持节奏，连贯闯关</p>
      </div>
      <TaskPanel />
    </section>

    <ChapterMap
      :chapter-title="chapterTitle"
      :levels="levels"
      :active-level="1"
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

.practice-shell,
.task-shell {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-heading h2,
.section-heading p {
  margin: 0;
}

.section-heading p {
  color: #5f6b7a;
  font-size: 0.95rem;
}
</style>
