<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="composite-header">
        <div>
          <h2 class="section-title">Composite chart</h2>
          <p class="section-copy">Midpoint chart showing the relationship dynamic as its own entity.</p>
        </div>
        <button class="info-toggle" type="button" aria-label="About composite charts" @click="openInfo">
          info
        </button>
      </div>

      <div v-if="composite" class="composite-grid">
        <div class="composite-wheel">
          <ChartWheel
            :embedded="true"
            :placements="composite.placements"
            :aspects="composite.aspects"
            :cusps="composite.houseCusps"
          />
        </div>
        <div class="composite-details">
          <div class="composite-list">
            <div v-for="placement in composite.placements" :key="placement.body" class="composite-item">
              <p class="composite-item-title">{{ labelBody(placement.body) }}</p>
              <p class="composite-item-sub">
                {{ titleCase(placement.sign) }} {{ placement.degreeInSign.toFixed(2) }}°
                <span v-if="placement.house">
                  · House
                  <span class="house-number">
                    <span>{{ getHouseOrdinal(placement.house).number }}</span>
                    <sup class="house-suffix">{{ getHouseOrdinal(placement.house).suffix }}</sup>
                  </span>
                </span>
              </p>
            </div>
          </div>

          <div class="composite-aspects">
            <h3 class="composite-subtitle">Key aspects</h3>
            <div v-if="topAspects.length" class="composite-aspect-list">
              <div v-for="aspect in topAspects" :key="aspectKey(aspect)" class="composite-aspect">
                <p class="composite-aspect-title">
                  {{ labelBody(aspect.bodyA) }} {{ prettyType(aspect.type) }} {{ labelBody(aspect.bodyB) }}
                </p>
                <p class="composite-aspect-sub">Orb: {{ aspect.orb.toFixed(2) }}°</p>
              </div>
            </div>
            <p v-else class="composite-empty">No composite aspects available.</p>
          </div>
        </div>
      </div>

      <p v-else class="composite-empty">Composite data unavailable.</p>
    </div>

    <div v-if="showInfo" class="modal-overlay" @click.self="closeInfo">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Composite charts</p>
            <h3 class="modal-title">What the composite chart means</h3>
          </div>
          <button class="subtle-button" type="button" @click="closeInfo">Close</button>
        </div>
        <p class="modal-copy">
          A composite chart takes the midpoint between two charts for each planet. It describes the relationship as
          its own entity, highlighting how the connection behaves over time. Use the placements and aspects here to
          see the overall tone and dynamics.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import ChartWheel from './ChartWheel.vue'
import { getHouseOrdinal } from '../utils/houses'
import { toTitleCase } from '../utils/zodiac'

const props = defineProps({
  composite: {
    type: Object,
    required: false
  }
})

const showInfo = ref(false)

const topAspects = computed(() => {
  if (!props.composite?.aspects) return []
  return [...props.composite.aspects].sort((a, b) => a.orb - b.orb).slice(0, 6)
})

function labelBody(body) {
  const labels = {
    sun: 'Sun',
    moon: 'Moon',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto',
    asc: 'Ascendant',
    mc: 'Midheaven'
  }
  return labels[body] || toTitleCase(body)
}

function titleCase(value) {
  return toTitleCase(value)
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

function aspectKey(aspect) {
  return `${aspect.bodyA}-${aspect.type}-${aspect.bodyB}`
}

function openInfo() {
  showInfo.value = true
}

function closeInfo() {
  showInfo.value = false
}
</script>
