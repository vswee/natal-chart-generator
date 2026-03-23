<template>
  <section class="panel">
    <div class="panel-inner">
      <h2 class="section-title">Chart summary</h2>
      <p class="section-copy">
        These gauges are derived from the placement and aspect mix.
      </p>

      <div class="gauge-list">
        <article v-for="item in gaugeItems" :key="item.key" class="gauge-card">
          <p class="gauge-label">{{ item.label }}</p>
          <div class="gauge-track">
            <div class="gauge-fill" :style="{ width: item.value + '%' }"></div>
          </div>
          <div class="gauge-value">{{ item.value }}</div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true
  }
})

const gaugeItems = computed(() => [
  { key: 'emotionalIntensity', label: 'Emotional intensity', value: props.metrics.emotionalIntensity },
  { key: 'harmony', label: 'Internal harmony', value: props.metrics.harmony },
  { key: 'relationshipFocus', label: 'Relationship focus', value: props.metrics.relationshipFocus }
])
</script>
