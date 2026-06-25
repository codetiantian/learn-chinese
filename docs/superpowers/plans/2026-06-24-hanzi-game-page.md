# Hanzi Game Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current Hanzi practice page into a mobile-first, game-style mission screen while keeping the existing animation and writing practice flow intact.

**Architecture:** Group the feature under `src/features/hanzi-game/`, extract HanziWriter lifecycle code into `src/composables/useHanziPractice.js`, keep progression rules in a small pure helper module, and compose the UI from focused presentational components around one container page. Mobile layout is the source of truth; desktop only expands the same structure.

**Tech Stack:** Vue 3, Vite, Hanzi Writer, Vitest, Vue Test Utils, jsdom

---

## File Structure

**Create:**

- `src/composables/useHanziPractice.js`
- `src/features/hanzi-game/gameProgress.js`
- `src/features/hanzi-game/HanziGamePage.vue`
- `src/features/hanzi-game/components/GameHeader.vue`
- `src/features/hanzi-game/components/CharacterPicker.vue`
- `src/features/hanzi-game/components/PracticeStage.vue`
- `src/features/hanzi-game/components/TaskPanel.vue`
- `src/features/hanzi-game/components/ChapterMap.vue`
- `src/features/hanzi-game/__tests__/gameProgress.test.js`
- `src/features/hanzi-game/__tests__/useHanziPractice.test.js`
- `src/features/hanzi-game/__tests__/HanziGamePage.test.js`
- `vitest.setup.js`

**Modify:**

- `package.json`
- `vite.config.js`
- `src/App.vue`
- `src/assets/base.css`
- `src/assets/main.css`

**Delete after integration is complete:**

- `src/components/HanziPractice.vue`

### Task 1: Add test tooling and pure game-progress helpers

**Files:**

- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `vitest.setup.js`
- Create: `src/features/hanzi-game/gameProgress.js`
- Test: `src/features/hanzi-game/__tests__/gameProgress.test.js`

- [ ] **Step 1: Add the test runner and scripts**

Update `package.json` so the repo can run focused unit tests before any production refactor:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.6.2",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^24.1.1",
    "vite": "^4.5.5",
    "vite-plugin-vue-devtools": "^7.6.1",
    "vitest": "^2.0.5"
  }
}
```

Update `vite.config.js` so Vue SFC tests run in jsdom:

```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
  },
})
```

Create `vitest.setup.js`:

```js
import { afterEach } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
})
```

- [ ] **Step 2: Write the failing helper test**

Create `src/features/hanzi-game/__tests__/gameProgress.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  buildMissionFeedback,
  buildRoundReward,
  getPerformanceTier,
} from '../gameProgress'

describe('getPerformanceTier', () => {
  it('returns perfect for 0 or 1 mistakes', () => {
    expect(getPerformanceTier(0)).toBe('perfect')
    expect(getPerformanceTier(1)).toBe('perfect')
  })

  it('returns strong for 2 to 4 mistakes', () => {
    expect(getPerformanceTier(2)).toBe('strong')
    expect(getPerformanceTier(4)).toBe('strong')
  })

  it('returns complete for 5 or more mistakes', () => {
    expect(getPerformanceTier(5)).toBe('complete')
  })
})

describe('buildRoundReward', () => {
  it('awards more stars for a perfect clear', () => {
    expect(buildRoundReward('perfect')).toEqual({ stars: 10, streakDelta: 1 })
    expect(buildRoundReward('strong')).toEqual({ stars: 6, streakDelta: 1 })
    expect(buildRoundReward('complete')).toEqual({ stars: 3, streakDelta: 1 })
  })
})

describe('buildMissionFeedback', () => {
  it('formats a completed mission summary for the task panel', () => {
    expect(buildMissionFeedback({ character: '我', mistakes: 3 })).toEqual({
      statusText: '完成「我」书写任务',
      goalText: '本轮错误 3 次，继续巩固可拿更高评价',
      rewardText: '获得 6 颗星星，连胜 +1',
      performanceTier: 'strong',
    })
  })
})
```

- [ ] **Step 3: Run the helper test to verify it fails**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/gameProgress.test.js
```

