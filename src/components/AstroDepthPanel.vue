<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="depth-header">
        <div>
          <h2 class="section-title">Astro depth</h2>
          <p class="section-copy">Extended points, rulerships, and pattern highlights.</p>
        </div>
      </div>

      <div class="depth-grid">
        <article class="depth-card">
          <div class="depth-head">
            <h3 class="depth-title">Extended points</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About extended points"
              @click="openInfo('points')"
            >
              info
            </button>
          </div>
          <div v-if="pointsList.length" class="depth-list">
            <div v-for="point in pointsList" :key="point.body" class="depth-item">
              <div class="depth-item-main">
                <p class="depth-item-title">{{ point.label }}</p>
                <p class="depth-item-sub">{{ formatPlacement(point) }}</p>
              </div>
              <div class="depth-item-meta">
                <span v-if="point.house" class="depth-chip">
                  House
                  <span class="house-number">
                    <span>{{ point.houseOrdinal.number }}</span>
                    <sup class="house-suffix">{{ point.houseOrdinal.suffix }}</sup>
                  </span>
                </span>
                <span v-if="point.retrograde" class="depth-chip">Rx</span>
              </div>
            </div>
          </div>
          <p v-else class="depth-empty">No extended points available.</p>
        </article>

        <article class="depth-card">
          <div class="depth-head">
            <h3 class="depth-title">Rulerships & dignities</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About rulerships and dignities"
              @click="openInfo('rulerships')"
            >
              info
            </button>
          </div>

          <div v-if="chartRuler" class="depth-highlight">
            <p class="depth-highlight-label">Chart ruler</p>
            <p class="depth-highlight-value">
              <template v-if="chartRuler.placement">
                {{ labelBody(chartRuler.ruler) }} in {{ titleCase(chartRuler.placement.sign) }}
                <span v-if="chartRuler.placement.house">
                  · House
                  <span class="house-number">
                    <span>{{ chartRulerHouse.number }}</span>
                    <sup class="house-suffix">{{ chartRulerHouse.suffix }}</sup>
                  </span>
                </span>
              </template>
              <template v-else>
                {{ labelBody(chartRuler.ruler) }}
              </template>
            </p>
          </div>

          <div v-if="dignityRows.length" class="depth-table">
            <div v-for="row in dignityRows" :key="row.body" class="depth-row">
              <div>
                <p class="depth-row-title">{{ labelBody(row.body) }}</p>
                <p class="depth-row-sub">
                  {{ titleCase(row.sign) }} · {{ formatDignity(row.dignity) }}
                </p>
              </div>
              <div class="depth-row-meta">
                <span class="depth-chip">
                  Ruler: {{ labelBody(row.ruler) }}
                </span>
                <span v-if="row.rulerPlacement" class="depth-chip">
                  {{ titleCase(row.rulerPlacement.sign) }}
                  <span v-if="row.rulerPlacement.house">
                    · House
                    <span class="house-number">
                      <span>{{ row.rulerHouse.number }}</span>
                      <sup class="house-suffix">{{ row.rulerHouse.suffix }}</sup>
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <p v-else class="depth-empty">No dignity data available.</p>
        </article>

        <article class="depth-card">
          <div class="depth-head">
            <h3 class="depth-title">Aspect patterns</h3>
            <button
              class="info-toggle"
              type="button"
              aria-label="About aspect patterns"
              @click="openInfo('patterns')"
            >
              info
            </button>
          </div>

          <div v-if="patterns.length" class="depth-list">
            <div v-for="pattern in patterns" :key="patternKey(pattern)" class="depth-item">
              <div class="depth-item-main">
                <p class="depth-item-title">{{ pattern.title }}</p>
                <p class="depth-item-sub">{{ pattern.bodiesLabel }}</p>
              </div>
              <div class="depth-item-meta">
                <span v-if="pattern.apexLabel" class="depth-chip">Apex: {{ pattern.apexLabel }}</span>
              </div>
            </div>
          </div>
          <p v-else class="depth-empty">No major patterns detected.</p>
        </article>
      </div>
    </div>

    <div v-if="activeInfo" class="modal-overlay" @click.self="closeInfo">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Astro depth</p>
            <h3 class="modal-title">{{ infoContent.title }}</h3>
          </div>
          <button class="subtle-button" type="button" @click="closeInfo">Close</button>
        </div>
        <p class="modal-copy">{{ infoContent.body }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getHouseOrdinal } from '../utils/houses'
