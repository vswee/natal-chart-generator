<template>
  <section class="panel chart-panel">
    <div class="panel-inner">
      <div class="chart-header">
        <div>
          <h2 class="section-title">Chart wheel</h2>
          <p class="section-copy">Houses, placements, and major aspects mapped on a single wheel.</p>
        </div>
        <div class="chart-legend">
          <span class="legend-item legend-item--conjunction">Conjunction</span>
          <span class="legend-item legend-item--trine">Trine</span>
          <span class="legend-item legend-item--sextile">Sextile</span>
          <span class="legend-item legend-item--square">Square</span>
          <span class="legend-item legend-item--opposition">Opposition</span>
        </div>
      </div>

      <div class="chart-wheel-wrap">
        <svg
          class="chart-wheel"
          :viewBox="`0 0 ${size} ${size}`"
          role="img"
          aria-label="Natal chart wheel"
          @mouseleave="clearHover"
        >
          <circle class="wheel-ring" :cx="center" :cy="center" :r="outerRadius" />
          <circle class="wheel-ring wheel-ring--inner" :cx="center" :cy="center" :r="aspectRadius" />

          <g class="wheel-houses">
            <g v-for="house in houseLines" :key="`house-${house.index}`">
              <line
                class="wheel-house-line"
                :x1="center"
                :y1="center"
                :x2="house.point.x"
                :y2="house.point.y"
              />
              <line
                class="house-hit"
                :x1="center"
                :y1="center"
                :x2="house.point.x"
                :y2="house.point.y"
                @mouseenter="setHouseHover(house.index)"
                @mouseleave="clearHover"
              />
            </g>
            <text
              v-for="house in houseLabels"
              :key="`label-${house.index}`"
              class="wheel-house-label"
              :x="house.point.x"
              :y="house.point.y"
              @mouseenter="setHouseHover(house.index)"
              @mouseleave="clearHover"
            >
              {{ house.index }}
            </text>
          </g>

          <g class="wheel-aspects">
            <g v-for="aspect in aspectLines" :key="aspect.id">
              <line
                class="aspect-line"
                :class="`aspect-line--${aspect.type}`"
                :x1="aspect.from.x"
                :y1="aspect.from.y"
                :x2="aspect.to.x"
                :y2="aspect.to.y"
              />
              <line
                class="aspect-hit"
                :x1="aspect.from.x"
                :y1="aspect.from.y"
                :x2="aspect.to.x"
                :y2="aspect.to.y"
                @mouseenter="setHover(aspect.title)"
                @mouseleave="clearHover"
              />
            </g>
          </g>

          <g class="wheel-placements">
            <g
              v-for="placement in placementPoints"
              :key="placement.body"
              class="placement-point"
            >
              <circle
                class="placement-hit"
                :cx="placement.point.x"
                :cy="placement.point.y"
                r="12"
                @mouseenter="setHover(placement.title)"
                @mouseleave="clearHover"
              />
              <circle
                class="placement-dot"
                :cx="placement.point.x"
                :cy="placement.point.y"
                r="6"
              />
              <text
                class="placement-label"
                :x="placement.label.x"
                :y="placement.label.y"
              >
                {{ placement.symbol }}
              </text>
            </g>
          </g>
        </svg>
        <p class="chart-note">{{ hoverText || defaultHoverText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getHouseMeaning } from '../utils/houses'
import { normaliseDegrees, toTitleCase } from '../utils/zodiac'

const props = defineProps({
  placements: {
    type: Array,
    required: true
  },
  aspects: {
    type: Array,
    required: true
  },
  cusps: {
    type: Array,
    required: true
  }
})

const size = 360
const center = size / 2
const outerRadius = 150
const aspectRadius = 110
const labelRadius = 128
const defaultHoverText = 'Hover a point or line for details.'
const hoverText = ref('')

const placementSymbols = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  asc: 'As',
  mc: 'Mc'
}

const placementLabels = {
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

const houseCusps = computed(() => {
  const raw = Array.isArray(props.cusps) ? props.cusps : []
  if (raw.length >= 13) return raw.slice(1)
  if (raw.length === 12) return raw
  return Array.from({ length: 12 }, (_, index) => index * 30)
})

const rotation = computed(() => {
  const asc = props.placements.find((placement) => placement.body === 'asc')
  return asc ? asc.longitude + 90 : 0
})

function angleForLongitude(longitude) {
  return normaliseDegrees(longitude - rotation.value)
}

function polarToPoint(angle, radius) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians)
  }
}

function formatPlacement(placement) {
  const sign = toTitleCase(placement.sign)
  const degree = placement.degreeInSign.toFixed(2)
  const motion = placement.retrograde ? 'Retrograde' : 'Direct'
  const label = placementLabels[placement.body] || toTitleCase(placement.body)
  const parts = [`${label} in ${sign} ${degree}°`]
  if (placement.house) {
    parts.push(`House ${placement.house}`)
  }
  parts.push(motion)
  return parts.join(', ')
}

const houseLines = computed(() =>
  houseCusps.value.map((cusp, index) => {
    const angle = angleForLongitude(cusp)
    return {
      index: index + 1,
      point: polarToPoint(angle, outerRadius)
    }
  })
)

const houseLabels = computed(() => {
  const cusps = houseCusps.value
  return cusps.map((cusp, index) => {
    const next = cusps[(index + 1) % cusps.length]
    const span = normaliseDegrees(next - cusp)
    const midAngle = normaliseDegrees(cusp + span / 2)
    return {
      index: index + 1,
      point: polarToPoint(angleForLongitude(midAngle), labelRadius)
    }
  })
})

const placementPoints = computed(() =>
  props.placements.map((placement) => {
    const angle = angleForLongitude(placement.longitude)
    return {
      body: placement.body,
      symbol: placementSymbols[placement.body] || toTitleCase(placement.body).slice(0, 2),
      point: polarToPoint(angle, outerRadius),
      label: polarToPoint(angle, outerRadius + 16),
      title: formatPlacement(placement)
    }
  })
)

const placementLookup = computed(() =>
  new Map(props.placements.map((placement) => [placement.body, placement]))
)

const aspectLines = computed(() => {
  return props.aspects
    .map((aspect) => {
      const first = placementLookup.value.get(aspect.bodyA)
      const second = placementLookup.value.get(aspect.bodyB)
      if (!first || !second) return null

      const fromAngle = angleForLongitude(first.longitude)
      const toAngle = angleForLongitude(second.longitude)
      const from = polarToPoint(fromAngle, aspectRadius)
      const to = polarToPoint(toAngle, aspectRadius)
      const bodyA = placementLabels[aspect.bodyA] || toTitleCase(aspect.bodyA)
      const bodyB = placementLabels[aspect.bodyB] || toTitleCase(aspect.bodyB)
      const title = `${bodyA} ${aspect.type} ${bodyB} (orb ${aspect.orb.toFixed(2)}°)`

      return {
        id: `${aspect.bodyA}-${aspect.type}-${aspect.bodyB}`,
        type: aspect.type,
        from,
        to,
        title
      }
    })
    .filter(Boolean)
})

function setHover(text) {
  hoverText.value = text
}

function clearHover() {
  hoverText.value = ''
}

function setHouseHover(house) {
  const meaning = getHouseMeaning(house)
  if (!meaning) {
    setHover(`House ${house}`)
    return
  }
  setHover(`${meaning.title} — ${meaning.body}`)
}
</script>
