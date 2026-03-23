<template>
  <section class="panel reading-wrap">
    <div class="panel-inner">
      <h2 class="section-title">Interpretation blocks</h2>
      <p class="section-copy">
        General text blocks are assembled from placements, aspects and summary thresholds.
      </p>
    </div>

    <div class="reading-list">
      <article v-for="item in items" :key="item.id" class="reading-item">
        <h3 class="reading-title">{{ item.title }}</h3>
        <div class="reading-summary-row">
          <p :id="`reading-summary-${item.id}`" class="reading-copy">{{ summaryText(item) }}</p>
          <button
            v-if="item.summary && item.text && item.summary !== item.text"
            class="info-toggle"
            type="button"
            :aria-expanded="isExpanded(item.id)"
            :aria-controls="`reading-summary-${item.id}`"
            :title="isExpanded(item.id) ? 'Show less' : 'Show more'"
            @click="toggle(item.id)"
          >
            info
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true
  }
})

const expanded = ref({})

function isExpanded(id) {
  return Boolean(expanded.value[id])
}

function toggle(id) {
  expanded.value = {
    ...expanded.value,
    [id]: !expanded.value[id]
  }
}

function summaryText(item) {
  if (isExpanded(item.id) && item.text) return item.text
  return item.summary || item.text
}
</script>
