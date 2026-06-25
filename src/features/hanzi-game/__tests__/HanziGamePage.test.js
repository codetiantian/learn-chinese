import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import HanziGamePage from '../HanziGamePage.vue'

const practiceMock = vi.hoisted(() => ({
  useHanziPractice: vi.fn(),
}))

vi.mock('@/composables/useHanziPractice', () => practiceMock)

describe('HanziGamePage', () => {
  beforeEach(() => {
    practiceMock.useHanziPractice.mockReset()
    practiceMock.useHanziPractice.mockReturnValue({
      inputChar: ref('我'),
      currentChar: ref('我'),
      mode: ref('animate'),
      loop: ref(false),
      loading: ref(false),
      hasData: ref(true),
      status: ref('准备就绪'),
      totalStrokes: ref(7),
      currentStroke: ref(0),
      totalMistakes: ref(2),
      quizDone: ref(false),
      mount: vi.fn(),
      ensureWriter: vi.fn(),
      startQuiz: vi.fn(),
      playAnimation: vi.fn(),
      toggleLoop: vi.fn(),
      submitChar: vi.fn(),
      pickPreset: vi.fn(),
    })
  })

  test('renders the chapter shell sections', () => {
    const wrapper = mount(HanziGamePage)

    expect(wrapper.text()).toContain('第 1 章')
    expect(wrapper.text()).toContain('今日进度')
    expect(wrapper.text()).toContain('快速任务')
    expect(wrapper.text()).toContain('星图关卡')
  })

  test('renders the mission practice experience from practice state', () => {
    const wrapper = mount(HanziGamePage)

    expect(wrapper.text()).toContain('完成「我」的书写练习')
    expect(wrapper.text()).toContain('目标：错误少于 5 次')
    expect(wrapper.text()).toContain('动画演示')
    expect(wrapper.text()).toContain('开始闯关')
  })
})