Expected: FAIL with `Cannot find module '../gameProgress'` or missing export errors.

- [ ] **Step 4: Write the minimal helper implementation**

Create `src/features/hanzi-game/gameProgress.js`:

```js
export function getPerformanceTier(mistakes) {
  if (mistakes <= 1) return 'perfect'
  if (mistakes <= 4) return 'strong'
  return 'complete'
}

export function buildRoundReward(tier) {
  if (tier === 'perfect') return { stars: 10, streakDelta: 1 }
  if (tier === 'strong') return { stars: 6, streakDelta: 1 }
  return { stars: 3, streakDelta: 1 }
}

export function buildMissionFeedback({ character, mistakes }) {
  const performanceTier = getPerformanceTier(mistakes)
  const reward = buildRoundReward(performanceTier)

  return {
    statusText: `完成「${character}」书写任务`,
    goalText:
      performanceTier === 'perfect'
        ? '本轮几乎零失误，继续保持这个节奏'
        : performanceTier === 'strong'
          ? `本轮错误 ${mistakes} 次，继续巩固可拿更高评价`
          : `本轮错误 ${mistakes} 次，完成挑战，建议再练一次`,
    rewardText: `获得 ${reward.stars} 颗星星，连胜 +${reward.streakDelta}`,
    performanceTier,
  }
}
```

- [ ] **Step 5: Run the helper test to verify it passes**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/gameProgress.test.js
```

Expected: PASS with 3 passing tests.

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.js vitest.setup.js src/features/hanzi-game/gameProgress.js src/features/hanzi-game/__tests__/gameProgress.test.js
git commit -m "test: add hanzi game progress helpers"
```

### Task 2: Extract HanziWriter lifecycle into a composable

**Files:**

- Create: `src/composables/useHanziPractice.js`
- Test: `src/features/hanzi-game/__tests__/useHanziPractice.test.js`

- [ ] **Step 1: Write the failing composable test**

Create `src/features/hanzi-game/__tests__/useHanziPractice.test.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useHanziPractice } from '@/composables/useHanziPractice'

function createWriterStub() {
  return {
    animateCharacter: vi.fn(),
    cancelQuiz: vi.fn(),
    loopCharacterAnimation: vi.fn(),
    quiz: vi.fn(),
    setCharacter: vi.fn(() => Promise.resolve()),
    showCharacter: vi.fn(),
  }
}

describe('useHanziPractice', () => {
  it('starts in animation mode and can switch into quiz mode', async () => {
    const writer = createWriterStub()
    const targetRef = ref({ innerHTML: '' })

    const state = useHanziPractice({
      targetRef,
      createWriter: vi.fn(() => writer),
      initialChar: '我',
    })

    state.mount()
    expect(state.currentChar.value).toBe('我')

    state.mode.value = 'quiz'
    await nextTick()

    expect(writer.quiz).toHaveBeenCalledTimes(1)
    expect(state.status.value).toBe('请按笔画顺序在田字格中书写')
  })

  it('updates completion state from the writer callbacks', () => {
    const writer = createWriterStub()
    const targetRef = ref({ innerHTML: '' })

    const state = useHanziPractice({
      targetRef,
      createWriter: vi.fn((el, char, options) => {
        options.onLoadCharDataSuccess({ strokes: ['a', 'b', 'c'] })
        writer.quiz.mockImplementation(({ onComplete }) => {
          onComplete({ character: '我', totalMistakes: 2 })
        })
        return writer
      }),
      initialChar: '我',
    })

    state.mount()
    state.startQuiz()

    expect(state.quizDone.value).toBe(true)
    expect(state.totalStrokes.value).toBe(3)
    expect(state.totalMistakes.value).toBe(2)
  })
})
```

