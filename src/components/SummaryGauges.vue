<template>
  <section class="panel">
    <div class="panel-inner">
      <h2 class="section-title">Chart summary</h2>
      <p class="section-copy">
        These scores come from the overall mix of placements and aspects.
      </p>

      <div class="gauge-list">
        <article v-for="item in gaugeItems" :key="item.key" class="gauge-card">
          <div class="gauge-label-row">
            <p class="gauge-label">{{ item.label }}</p>
            <button
              class="info-toggle"
              type="button"
              :aria-label="`About ${item.label}`"
              @click="openInfo(item.key)"
            >
              info
            </button>
          </div>
          <div class="gauge-track">
            <div class="gauge-fill" :style="{ width: item.value + '%' }"></div>
          </div>
          <div class="gauge-value">{{ item.value }}</div>
        </article>
      </div>
    </div>

    <div v-if="activeInfo" class="modal-overlay" @click.self="closeInfo">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Chart summary</p>
            <h3 class="modal-title">{{ infoContent.title }}</h3>
          </div>
          <button class="subtle-button" type="button" @click="closeInfo">Close</button>
        </div>

        <p class="modal-copy">
          {{ infoContent.body }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true
  }
})

const activeInfo = ref('')

const gaugeItems = computed(() => [
  { key: 'emotionalIntensity', label: 'Emotional intensity', value: props.metrics.emotionalIntensity },
  { key: 'harmony', label: 'Internal harmony', value: props.metrics.harmony },
  { key: 'relationshipFocus', label: 'Relationship focus', value: props.metrics.relationshipFocus },
  { key: 'healthFocus', label: 'Health & vitality', value: props.metrics.healthFocus }
])

const infoMap = {
  emotionalIntensity: {
    title: 'Emotional intensity',
    body:
      'This looks at Moon emphasis, water-sign placements and tougher Moon aspects.'
  },
  harmony: {
    title: 'Internal harmony',
    body:
      'This looks at the balance between easier aspects and more challenging ones, with a small boost from steadier placements.'
  },
  relationshipFocus: {
    title: 'Relationship focus',
    body:
      'This is based on Venus and Mars, 5th and 7th house placements, and aspects linked to relationships.'
  },
  healthFocus: {
    title: 'Health & vitality',
    body:
      'This is based on 1st and 6th house placements, Sun, Mars and Ascendant emphasis, and the balance of easier and harder Sun or Mars aspects.'
  }
}

const infoContent = computed(() => infoMap[activeInfo.value] || { title: '', body: '' })

function openInfo(key) {
  activeInfo.value = key
}

function closeInfo() {
  activeInfo.value = ''
}
</script>
