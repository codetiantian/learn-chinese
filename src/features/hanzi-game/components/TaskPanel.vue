<script setup>
const props = defineProps({
  missionTitle: {
    type: String,
    required: true,
  },
  goalText: {
    type: String,
    required: true,
  },
  statusText: {
    type: String,
    default: '',
  },
  rewardText: {
    type: String,
    default: '',
  },
  performanceTier: {
    type: String,
    default: 'complete',
  },
})

const emit = defineEmits(['start'])
</script>

<template>
  <section class="task-panel">
    <div class="panel-copy">
      <p class="eyebrow">快速任务</p>
      <h2>{{ props.missionTitle }}</h2>
      <p class="goal">{{ props.goalText }}</p>
    </div>

    <div class="feedback-card" :data-tier="props.performanceTier">
      <p>{{ props.statusText }}</p>
      <strong>{{ props.rewardText }}</strong>
    </div>

    <button type="button" class="start-button" @click="emit('start')">
      开始闯关
    </button>
  </section>
</template>

<style scoped>
.task-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #132238, #21415e);
  color: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

.eyebrow,
.goal,
.feedback-card p,
h2 {
  margin: 0;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.goal {
  color: #f5d76e;
}

.feedback-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
}

.feedback-card strong {
  color: #fff4bf;
}

.start-button {
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1rem;
  font: inherit;
  color: #132238;
  background: #f5d76e;
}
</style>
