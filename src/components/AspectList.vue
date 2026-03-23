<template>
  <section class="panel aspect-wrap">
    <div class="panel-inner">
      <h2 class="section-title">Major aspects</h2>
      <p class="section-copy">A simple list view for the strongest detected angular relationships.</p>

      <div class="aspect-controls">
        <div class="aspect-filter-group">
          <span class="aspect-filter-label">Types</span>
          <label v-for="type in aspectTypes" :key="type.key" class="filter-chip">
            <input v-model="typeFilters[type.key]" class="filter-input" type="checkbox" />
            <span>{{ type.label }}</span>
          </label>
        </div>

        <div class="aspect-filter-group">
          <span class="aspect-filter-label">Max orb: {{ maxOrb.toFixed(1) }}°</span>
          <input v-model.number="maxOrb" class="range-input" type="range" min="1" max="10" step="0.5" />
        </div>

        <button class="subtle-button aspect-toggle" type="button" @click="toggleAll">
          {{ showAll ? 'Show top 8' : `Show all (${filteredAspects.length})` }}
        </button>
      </div>
    </div>

    <div class="aspect-list">
      <article
        v-for="aspect in visibleAspects"
        :key="aspect.bodyA + aspect.type + aspect.bodyB"
        class="aspect-item"
      >
        <h3 class="aspect-title">
          {{ label(aspect.bodyA) }} {{ prettyType(aspect.type) }} {{ label(aspect.bodyB) }}
        </h3>
        <p class="aspect-copy">Orb: {{ aspect.orb.toFixed(2) }}°</p>
      </article>

      <div v-if="!visibleAspects.length" class="note">
        No aspects match the current filters.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  aspects: {
    type: Array,
    required: true
  }
})

const aspectTypes = [
  { key: 'conjunction', label: 'Conjunction' },
  { key: 'sextile', label: 'Sextile' },
  { key: 'square', label: 'Square' },
  { key: 'trine', label: 'Trine' },
  { key: 'opposition', label: 'Opposition' }
]

const typeFilters = ref({
  conjunction: true,
  sextile: true,
  square: true,
  trine: true,
  opposition: true
})

const maxOrb = ref(8)
const showAll = ref(false)

const filteredAspects = computed(() =>
  (Array.isArray(props.aspects) ? props.aspects : [])
    .filter((aspect) => typeFilters.value[aspect.type] && aspect.orb <= maxOrb.value)
    .sort((a, b) => a.orb - b.orb)
)

const visibleAspects = computed(() =>
  showAll.value ? filteredAspects.value : filteredAspects.value.slice(0, 8)
)

function toggleAll() {
  showAll.value = !showAll.value
}

function label(body) {
  return body === 'asc' ? 'Ascendant' : body.charAt(0).toUpperCase() + body.slice(1)
}

function prettyType(type) {
  const map = {
    conjunction: 'conjunct',
    sextile: 'sextile',
    square: 'square',
    trine: 'trine',
    opposition: 'oppose'
  }
  return map[type] || type
}
</script>
