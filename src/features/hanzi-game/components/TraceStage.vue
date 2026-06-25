<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  glyph: {
    type: String,
    default: '',
  },
  // 数字模式：拼音 / 中文汉字 / 数值
  pinyin: {
    type: String,
    default: '',
  },
  hanzi: {
    type: String,
    default: '',
  },
  number: {
    type: Number,
    default: null,
  },
  // 拼音模式：声母 / 韵母
  typeTag: {
    type: String,
    default: '',
  },
  groupMode: {
    type: String,
    default: 'numbers',
  },
  ttsAvailable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['speak'])

const canvasRef = ref(null)

const isNumbers = computed(() => props.groupMode === 'numbers')
const isPinyin = computed(() => props.groupMode === 'pinyin')

// 数字模式下的计数点阵：最多 10 个点，超过用「…」省略。
const countDots = computed(() => {
  if (props.number == null) return ''
  const dots = Math.min(props.number, 10)
  return '●'.repeat(dots) + (props.number > 10 ? ' …' : '')
})

// 底字字号按字数缩减，避免多字母（ong / ang / 10）横向溢出。
const glyphSize = computed(() => {
  const len = Array.from(props.glyph || '').length
  if (len <= 1) return 'clamp(8rem, 55vw, 15rem)'
  if (len === 2) return 'clamp(5rem, 38vw, 10rem)'
  return 'clamp(3.4rem, 26vw, 7rem)'
})

// —— 自由描红画布 ——
let drawing = false
let lastX = 0
let lastY = 0

function ctx2d() {
  const canvas = canvasRef.value
  return canvas ? canvas.getContext('2d') : null
}

function pointerPos(event) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

function startDraw(event) {
  event.preventDefault()
  drawing = true
  const p = pointerPos(event)
  lastX = p.x
  lastY = p.y
  const ctx = ctx2d()
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
}

function moveDraw(event) {
  if (!drawing) return
  event.preventDefault()
  const p = pointerPos(event)
  const ctx = ctx2d()
  if (ctx) {
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1a9d5b'
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  lastX = p.x
  lastY = p.y
}

function endDraw() {
  drawing = false
}

function clearCanvas() {
  const ctx = ctx2d()
  const canvas = canvasRef.value
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// 切换描红对象时清空画布。
watch(() => props.glyph, clearCanvas)

onBeforeUnmount(() => {
  drawing = false
})
</script>

<template>
  <section class="trace-stage">
    <div class="stage-head">
      <div class="stage-copy">
        <p class="eyebrow">描红临摹</p>
        <h2>「{{ props.glyph }}」练习区</h2>
        <p class="goal">目标：沿灰色底字描画，再点清除重写</p>
      </div>
      <span v-if="props.typeTag" class="stroke-chip">{{ props.typeTag }}</span>
    </div>

    <div class="meta-strip">
      <div class="meta-main">
        <template v-if="isNumbers">
          <p v-if="props.pinyin" class="pinyin">{{ props.pinyin }}</p>
          <p v-if="props.hanzi" class="meaning">汉字 {{ props.hanzi }}</p>
          <p v-if="props.number != null" class="count">
            {{ props.number }}<span v-if="countDots" class="dots"> · {{ countDots }}</span>
          </p>
        </template>
        <template v-else-if="isPinyin">
          <p class="pinyin focus">{{ props.glyph }}</p>
          <p v-if="props.typeTag" class="meaning">{{ props.typeTag }}</p>
        </template>
      </div>
      <button
        type="button"
        class="speak"
        :disabled="!props.ttsAvailable"
        :title="props.ttsAvailable ? '听发音' : '当前浏览器不支持发音'"
        @click="emit('speak')"
      >
        🔊 发音
      </button>
    </div>

    <div class="writer-shell">
      <span class="guide-glyph" :style="{ fontSize: glyphSize }" aria-hidden="true">{{ props.glyph }}</span>
      <canvas
        ref="canvasRef"
        class="trace-canvas"
        width="720"
        height="720"
        @pointerdown="startDraw"
        @pointermove="moveDraw"
        @pointerup="endDraw"
        @pointerleave="endDraw"
        @pointercancel="endDraw"
      />
    </div>

    <div class="action-row">
      <button type="button" class="action ghost" @click="clearCanvas">
        清除重写
      </button>
      <button
        type="button"
        class="action primary"
        :disabled="!props.ttsAvailable"
        @click="emit('speak')"
      >
        🔊 听发音
      </button>
    </div>
  </section>
</template>

<style scoped>
.trace-stage {
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

.meta-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.9rem;
  background: #f3f6fb;
}

.meta-main {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.85rem;
  min-width: 0;
}

.meta-main p {
  margin: 0;
}

.pinyin {
  font-size: 1rem;
  color: var(--color-ink-strong);
  letter-spacing: 0.02em;
}

.pinyin.focus {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-mint);
}

.meaning {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.count {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent-strong);
}

.count .dots {
  color: var(--color-ink-soft);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.speak {
  flex-shrink: 0;
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font: inherit;
  font-size: 0.85rem;
  color: #fff;
  background: var(--color-mint);
}

.speak:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.guide-glyph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  max-width: 92%;
  font-weight: 700;
  line-height: 1;
  color: rgba(20, 34, 58, 0.16);
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

.trace-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
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
