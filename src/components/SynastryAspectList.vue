<template>
  <section class="panel aspect-wrap compatibility-section-card">
    <div v-if="sectionBadges.length" class="compatibility-section-badges">
      <span
        v-for="badge in sectionBadges"
        :key="badge.label"
        :class="['badge', 'compatibility-section-badge', badge.variant ? `compatibility-section-badge--${badge.variant}` : '']"
      >
        {{ badge.label }}
      </span>
    </div>
    <div class="panel-inner">
      <div class="synastry-header">
        <div>
          <h2 class="section-title">Synastry details</h2>
          <p class="section-copy">Aspects between two charts, filtered by type and closeness.</p>
        </div>
        <button class="info-toggle" type="button" aria-label="About synastry" @click="openInfo">
          info
        </button>
      </div>

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
          {{ label(labelA, aspect.bodyA) }} {{ prettyType(aspect.type) }} {{ label(labelB, aspect.bodyB) }}
        </h3>
        <p class="aspect-copy">Orb: {{ aspect.orb.toFixed(2) }}°</p>
      </article>

      <div v-if="!visibleAspects.length" class="note">
        No synastry aspects match these filters.
      </div>
    </div>

    <div v-if="showInfo" class="modal-overlay" @click.self="closeInfo">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Synastry</p>
            <h3 class="modal-title">How synastry works</h3>
          </div>
          <button class="subtle-button" type="button" @click="closeInfo">Close</button>
        </div>
        <p class="modal-copy">
          Synastry compares the angles between planets in two charts. Closer aspects usually feel stronger, showing
          where things flow easily, where there is friction, and where each person strongly affects the other.
        </p>
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
  },
  labelA: {
    type: String,
    required: true
  },
  labelB: {
    type: String,
    required: true
  },
  sectionBadges: {
    type: Array,
    default: () => []
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

const maxOrb = ref(6)
const showAll = ref(false)
const showInfo = ref(false)

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

function label(prefix, body) {
  const bodyLabel = body === 'asc' ? 'Ascendant' : body.charAt(0).toUpperCase() + body.slice(1)
  return `${prefix} ${bodyLabel}`
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

function openInfo() {
  showInfo.value = true
}

function closeInfo() {
  showInfo.value = false
}
</script>
