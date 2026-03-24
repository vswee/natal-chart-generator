<template>
  <section class="panel relationship-panel">
    <div class="panel-inner">
      <div class="relationship-header">
        <div>
          <h2 class="section-title">Relationship chart</h2>
          <p class="section-copy">
            Compare two birth charts to surface compatibility, friendship, romance, and chemistry highlights.
          </p>
        </div>
        <div class="relationship-meta">
          <p class="relationship-meta-title">Comparison basis</p>
          <p class="relationship-meta-copy">
            {{ report.chartA.label }}: {{ formatMeta(report.chartA) }}
          </p>
          <p class="relationship-meta-copy">
            {{ report.chartB.label }}: {{ formatMeta(report.chartB) }}
          </p>
          <div class="relationship-actions">
            <button class="subtle-button" type="button" @click="emit('edit')">{{ primaryActionLabel }}</button>
            <button class="subtle-button" type="button" @click="emit('clear')">{{ secondaryActionLabel }}</button>
          </div>
        </div>
      </div>

      <div class="relationship-grid">
        <article v-for="item in report.categories" :key="item.key" class="relationship-card">
          <div class="relationship-score-row">
            <p class="relationship-label">{{ item.label }}</p>
            <p class="relationship-score">{{ item.score }}</p>
          </div>
          <div class="relationship-track">
            <span class="relationship-fill" :style="{ width: item.score + '%' }"></span>
          </div>
          <div class="relationship-summary-row">
            <p :id="`relationship-summary-${item.key}`" class="relationship-summary">
              {{ summaryText(item) }}
            </p>
            <button
              v-if="item.summaryLong && item.summaryLong !== item.summary"
              class="info-toggle"
              type="button"
              :aria-expanded="isExpanded(item.key)"
              :aria-controls="`relationship-summary-${item.key}`"
              :title="isExpanded(item.key) ? 'Show less' : 'Show more'"
              @click="toggle(item.key)"
            >
              info
            </button>
          </div>
          <ul class="relationship-highlights">
            <li v-for="highlight in item.highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  report: {
    type: Object,
    required: true
  },
  primaryActionLabel: {
    type: String,
    default: 'Re-enter data'
  },
  secondaryActionLabel: {
    type: String,
    default: 'Clear data'
  }
})

const emit = defineEmits(['edit', 'clear'])

const expanded = ref({})

function formatMeta(meta) {
  if (!meta) return 'No data'
  const date = meta.date || 'No date'
  const time = meta.time || ''
  const address = meta.address || 'No location'
  return `${date} ${time}`.trim() + ` - ${address}`
}

function isExpanded(key) {
  return Boolean(expanded.value[key])
}

function toggle(key) {
  expanded.value = {
    ...expanded.value,
    [key]: !expanded.value[key]
  }
}

function summaryText(item) {
  if (isExpanded(item.key) && item.summaryLong) return item.summaryLong
  return item.summary
}
</script>
