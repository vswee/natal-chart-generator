<template>
  <section class="panel distribution-panel">
    <div class="panel-inner">
      <h2 class="section-title">Elements & modes</h2>
      <p class="section-copy">
        A quick breakdown of elemental balance and modality emphasis across the planets.
      </p>

      <div class="distribution-grid">
        <div class="distribution-group">
          <h3 class="distribution-title">Elements</h3>
          <div class="distribution-list">
            <article v-for="item in elementItems" :key="item.key" class="distribution-item">
              <div class="distribution-row">
                <span class="distribution-label">{{ item.label }}</span>
                <span class="distribution-value">{{ item.count }}</span>
              </div>
              <div class="distribution-track">
                <span class="distribution-fill" :style="{ width: item.percent + '%' }"></span>
              </div>
            </article>
          </div>
        </div>

        <div class="distribution-group">
          <h3 class="distribution-title">Modes</h3>
          <div class="distribution-list">
            <article v-for="item in modeItems" :key="item.key" class="distribution-item">
              <div class="distribution-row">
                <span class="distribution-label">{{ item.label }}</span>
                <span class="distribution-value">{{ item.count }}</span>
              </div>
              <div class="distribution-track">
                <span class="distribution-fill" :style="{ width: item.percent + '%' }"></span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ELEMENTS, MODES, SIGN_INFO, toTitleCase } from '../utils/zodiac'

const props = defineProps({
  placements: {
    type: Array,
    required: true
  }
})

const relevantPlacements = computed(() =>
  props.placements.filter((placement) => !['asc', 'mc'].includes(placement.body))
)

function buildCounts(list, key) {
  return list.reduce((acc, placement) => {
    const signMeta = SIGN_INFO[placement.sign]
    if (!signMeta || !signMeta[key]) return acc
    acc[signMeta[key]] = (acc[signMeta[key]] || 0) + 1
    return acc
  }, {})
}

const elementItems = computed(() => {
  const total = Math.max(relevantPlacements.value.length, 1)
  const counts = buildCounts(relevantPlacements.value, 'element')
  return ELEMENTS.map((element) => {
    const count = counts[element] || 0
    return {
      key: element,
      label: toTitleCase(element),
      count,
      percent: Math.round((count / total) * 100)
    }
  })
})

const modeItems = computed(() => {
  const total = Math.max(relevantPlacements.value.length, 1)
  const counts = buildCounts(relevantPlacements.value, 'mode')
  return MODES.map((mode) => {
    const count = counts[mode] || 0
    return {
      key: mode,
      label: toTitleCase(mode),
      count,
      percent: Math.round((count / total) * 100)
    }
  })
})
</script>