- [ ] **Step 2: Run the composable test to verify it fails**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/useHanziPractice.test.js
```

Expected: FAIL because `useHanziPractice` does not exist yet.

- [ ] **Step 3: Write the minimal composable**

Create `src/composables/useHanziPractice.js`:

```js
import { onBeforeUnmount, ref, watch } from 'vue'
import HanziWriter from 'hanzi-writer'

export function useHanziPractice({
  targetRef,
  createWriter = (el, char, options) => HanziWriter.create(el, char, options),
  initialChar = '我',
}) {
  const inputChar = ref(initialChar)
  const currentChar = ref(initialChar)
  const mode = ref('animate')
  const loop = ref(false)
  const loading = ref(false)
  const hasData = ref(true)
  const status = ref('准备就绪')
  const totalStrokes = ref(0)
  const currentStroke = ref(0)
  const totalMistakes = ref(0)
  const quizDone = ref(false)

  let writer = null

  function ensureWriter() {
    if (writer) return writer
    if (!targetRef.value) return null

    targetRef.value.innerHTML = ''
    writer = createWriter(targetRef.value, currentChar.value, {
      width: 320,
      height: 320,
      padding: 20,
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 400,
      strokeColor: '#5b7cff',
      highlightColor: '#ffd45e',
      outlineColor: '#bfd3ff',
      drawingColor: '#ff8b4a',
      onLoadCharDataSuccess: (data) => {
        loading.value = false
        hasData.value = true
        totalStrokes.value = data?.strokes?.length || 0
        status.value = `「${currentChar.value}」共 ${totalStrokes.value} 笔`
      },
      onLoadCharDataError: () => {
        loading.value = false
        hasData.value = false
        totalStrokes.value = 0
        status.value = `「${currentChar.value}」暂无笔画数据，请切换其他任务`
      },
    })

    return writer
  }

  function startQuiz() {
    if (!ensureWriter() || !hasData.value) return
    quizDone.value = false
    totalMistakes.value = 0
    currentStroke.value = 0

    writer.quiz({
      leniency: 1.2,
      showHintAfterMisses: 3,
      markStrokeCorrectAfterMisses: 6,
      onMistake: (summary) => {
        totalMistakes.value = summary.totalMistakes
        status.value = `第 ${summary.strokeNum + 1} 笔仍需调整`
      },
      onCorrectStroke: (summary) => {
        currentStroke.value = summary.strokeNum + 1
        totalMistakes.value = summary.totalMistakes
        status.value =
          summary.strokesRemaining > 0
            ? `已完成第 ${summary.strokeNum + 1} 笔`
            : '最后一笔完成'
      },
      onComplete: (summary) => {
        quizDone.value = true
        totalMistakes.value = summary.totalMistakes
        status.value = `完成「${summary.character}」! 本次共错 ${summary.totalMistakes} 次`
      },
    })

    status.value = '请按笔画顺序在田字格中书写'
  }

  function applyMode() {
    if (!ensureWriter() || !hasData.value) return
    if (mode.value === 'quiz') {
      startQuiz()
      return
    }

    writer.cancelQuiz?.()
    writer.showCharacter?.()
    status.value = `「${currentChar.value}」共 ${totalStrokes.value} 笔，点击播放查看笔顺`
  }

  function playAnimation() {
    if (!ensureWriter() || mode.value !== 'animate' || !hasData.value) return
    if (loop.value) writer.loopCharacterAnimation?.()
    else writer.animateCharacter?.()
    status.value = '正在演示笔画顺序...'
  }

  function toggleLoop() {
    loop.value = !loop.value
    if (loop.value && mode.value === 'animate') playAnimation()
  }

  async function submitChar() {
    const nextChar = Array.from((inputChar.value || '').trim())[0]
    if (!nextChar || !ensureWriter()) return
    if (nextChar === currentChar.value) {
      applyMode()
      return
    }

    loading.value = true
    currentChar.value = nextChar
    await writer.setCharacter(nextChar)

    if (mode.value === 'quiz') startQuiz()
    else if (loop.value) writer.loopCharacterAnimation?.()
  }

  function pickPreset(char) {
    inputChar.value = char
    return submitChar()
  }

  function mount() {
    ensureWriter()
    writer?.animateCharacter?.()
  }

  watch(mode, applyMode)
  onBeforeUnmount(() => {
    writer?.cancelQuiz?.()
  })

  return {
    inputChar,
    currentChar,
    mode,
    loop,
    loading,
    hasData,
    status,
    totalStrokes,
    currentStroke,
    totalMistakes,
    quizDone,
    mount,
    ensureWriter,
    startQuiz,
    playAnimation,
    toggleLoop,
    submitChar,
    pickPreset,
  }
}
```

- [ ] **Step 4: Run the composable test to verify it passes**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/useHanziPractice.test.js
```

Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useHanziPractice.js src/features/hanzi-game/__tests__/useHanziPractice.test.js
git commit -m "refactor: extract hanzi practice composable"
```

### Task 3: Build the header, picker, and chapter-map shell

**Files:**

- Create: `src/features/hanzi-game/components/GameHeader.vue`
- Create: `src/features/hanzi-game/components/CharacterPicker.vue`
- Create: `src/features/hanzi-game/components/ChapterMap.vue`
- Test: `src/features/hanzi-game/__tests__/HanziGamePage.test.js`

- [ ] **Step 1: Write the failing component-shell test**

Start `src/features/hanzi-game/__tests__/HanziGamePage.test.js` with the shell expectations:

```js
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HanziGamePage from '../HanziGamePage.vue'

