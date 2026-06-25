<script setup>
const props = defineProps({
  chapterTitle: {
    type: String,
    required: true,
  },
  levels: {
    type: Array,
    default: () => [],
  },
  activeLevel: {
    type: Number,
    default: 1,
  },
  expanded: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <section class="chapter-map">
    <div class="heading">
      <div>
        <p>{{ props.chapterTitle }}</p>
        <h2>星图关卡</h2>
      </div>
      <button type="button" @click="emit('toggle')">
        {{ props.expanded ? '收起' : '展开' }}
      </button>
    </div>

    <ol v-if="props.expanded" class="levels">
      <li
        v-for="level in props.levels"
        :key="level.id"
        class="level"
        :class="{ active: level.id === props.activeLevel }"
      >
        <span>{{ level.name }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.chapter-map {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #14213d, #223a5e);
  color: #fff;
}

.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

p,
h2 {
  margin: 0;
}

p {
  color: rgba(255, 255, 255, 0.72);
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 0.95rem;
  font: inherit;
  color: #14213d;
  background: #f5d76e;
}

.levels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.level {
  display: grid;
  place-items: center;
  min-height: 4.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.12);
}

.level.active {
  background: rgba(245, 215, 110, 0.95);
  color: #14213d;
}
</style>
