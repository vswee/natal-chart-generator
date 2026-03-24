<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="present-header">
        <div>
          <h2 class="section-title">Present time</h2>
          <p class="section-copy">
            A quick read of the current sky compared to this natal chart.
          </p>
        </div>
        <div class="present-meta">
          <p class="present-meta-label">Updated</p>
          <p class="present-meta-value">{{ formattedTime }}</p>
        </div>
      </div>

      <div class="present-grid">
        <article class="present-card">
          <div class="present-card-head">
            <h3 class="present-card-title">Transit houses</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About transit houses"
              @click="openInfo('houses')"
            >
              info
            </button>
          </div>
          <div v-if="activeHouses.length" class="present-list">
            <div v-for="house in activeHouses" :key="house.house" class="present-item">
              <button
                class="house-button house-button--plain"
                type="button"
                :aria-label="`About house ${house.house}`"
                @click="openHouse(house.house)"
              >
                <span class="house-icon" aria-hidden="true">{{ houseIcon(house.house) }}</span>
                <span>
                  House
                  <span class="house-number">
                    <span>{{ house.ordinal.number }}</span>
                    <sup class="house-suffix">{{ house.ordinal.suffix }}</sup>
                  </span>
                </span>
              </button>
              <span class="present-item-value">{{ house.bodies.join(', ') }}</span>
            </div>
          </div>
          <p v-else class="present-empty">No house data available.</p>
        </article>
      <div class="gauge-list">

        <article class="present-card">
          <div class="present-card-head">
            <h3 class="present-card-title">Current Moon</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About current Moon"
              @click="openInfo('moon')"
            >
              info
            </button>
          </div>
          <div v-if="transits.moon" class="present-moon">
            <p class="present-moon-main">
              Moon in {{ titleCase(transits.moon.sign) }} · {{ transits.moon.phaseName }}
            </p>
            <p class="present-moon-sub">
              Illumination: {{ transits.moon.illumination }}%
            </p>
          </div>
          <p v-else class="present-empty">Moon data unavailable.</p>
        </article>

        <article class="present-card">
          <div class="present-card-head">
            <h3 class="present-card-title">Retrograde now</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About retrogrades"
              @click="openInfo('retrograde')"
            >
              info
            </button>
          </div>
          <div v-if="retrogradeLabels.length" class="present-tags">
            <span v-for="label in retrogradeLabels" :key="label" class="present-tag">
              {{ label }}
            </span>
          </div>
          <p v-else class="present-empty">No major planets are retrograde right now.</p>
        </article>
      </div>
      </div>
    </div>

    <div v-if="activeInfo" class="modal-overlay" @click.self="closeInfo">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Present time</p>
            <h3 class="modal-title">{{ infoContent.title }}</h3>
          </div>
          <button class="subtle-button" type="button" @click="closeInfo">Close</button>
        </div>
        <p class="modal-copy">{{ infoContent.body }}</p>
      </div>
    </div>

    <div v-if="activeHouseInfo" class="modal-overlay" @click.self="closeHouse">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Houses</p>
            <h3 class="modal-title">
              <span class="house-number">
                <span>{{ activeHouseOrdinal.number }}</span>
                <sup class="house-suffix">{{ activeHouseOrdinal.suffix }}</sup>
              </span>
              House: {{ activeHouseInfo.name || activeHouseInfo.title }}
            </h3>
          </div>
          <button class="subtle-button" type="button" @click="closeHouse">Close</button>
        </div>
        <p class="modal-copy">{{ activeHouseInfo.body }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { toTitleCase } from '../utils/zodiac'
import { getHouseMeaning, getHouseOrdinal } from '../utils/houses'

const props = defineProps({
  transits: {
    type: Object,
    required: true
  }
})

const activeInfo = ref('')
const activeHouse = ref(null)

const bodyLabels = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto'
}

const formattedTime = computed(() => {
  const raw = props.transits.generatedAt
  if (!raw) return 'Just now'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return 'Just now'
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
})

const activeHouses = computed(() => {
  const map = new Map()
  const placements = Array.isArray(props.transits.placements) ? props.transits.placements : []

  placements.forEach((placement) => {
    if (!placement.house) return
    const label = bodyLabels[placement.body] || toTitleCase(placement.body)
    const list = map.get(placement.house) || []
    list.push(label)
    map.set(placement.house, list)
  })

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([house, bodies]) => ({ house, bodies, ordinal: getHouseOrdinal(house) }))
})

const retrogradeLabels = computed(() => {
  const list = Array.isArray(props.transits.retrogrades) ? props.transits.retrogrades : []
  return list.map((placement) => bodyLabels[placement.body] || toTitleCase(placement.body))
})

const infoMap = {
  houses: {
    title: 'Transit houses',
    body:
      'Shows which natal houses the current planets occupy, highlighting which life areas are being activated right now.'
  },
  moon: {
    title: 'Current Moon',
    body:
      "Moon sign and phase offer a quick emotional and energetic snapshot for the day, based on the Moon's current position relative to the Sun."
  },
  retrograde: {
    title: 'Retrograde now',
    body:
      'Highlights planets currently retrograde, which can correlate with slower pace, review, or internal focus around their themes.'
  }
}

const infoContent = computed(() => infoMap[activeInfo.value] || { title: '', body: '' })
const activeHouseInfo = computed(() => {
  if (!activeHouse.value) return null
  return getHouseMeaning(activeHouse.value)
})

const activeHouseOrdinal = computed(() => getHouseOrdinal(activeHouse.value))

function openInfo(key) {
  activeInfo.value = key
}

function closeInfo() {
  activeInfo.value = ''
}

function openHouse(house) {
  activeHouse.value = house
}

function closeHouse() {
  activeHouse.value = null
}

function houseIcon(house) {
  return getHouseMeaning(house)?.icon || 'home'
}

function titleCase(value) {
  return toTitleCase(value)
}
</script>