describe('HanziGamePage shell', () => {
  it('renders the mobile-first header, mission picker, and chapter map', () => {
    const wrapper = mount(HanziGamePage, {
      global: {
        stubs: {
          PracticeStage: true,
          TaskPanel: true,
        },
      },
    })

    expect(wrapper.text()).toContain('第 1 章')
    expect(wrapper.text()).toContain('今日进度')
    expect(wrapper.text()).toContain('快速任务')
    expect(wrapper.text()).toContain('星图关卡')
  })
})
```

- [ ] **Step 2: Run the page-shell test to verify it fails**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/HanziGamePage.test.js
```

Expected: FAIL because `HanziGamePage.vue` does not exist yet.

- [ ] **Step 3: Write the static shell components and minimal page container**

Create `src/features/hanzi-game/components/GameHeader.vue`:

```vue
<script setup>
defineProps({
  chapterTitle: { type: String, required: true },
  dailyProgress: { type: Number, required: true },
  streak: { type: Number, required: true },
  stars: { type: Number, required: true },
})
</script>

<template>
  <section class="game-header">
    <div>
      <p class="eyebrow">今日进度</p>
      <h1>{{ chapterTitle }}</h1>
    </div>
    <div class="stats">
      <span>进度 {{ dailyProgress }}%</span>
      <span>连胜 x{{ streak }}</span>
      <span>星星 {{ stars }}</span>
    </div>
  </section>
</template>
```

Create `src/features/hanzi-game/components/CharacterPicker.vue`:

```vue
<script setup>
defineProps({
  inputChar: { type: String, required: true },
  loading: { type: Boolean, required: true },
  presets: { type: Array, required: true },
  currentChar: { type: String, required: true },
})

const emit = defineEmits(['update:inputChar', 'submit', 'pick'])
</script>

<template>
  <section class="picker-card">
    <p class="eyebrow">快速任务</p>
    <div class="picker-row">
      <input
        :value="inputChar"
        maxlength="1"
        placeholder="输入汉字"
        @input="emit('update:inputChar', $event.target.value)"
        @keyup.enter="emit('submit')"
      >
      <button :disabled="loading" @click="emit('submit')">
        {{ loading ? '载入中...' : '进入任务' }}
      </button>
    </div>
    <div class="preset-row">
      <button
        v-for="char in presets"
        :key="char"
        :class="{ active: char === currentChar }"
        @click="emit('pick', char)"
      >
        {{ char }}
      </button>
    </div>
  </section>
</template>
```

