<script setup>
const props = defineProps({
  chapterTitle: {
    type: String,
    required: true,
  },
  dailyProgress: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <header class="game-header">
    <p class="eyebrow">{{ props.chapterTitle }}</p>
    <h1>今日进度</h1>
    <div class="stats">
      <article>
        <span class="label">完成度</span>
        <strong>{{ props.dailyProgress }}%</strong>
      </article>
      <article>
        <span class="label">连胜</span>
        <strong>{{ props.streak }} 天</strong>
      </article>
      <article>
        <span class="label">星星</span>
        <strong>{{ props.stars }}</strong>
      </article>
    </div>
  </header>
</template>

<style scoped>
.game-header {
  display: grid;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0;
  color: #5f6b7a;
  font-size: 0.95rem;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

article {
  padding: 0.85rem;
  border-radius: 1rem;
  background: #f3f6fb;
}

.label {
  display: block;
  color: #5f6b7a;
  font-size: 0.85rem;
}

strong {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.1rem;
}
</style>
