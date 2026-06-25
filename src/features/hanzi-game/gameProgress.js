const FEEDBACK_BY_TIER = {
  perfect: '完美书写，笔笔精准！',
  strong: '表现出色，继续巩固！',
  complete: '已完成书写，再练几次更好！',
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

export function buildMissionFeedback({ character, mistakes }) {
  const performanceTier = getPerformanceTier(mistakes)

  return {
    statusText: `完成「${character}」书写任务`,
    goalText: `本轮错误 ${mistakes} 次，继续巩固可拿更高评价`,
    rewardText: FEEDBACK_BY_TIER[performanceTier],
    performanceTier,
  }
}