import { toTitleCase } from '../utils/zodiac'

const props = defineProps({
  extraPoints: {
    type: Array,
    required: true
  },
  dignities: {
    type: Array,
    required: true
  },
  dispositors: {
    type: Array,
    required: true
  },
  chartRuler: {
    type: Object,
    required: false
  },
  aspectPatterns: {
    type: Array,
    required: true
  }
})

const activeInfo = ref('')

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
  pluto: 'Pluto',
  northNode: 'North Node',
  southNode: 'South Node',
  chiron: 'Chiron',
  lilith: 'Lilith',
  partOfFortune: 'Part of Fortune',
  ceres: 'Ceres',
  pallas: 'Pallas',
  juno: 'Juno',
  vesta: 'Vesta'
}

const pointOrder = [
  'northNode',
  'southNode',
  'chiron',
  'lilith',
  'partOfFortune',
  'ceres',
  'pallas',
  'juno',
  'vesta'
]

const dispositorMap = computed(() =>
  new Map(props.dispositors.map((item) => [item.body, item]))
)

const pointsList = computed(() => {
  const list = Array.isArray(props.extraPoints) ? props.extraPoints : []
  const getIndex = (body) => {
    const index = pointOrder.indexOf(body)
    return index === -1 ? pointOrder.length : index
  }
  return [...list]
    .sort((a, b) => getIndex(a.body) - getIndex(b.body))
    .map((point) => ({
      ...point,
      label: bodyLabels[point.body] || point.label || toTitleCase(point.body),
      houseOrdinal: point.house ? getHouseOrdinal(point.house) : null
    }))
})

const dignityRows = computed(() =>
  (Array.isArray(props.dignities) ? props.dignities : []).map((row) => {
    const dispositor = dispositorMap.value.get(row.body)
    const rulerPlacement = dispositor?.rulerPlacement || null
    return {
      ...row,
      rulerPlacement,
      rulerHouse: rulerPlacement?.house ? getHouseOrdinal(rulerPlacement.house) : null
    }
  })
)

const patterns = computed(() => (Array.isArray(props.aspectPatterns) ? props.aspectPatterns : []))

const chartRulerHouse = computed(() => {
  if (!props.chartRuler?.placement?.house) return null
  return getHouseOrdinal(props.chartRuler.placement.house)
})

const infoMap = {
  points: {
    title: 'Extended points',
    body:
      'North/South Node highlight growth direction and familiar patterns. Chiron points to healing and sensitivity. Lilith (mean apogee) reflects raw instinct and autonomy. Part of Fortune shows where flow and ease are supported. Ceres, Pallas, Juno, and Vesta add themes of care, strategy, commitment, and devotion. Use the sign and house below to see where each theme is emphasized in this chart.'
  },
  rulerships: {
    title: 'Rulerships and dignities',
    body:
      'Rulerships connect each sign to a ruling planet (modern rulers used here). Dignities show planets in domicile/exaltation (supportive) or detriment/fall (challenging). The chart ruler is the ruler of the Ascendant and sets an overall tone.'
  },
  patterns: {
    title: 'Aspect patterns',
    body:
      'Patterns like Grand Trine, T-Square, and Yod describe how multiple aspects combine. If listed, they can highlight natural flow, productive tension, or adjustment points in the chart.'
  }
}

const infoContent = computed(() => infoMap[activeInfo.value] || { title: '', body: '' })

function labelBody(body) {
  return bodyLabels[body] || toTitleCase(body)
}

function titleCase(value) {
  return toTitleCase(value || '')
}

function formatPlacement(point) {
  if (!point?.sign) return '—'
  return `${titleCase(point.sign)} ${Number(point.degreeInSign).toFixed(2)}°`
}

function formatDignity(value) {
  if (!value) return 'Neutral'
  const labels = {
    domicile: 'Domicile',
    detriment: 'Detriment',
    exaltation: 'Exaltation',
    fall: 'Fall',
    neutral: 'Neutral'
  }
  return labels[value] || value
}

function openInfo(key) {
  activeInfo.value = key
}

function closeInfo() {
  activeInfo.value = ''
}

function patternKey(pattern) {
  return `${pattern.type}-${pattern.bodies.join('-')}`
}
</script>
