<template>
  <section class="panel">
    <div class="panel-inner">
      <h2 class="section-title">Relationship, work & life</h2>
      <p class="section-copy">
        A quick read on how the chart emphasizes partnership, vocation, and life direction.
      </p>

      <div class="focus-grid">
        <article v-for="area in areas" :key="area.key" class="focus-card">
          <div class="focus-header">
            <p class="focus-label">{{ area.label }}</p>
            <p class="focus-score">{{ area.score }}</p>
          </div>
          <div class="focus-track">
            <span class="focus-fill" :style="{ width: area.score + '%' }"></span>
          </div>
          <div class="focus-summary-row">
            <p :id="`focus-summary-${area.key}`" class="focus-summary">{{ summaryText(area) }}</p>
            <button
              v-if="area.summaryLong && area.summaryLong !== area.summary"
              class="info-toggle"
              type="button"
              :aria-expanded="isExpanded(area.key)"
              :aria-controls="`focus-summary-${area.key}`"
              :title="isExpanded(area.key) ? 'Show less' : 'Show more'"
              @click="toggle(area.key)"
            >
              info
            </button>
          </div>
          <div class="focus-tags">
            <span v-for="marker in area.markers" :key="marker" class="focus-tag">
              {{ marker }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  areas: {
    type: Array,
    required: true
  }
})

const expanded = ref({})

function isExpanded(key) {
  return Boolean(expanded.value[key])
}

function toggle(key) {
  expanded.value = {
    ...expanded.value,
    [key]: !expanded.value[key]
  }
}

function summaryText(area) {
  if (isExpanded(area.key) && area.summaryLong) return area.summaryLong
  return area.summary
}
</script>
