import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import HanziGamePage from '../HanziGamePage.vue'

describe('HanziGamePage', () => {
  test('renders the chapter shell sections', () => {
    const wrapper = mount(HanziGamePage, {
      global: {
        stubs: {
          PracticeStage: {
            template: '<section>Practice Stage Stub</section>',
          },
          TaskPanel: {
            template: '<section>Task Panel Stub</section>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('第 1 章')
    expect(wrapper.text()).toContain('今日进度')
    expect(wrapper.text()).toContain('快速任务')
    expect(wrapper.text()).toContain('星图关卡')
  })
})