Create `src/features/hanzi-game/components/ChapterMap.vue`:

```vue
<script setup>
defineProps({
  chapterTitle: { type: String, required: true },
  levels: { type: Array, required: true },
  activeLevel: { type: Number, required: true },
  expanded: { type: Boolean, required: true },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <section class="chapter-map">
    <div class="map-head">
      <div>
        <p class="eyebrow">星图关卡</p>
        <h2>{{ chapterTitle }}</h2>
      </div>
      <button @click="emit('toggle')">{{ expanded ? '收起' : '展开' }}</button>
    </div>

    <div class="map-row" :class="{ expanded }">
      <button
        v-for="level in levels"
        :key="level.id"
        class="map-node"
        :class="{ active: level.id === activeLevel }"
      >
        {{ level.label }}
      </button>
    </div>
  </section>
</template>
```

Create the minimal `src/features/hanzi-game/HanziGamePage.vue` shell:

```vue
<script setup>
import { ref } from 'vue'
import ChapterMap from './components/ChapterMap.vue'
import CharacterPicker from './components/CharacterPicker.vue'
import GameHeader from './components/GameHeader.vue'

const inputChar = ref('我')
const loading = ref(false)
const currentChar = ref('我')
const mapExpanded = ref(false)
const presets = ['你', '好', '学', '习', '中', '国', '我', '字']
const levels = [
  { id: 1, label: '1-1' },
  { id: 2, label: '1-2' },
  { id: 3, label: '1-3' },
]
</script>

<template>
  <main class="hanzi-game-page">
    <GameHeader chapter-title="第 1 章 · 新手星环" :daily-progress="58" :streak="5" :stars="26" />
    <CharacterPicker
      :input-char="inputChar"
      :loading="loading"
      :presets="presets"
      :current-char="currentChar"
      @update:input-char="inputChar = $event"
    />
    <ChapterMap
      chapter-title="第 1 章 · 新手星环"
      :levels="levels"
      :active-level="1"
      :expanded="mapExpanded"
      @toggle="mapExpanded = !mapExpanded"
    />
  </main>
</template>
```

- [ ] **Step 4: Run the page-shell test to verify it passes**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/HanziGamePage.test.js
```

Expected: PASS with 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add src/features/hanzi-game/HanziGamePage.vue src/features/hanzi-game/components/GameHeader.vue src/features/hanzi-game/components/CharacterPicker.vue src/features/hanzi-game/components/ChapterMap.vue src/features/hanzi-game/__tests__/HanziGamePage.test.js
git commit -m "feat: add hanzi game page shell"
```

### Task 4: Add the practice stage, task panel, and full container wiring

**Files:**

- Modify: `src/features/hanzi-game/HanziGamePage.vue`
- Create: `src/features/hanzi-game/components/PracticeStage.vue`
- Create: `src/features/hanzi-game/components/TaskPanel.vue`
- Modify: `src/features/hanzi-game/__tests__/HanziGamePage.test.js`

- [ ] **Step 1: Extend the failing page test for live practice wiring**

Append to `src/features/hanzi-game/__tests__/HanziGamePage.test.js`:

```js
import { vi } from 'vitest'

vi.mock('@/composables/useHanziPractice', () => ({
  useHanziPractice: () => ({
    inputChar: { value: '我' },
    currentChar: { value: '我' },
    mode: { value: 'animate' },
    loop: { value: false },
    loading: { value: false },
    hasData: { value: true },
    status: { value: '准备就绪' },
    totalStrokes: { value: 7 },
    currentStroke: { value: 0 },
    totalMistakes: { value: 0 },
    quizDone: { value: false },
    mount: vi.fn(),
    playAnimation: vi.fn(),
    startQuiz: vi.fn(),
    toggleLoop: vi.fn(),
    submitChar: vi.fn(),
    pickPreset: vi.fn(),
  }),
}))

it('shows the mission card and stage actions for the active character', () => {
  const wrapper = mount(HanziGamePage)

  expect(wrapper.text()).toContain('完成「我」的书写练习')
  expect(wrapper.text()).toContain('目标：错误少于 5 次')
  expect(wrapper.text()).toContain('动画演示')
  expect(wrapper.text()).toContain('开始闯关')
})
```

