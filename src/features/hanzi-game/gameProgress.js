const REWARDS_BY_TIER = {
  perfect: {
    stars: 10,
    streakDelta: 1,
  },
  strong: {
    stars: 6,
    streakDelta: 1,
  },
  complete: {
    stars: 3,
    streakDelta: 1,
  },
}

export function getPerformanceTier(mistakes) {
  if (mistakes <= 1) {
    return 'perfect'
  }

  if (mistakes <= 4) {
    return 'strong'
  }

  return 'complete'
}

export function buildRoundReward(performanceTier) {
  return REWARDS_BY_TIER[performanceTier]
}

export function buildMissionFeedback({ character, mistakes }) {
  const performanceTier = getPerformanceTier(mistakes)
  const reward = buildRoundReward(performanceTier)

  return {
    statusText: `完成「${character}」书写任务`,
    goalText: `本轮错误 ${mistakes} 次，继续巩固可拿更高评价`,
    rewardText: `获得 ${reward.stars} 颗星星，连胜 +${reward.streakDelta}`,
    performanceTier,
  }
}
