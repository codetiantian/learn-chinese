import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import HanziGamePage from '../HanziGamePage.vue'

const practiceMock = vi.hoisted(() => ({
  useHanziPractice: vi.fn(),
}))

vi.mock('@/composables/useHanziPractice', () => practiceMock)

describe('HanziGamePage', () => {
  let practiceState

  beforeEach(() => {
    practiceState = {
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
    }
    practiceMock.useHanziPractice.mockReset()
    practiceMock.useHanziPractice.mockReturnValue(practiceState)
  })

  test('renders the chapter shell sections', () => {
    const wrapper = mount(HanziGamePage)

    expect(wrapper.text()).toContain('第 1 章')
    expect(wrapper.text()).toContain('今日进度')
    expect(wrapper.text()).toContain('快速任务')
    expect(wrapper.text()).toContain('星图关卡')
  })

  test('renders the mobile-first region order for the page shell', () => {
    const wrapper = mount(HanziGamePage)

    const regionOrder = wrapper
      .findAll('[data-region]')
      .map((node) => node.attributes('data-region'))

    expect(regionOrder).toEqual([
      'header',
      'picker',
      'stage',
      'task-panel',
      'chapter-map',
    ])
  })

  test('renders the mission practice experience from practice state', () => {
    const wrapper = mount(HanziGamePage)

    expect(wrapper.text()).toContain('完成「我」的书写练习')
    expect(wrapper.text()).toContain('目标：错误少于 5 次')
    expect(wrapper.text()).toContain('动画演示')
    expect(wrapper.text()).toContain('开始闯关')
  })

  test('wires mount and page actions into the practice composable', async () => {
    const wrapper = mount(HanziGamePage)

    expect(practiceState.mount).toHaveBeenCalledTimes(1)

    await wrapper.find('input').setValue('学')
    await wrapper.find('input').trigger('keyup.enter')
    expect(practiceState.submitChar).toHaveBeenCalledTimes(1)

    const presetButton = wrapper.findAll('.preset').find((node) => node.text() === '好')
    await presetButton.trigger('click')
    expect(practiceState.pickPreset).toHaveBeenCalledWith('好')

    const buttons = wrapper.findAll('button')
    const playButton = buttons.find((node) => node.text() === '播放动画')
    const loopButton = buttons.find((node) => node.text() === '循环演示')
    const startButtons = buttons.filter((node) => node.text() === '开始闯关')

    await playButton.trigger('click')
    expect(practiceState.playAnimation).toHaveBeenCalledTimes(1)

    await loopButton.trigger('click')
    expect(practiceState.toggleLoop).toHaveBeenCalledTimes(1)

    await startButtons[0].trigger('click')
    expect(practiceState.mode.value).toBe('quiz')

    practiceState.mode.value = 'quiz'
    const remounted = mount(HanziGamePage)
    const remountedStartButtons = remounted.findAll('button').filter((node) => node.text() === '开始闯关')
    await remountedStartButtons[0].trigger('click')
    expect(practiceState.startQuiz).toHaveBeenCalledTimes(1)
  })

  test('reflects earned rewards in the header after a completed mission', () => {
    practiceState.quizDone.value = true
    practiceState.totalMistakes.value = 2

    const wrapper = mount(HanziGamePage)

    expect(wrapper.text()).toContain('24')
    expect(wrapper.text()).toContain('4 天')
    expect(wrapper.text()).toContain('获得 6 颗星星，连胜 +1')
  })
})
