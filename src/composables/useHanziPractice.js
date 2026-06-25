import { onScopeDispose, ref, watch } from 'vue'
import HanziWriter from 'hanzi-writer'

const SIZE = 360
const QUIZ_STATUS = '请按笔画顺序在田字格中书写'

export function useHanziPractice({
  targetRef,
  createWriter = (target, character, options) => HanziWriter.create(target, character, options),
  initialChar = '我',
} = {}) {
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
    if (!targetRef?.value) return null

    targetRef.value.innerHTML = ''
    writer = createWriter(targetRef.value, currentChar.value, {
      width: SIZE,
      height: SIZE,
      padding: 20,
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 400,
      strokeColor: '#1a9d5b',
      highlightColor: '#aaf',
      outlineColor: '#ddd',
      drawingColor: '#1a9d5b',
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
        status.value = `「${currentChar.value}」暂无笔画数据,请换一个字试试`
      },
    })

    return writer
  }

  function startQuiz() {
    const instance = ensureWriter()
    if (!instance || !hasData.value) return

    quizDone.value = false
    totalMistakes.value = 0
    currentStroke.value = 0

    instance.quiz?.({
      leniency: 1.2,
      showHintAfterMisses: 3,
      markStrokeCorrectAfterMisses: 6,
      onMistake: (summary) => {
        totalMistakes.value = summary.totalMistakes
        status.value = `第 ${summary.strokeNum + 1} 笔:方向或形状不对,再试一次(本笔已错 ${summary.mistakesOnStroke} 次)`
      },
      onCorrectStroke: (summary) => {
        currentStroke.value = summary.strokeNum + 1
        totalMistakes.value = summary.totalMistakes
        status.value = summary.strokesRemaining > 0
          ? `第 ${summary.strokeNum + 1} 笔正确!还剩 ${summary.strokesRemaining} 笔`
          : '最后一笔正确!'
      },
      onComplete: (summary) => {
        quizDone.value = true
        totalMistakes.value = summary.totalMistakes
        status.value = `完成「${summary.character}」!本次共写错 ${summary.totalMistakes} 次`
      },
    })
    status.value = QUIZ_STATUS
  }

  function playAnimation() {
    const instance = ensureWriter()
    if (!instance || mode.value !== 'animate' || !hasData.value) return

    if (loop.value) instance.loopCharacterAnimation?.()
    else instance.animateCharacter?.()

    status.value = '正在演示笔画顺序...'
  }

  function applyMode() {
    const instance = ensureWriter()
    if (!instance || !hasData.value) return

    if (mode.value === 'quiz') {
      startQuiz()
      return
    }

    instance.cancelQuiz?.()
    instance.showCharacter?.()
    status.value = `「${currentChar.value}」共 ${totalStrokes.value} 笔,点击「播放动画」查看笔顺`
  }

  function mount() {
    ensureWriter()
    writer?.animateCharacter?.()
    status.value = '正在演示笔画顺序...'
  }

  function toggleLoop() {
    loop.value = !loop.value

    if (loop.value && mode.value === 'animate') {
      playAnimation()
      return
    }

    writer?.showCharacter?.()
  }

  function submitChar() {
    const raw = (inputChar.value || '').trim()
    if (!raw) return

    const nextChar = Array.from(raw)[0]
    inputChar.value = nextChar

    const instance = ensureWriter()
    if (!instance) return

    if (nextChar === currentChar.value) {
      applyMode()
      return
    }

    quizDone.value = false
    totalMistakes.value = 0
    currentStroke.value = 0
    loading.value = true
    currentChar.value = nextChar

    if (typeof instance.setCharacter !== 'function') {
      loading.value = false
      applyMode()
      return
    }

    instance.setCharacter(nextChar)
      .then(() => {
        loading.value = false
        if (mode.value === 'quiz') startQuiz()
        else if (loop.value) instance.loopCharacterAnimation?.()
      })
      .catch(() => {
        loading.value = false
        status.value = `「${nextChar}」加载失败,请检查网络或换一个字`
      })
  }

  function pickPreset(character) {
    inputChar.value = character
    submitChar()
  }

  watch(mode, () => {
    applyMode()
  })

  onScopeDispose(() => {
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
