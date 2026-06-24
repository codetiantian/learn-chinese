import {
  buildMissionFeedback,
  buildRoundReward,
  getPerformanceTier,
} from '../gameProgress'

describe('gameProgress helpers', () => {
  test('maps mistake counts to performance tiers', () => {
    expect(getPerformanceTier(0)).toBe('perfect')
    expect(getPerformanceTier(1)).toBe('perfect')
    expect(getPerformanceTier(2)).toBe('strong')
    expect(getPerformanceTier(4)).toBe('strong')
    expect(getPerformanceTier(5)).toBe('complete')
  })

  test('builds round rewards by performance tier', () => {
    expect(buildRoundReward('perfect')).toEqual({ stars: 10, streakDelta: 1 })
    expect(buildRoundReward('strong')).toEqual({ stars: 6, streakDelta: 1 })
    expect(buildRoundReward('complete')).toEqual({ stars: 3, streakDelta: 1 })
  })

  test('builds mission feedback from character progress', () => {
    expect(buildMissionFeedback({ character: '我', mistakes: 3 })).toEqual({
      statusText: '完成「我」书写任务',
      goalText: '本轮错误 3 次，继续巩固可拿更高评价',
      rewardText: '获得 6 颗星星，连胜 +1',
      performanceTier: 'strong',
    })
  })
})