- [ ] **Step 2: Run the page test to verify it fails**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/HanziGamePage.test.js
```

Expected: FAIL because the container does not yet render the mission card or stage actions.

- [ ] **Step 3: Implement the stage, task panel, and container logic**

Create `src/features/hanzi-game/components/PracticeStage.vue`:

```vue
<script setup>
defineProps({
  mode: { type: String, required: true },
  hasData: { type: Boolean, required: true },
  quizDone: { type: Boolean, required: true },
  currentChar: { type: String, required: true },
  totalStrokes: { type: Number, required: true },
})

defineEmits(['play', 'startQuiz', 'restartQuiz', 'setMode'])
</script>

<template>
  <section class="stage-card">
    <div class="stage-head">
      <div>
        <p class="eyebrow">主练习舞台</p>
        <h2>当前任务字：{{ currentChar }}</h2>
      </div>
      <span v-if="quizDone" class="done-badge">任务完成</span>
    </div>

    <div class="stage-mode">
      <button :class="{ active: mode === 'animate' }" @click="$emit('setMode', 'animate')">动画演示</button>
      <button :class="{ active: mode === 'quiz' }" @click="$emit('setMode', 'quiz')">开始闯关</button>
    </div>

    <div class="writer-shell">
      <div class="writer-grid">
        <slot />
      </div>
    </div>

    <div class="stage-actions">
      <button :disabled="!hasData" @click="$emit('play')">播放笔顺</button>
      <button :disabled="!hasData" @click="mode === 'quiz' ? $emit('restartQuiz') : $emit('startQuiz')">
        {{ mode === 'quiz' ? '重新挑战' : '进入书写' }}
      </button>
    </div>

    <p class="stage-meta">本字共 {{ totalStrokes }} 笔</p>
  </section>
</template>
```

Create `src/features/hanzi-game/components/TaskPanel.vue`:

```vue
<script setup>
defineProps({
  missionTitle: { type: String, required: true },
  goalText: { type: String, required: true },
  statusText: { type: String, required: true },
  rewardText: { type: String, required: true },
  totalMistakes: { type: Number, required: true },
  currentStroke: { type: Number, required: true },
  totalStrokes: { type: Number, required: true },
})
</script>

<template>
  <section class="task-panel">
    <article class="task-card">
      <p class="eyebrow">当前任务</p>
      <h3>{{ missionTitle }}</h3>
      <p>{{ goalText }}</p>
    </article>

    <article class="task-card">
      <p class="eyebrow">实时反馈</p>
      <p>{{ statusText }}</p>
      <p>进度：{{ currentStroke }} / {{ totalStrokes }}</p>
      <p>错误：{{ totalMistakes }}</p>
    </article>

    <article class="task-card reward">
      <p class="eyebrow">任务奖励</p>
      <p>{{ rewardText }}</p>
    </article>
  </section>
</template>
```

Update `src/features/hanzi-game/HanziGamePage.vue`:

```vue
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHanziPractice } from '@/composables/useHanziPractice'
import { buildMissionFeedback } from './gameProgress'
import ChapterMap from './components/ChapterMap.vue'
import CharacterPicker from './components/CharacterPicker.vue'
import GameHeader from './components/GameHeader.vue'
import PracticeStage from './components/PracticeStage.vue'
import TaskPanel from './components/TaskPanel.vue'

const writerTarget = ref(null)
const mapExpanded = ref(false)
const streak = ref(5)
const stars = ref(26)
const presets = ['你', '好', '学', '习', '中', '国', '我', '字']
const levels = [
  { id: 1, label: '1-1' },
  { id: 2, label: '1-2' },
  { id: 3, label: '1-3' },
]

const practice = useHanziPractice({ targetRef: writerTarget, initialChar: '我' })

