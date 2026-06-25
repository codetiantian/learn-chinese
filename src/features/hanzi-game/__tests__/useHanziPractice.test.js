import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { useHanziPractice } from '../../../composables/useHanziPractice'

describe('useHanziPractice', () => {
  const scopes = []

  afterEach(() => {
    while (scopes.length) {
      scopes.pop().stop()
    }
  })

  test('starts with 我 and enters quiz mode through the mode watcher', async () => {
    const writer = {
      quiz: vi.fn(),
      cancelQuiz: vi.fn(),
      showCharacter: vi.fn(),
    }
    const createWriter = vi.fn(() => writer)
    const targetRef = ref({ innerHTML: 'legacy markup' })

    const practice = createScopedPractice({ targetRef, createWriter, initialChar: '我' })

    expect(practice.currentChar.value).toBe('我')

    practice.mode.value = 'quiz'
    await nextTick()

    expect(createWriter).toHaveBeenCalledWith(targetRef.value, '我', expect.any(Object))
    expect(targetRef.value.innerHTML).toBe('')
    expect(writer.quiz).toHaveBeenCalledTimes(1)
    expect(practice.status.value).toBe('请按笔画顺序在田字格中书写')
  })

  test('tracks completion state from writer callbacks', async () => {
    let writerOptions
    let quizOptions
    const writer = {
      quiz: vi.fn(() => {
        quizOptions.onComplete({ character: '我', totalMistakes: 2 })
      }),
      cancelQuiz: vi.fn(),
      showCharacter: vi.fn(),
    }
    const createWriter = vi.fn((target, character, options) => {
      writerOptions = options
      options.onLoadCharDataSuccess({ strokes: ['a', 'b', 'c'] })
      return writer
    })
    const targetRef = ref({ innerHTML: '' })

    const practice = createScopedPractice({ targetRef, createWriter })
    writer.quiz.mockImplementation((options) => {
      quizOptions = options
      quizOptions.onComplete({ character: '我', totalMistakes: 2 })
    })

    practice.mode.value = 'quiz'
    await nextTick()

    expect(writerOptions.onLoadCharDataSuccess).toEqual(expect.any(Function))
    expect(practice.quizDone.value).toBe(true)
    expect(practice.totalStrokes.value).toBe(3)
    expect(practice.totalMistakes.value).toBe(2)
  })

  function createScopedPractice(options) {
    const scope = effectScope()
    scopes.push(scope)
    return scope.run(() => useHanziPractice(options))
  }
})