const missionTitle = computed(() => `完成「${practice.currentChar.value}」的书写练习`)
const missionFeedback = computed(() =>
  buildMissionFeedback({
    character: practice.currentChar.value,
    mistakes: practice.totalMistakes.value,
  }),
)

onMounted(() => {
  practice.mount()
})
</script>

<template>
  <main class="hanzi-game-page">
    <GameHeader chapter-title="第 1 章 · 新手星环" :daily-progress="58" :streak="streak" :stars="stars" />

    <CharacterPicker
      :input-char="practice.inputChar.value"
      :loading="practice.loading.value"
      :presets="presets"
      :current-char="practice.currentChar.value"
      @update:input-char="practice.inputChar.value = $event"
      @submit="practice.submitChar()"
      @pick="practice.pickPreset($event)"
    />

    <PracticeStage
      :mode="practice.mode.value"
      :has-data="practice.hasData.value"
      :quiz-done="practice.quizDone.value"
      :current-char="practice.currentChar.value"
      :total-strokes="practice.totalStrokes.value"
      @set-mode="practice.mode.value = $event"
      @play="practice.playAnimation()"
      @start-quiz="practice.startQuiz()"
      @restart-quiz="practice.startQuiz()"
    >
      <div ref="writerTarget" class="writer-target"></div>
    </PracticeStage>

    <TaskPanel
      :mission-title="missionTitle"
      goal-text="目标：错误少于 5 次"
      :status-text="practice.status.value"
      :reward-text="missionFeedback.rewardText"
      :total-mistakes="practice.totalMistakes.value"
      :current-stroke="practice.currentStroke.value"
      :total-strokes="practice.totalStrokes.value"
    />

    <ChapterMap
      chapter-title="第 1 章 · 新手星环"
      :levels="levels"
      :active-level="1"
      :expanded="mapExpanded"
      @toggle="mapExpanded = !mapExpanded"
    />
  </main>
</template>
```

- [ ] **Step 4: Run the page test to verify it passes**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/HanziGamePage.test.js
```

Expected: PASS with both shell and mission-card tests green.

- [ ] **Step 5: Commit**

```bash
git add src/features/hanzi-game/HanziGamePage.vue src/features/hanzi-game/components/PracticeStage.vue src/features/hanzi-game/components/TaskPanel.vue src/features/hanzi-game/__tests__/HanziGamePage.test.js
git commit -m "feat: wire hanzi game mission stage"
```

### Task 5: Integrate the page, replace the legacy component, and apply mobile-first styling

**Files:**

- Modify: `src/App.vue`
- Modify: `src/assets/base.css`
- Modify: `src/assets/main.css`
- Modify: `src/features/hanzi-game/HanziGamePage.vue`
- Delete: `src/components/HanziPractice.vue`

- [ ] **Step 1: Extend the failing page test for responsive class hooks**

Append to `src/features/hanzi-game/__tests__/HanziGamePage.test.js`:

```js
it('uses the mobile-first page regions in the expected order', () => {
  const wrapper = mount(HanziGamePage)
  const sections = wrapper.findAll('main > *').map((node) => node.classes().join(' '))

  expect(sections[0]).toContain('game-header')
  expect(sections[1]).toContain('picker-card')
  expect(sections[2]).toContain('stage-card')
  expect(sections[3]).toContain('task-panel')
  expect(sections[4]).toContain('chapter-map')
})
```

- [ ] **Step 2: Run the page test to verify it fails**

Run:

```bash
npm run test:run -- src/features/hanzi-game/__tests__/HanziGamePage.test.js
```

Expected: FAIL until the container root and section class hooks match the planned region order.

- [ ] **Step 3: Implement the final app swap and responsive styles**

Update `src/App.vue`:

```vue
<script setup>
import HanziGamePage from './features/hanzi-game/HanziGamePage.vue'
</script>

<template>
  <HanziGamePage />
</template>
```

Update `src/assets/main.css`:

```css
@import './base.css';

#app {
  min-height: 100vh;
}
```

Update `src/assets/base.css` to define the game palette and page scaffolding:

```css
:root {
  --bg-sky-top: #4f79ff;
  --bg-sky-bottom: #9ee1ff;
  --panel-surface: rgba(255, 255, 255, 0.92);
  --panel-border: rgba(255, 255, 255, 0.44);
  --text-strong: #214266;
  --text-soft: #6a88b0;
  --accent-gold: #ffd45e;
  --accent-orange: #ff8b4a;
  --accent-purple: #7d54ff;
  --success-green: #2bb673;
  --shadow-soft: 0 16px 40px rgba(31, 84, 168, 0.16);
  font-family: 'Trebuchet MS', 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text-strong);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.55), transparent 35%),
    linear-gradient(180deg, var(--bg-sky-top), var(--bg-sky-bottom));
}

button,
input {
  font: inherit;
}
```

Add scoped styles to `src/features/hanzi-game/HanziGamePage.vue` that keep the mobile order and upgrade to desktop:

```vue
<style scoped>
.hanzi-game-page {
  display: grid;
  gap: 12px;
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

:deep(.game-header),
:deep(.picker-card),
:deep(.stage-card),
:deep(.task-panel),
:deep(.chapter-map) {
  border-radius: 24px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  box-shadow: var(--shadow-soft);
  padding: 16px;
}

:deep(.writer-shell) {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

:deep(.writer-grid) {
  width: min(78vw, 320px);
  aspect-ratio: 1;
  border-radius: 24px;
  background:
    linear-gradient(rgba(125, 84, 255, 0.18), rgba(125, 84, 255, 0.18)) no-repeat center / 1px 100%,
    linear-gradient(rgba(125, 84, 255, 0.18), rgba(125, 84, 255, 0.18)) no-repeat center / 100% 1px,
    #f7f3ff;
}

:deep(.writer-target svg) {
  width: 100%;
  height: 100%;
  display: block;
}

@media (min-width: 900px) {
  .hanzi-game-page {
    max-width: 1180px;
    grid-template-columns: 280px minmax(0, 1fr);
    grid-template-areas:
      'map header'
      'map picker'
      'map stage'
      'map task';
    align-items: start;
  }

  :deep(.game-header) { grid-area: header; }
  :deep(.picker-card) { grid-area: picker; }
  :deep(.stage-card) { grid-area: stage; }
  :deep(.task-panel) { grid-area: task; }
  :deep(.chapter-map) { grid-area: map; position: sticky; top: 16px; }
}
</style>
```

Delete the legacy file:

```bash
rm src/components/HanziPractice.vue
```

- [ ] **Step 4: Run the full verification suite**

Run:

```bash
npm run test:run
npm run build
```

Expected:

- `vitest run` finishes with all new tests passing
- `vite build` finishes successfully and outputs the production bundle

- [ ] **Step 5: Commit**

```bash
git add src/App.vue src/assets/base.css src/assets/main.css src/features/hanzi-game/HanziGamePage.vue src/features/hanzi-game/components src/features/hanzi-game/__tests__ src/composables/useHanziPractice.js src/features/hanzi-game/gameProgress.js package.json vite.config.js vitest.setup.js
git rm src/components/HanziPractice.vue
git commit -m "feat: ship mobile-first hanzi game page"
```

## Self-Review

- Spec coverage check:
  - Mobile-first layout is covered in Task 5.
  - Component decomposition is covered in Tasks 3 and 4.
  - HanziWriter extraction is covered in Task 2.
  - Lightweight game rules and rewards are covered in Task 1 and Task 4.
  - Desktop expansion from the same structure is covered in Task 5.
- Placeholder scan:
  - No `TODO`, `TBD`, or "implement later" markers remain.
  - Every task includes concrete files, commands, and code.
- Type and naming consistency:
  - `HanziGamePage`, `useHanziPractice`, `buildMissionFeedback`, `PracticeStage`, `TaskPanel`, and `ChapterMap` use the same names across tasks.
