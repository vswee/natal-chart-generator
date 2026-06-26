<template>
  <component :is="embedded ? 'div' : 'section'" :class="embedded ? 'chart-panel embedded' : 'panel chart-panel'">
    <div class="panel-inner">
      <div v-if="showChrome" class="chart-header">
        <div>
          <h2 class="section-title">Chart wheel</h2>
          <p class="section-copy">Houses, placements and major aspects on one wheel.</p>
        </div>
        <div class="chart-legend">
          <span class="legend-item legend-item--conjunction">
            <span class="legend-dot" aria-hidden="true"></span>
            Conjunction
          </span>
          <span class="legend-item legend-item--trine">
            <span class="legend-dot" aria-hidden="true"></span>
            Trine
          </span>
          <span class="legend-item legend-item--sextile">
            <span class="legend-dot" aria-hidden="true"></span>
            Sextile
          </span>
          <span class="legend-item legend-item--square">
            <span class="legend-dot" aria-hidden="true"></span>
            Square
          </span>
          <span class="legend-item legend-item--opposition">
            <span class="legend-dot" aria-hidden="true"></span>
            Opposition
          </span>
        </div>
      </div>

      <div class="chart-wheel-wrap">
        <svg
          :class="['chart-wheel', `chart-wheel--${variant}`]"
          :width="size"
          :height="size"
          :viewBox="`0 0 ${size} ${size}`"
          :role="decorative ? undefined : 'img'"
          :aria-label="decorative ? undefined : 'Natal chart wheel'"
          :aria-hidden="decorative ? 'true' : undefined"
          @mouseleave="clearHover"
        >
          <g class="wheel-sign-segments">
            <path
              v-for="segment in signSegments"
              :key="`sign-segment-${segment.sign}`"
              class="wheel-sign-segment"
              :class="`wheel-sign-segment--${segment.element}`"
              :d="segment.path"
            />
          </g>

          <circle class="wheel-ring wheel-ring--outer" :cx="center" :cy="center" :r="signOuterRadius" />
          <circle class="wheel-ring wheel-ring--sign" :cx="center" :cy="center" :r="signInnerRadius" />
          <circle class="wheel-ring wheel-ring--inner" :cx="center" :cy="center" :r="innerRingRadius" />

          <g class="wheel-signs">
            <line
              v-for="sign in signBoundaries"
              :key="`sign-boundary-${sign.index}`"
              class="wheel-sign-boundary"
              :x1="sign.start.x"
              :y1="sign.start.y"
              :x2="sign.end.x"
              :y2="sign.end.y"
            />
            <g v-if="isCostarVariant" class="wheel-sign-labels">
              <text
                v-for="sign in signLabels"
                :key="`sign-label-${sign.sign}`"
                class="wheel-sign-label"
                :x="sign.point.x"
                :y="sign.point.y"
                :transform="`rotate(${sign.rotation} ${sign.point.x} ${sign.point.y})`"
              >
                {{ sign.label }}
              </text>
            </g>
            <g
              v-if="!isCostarVariant"
              v-for="sign in signGlyphs"
              :key="`sign-${sign.sign}`"
              class="sign-glyph"
              :class="`sign-glyph--${sign.element}`"
              :transform="`translate(${sign.point.x - sign.size / 2}, ${sign.point.y - sign.size / 2})`"
            >
              <ZodiacIcon :sign="sign.sign" :size="sign.size" class="sign-glyph-icon" />
            </g>
          </g>

          <g class="wheel-houses">
            <g v-for="house in houseLines" :key="`house-${house.index}`">
              <line
                class="wheel-house-line"
                :class="{ 'wheel-house-line--axis': house.isAxis }"
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
            <template v-if="!isCostarVariant">
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
            </template>
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
              <g :transform="`translate(${placement.point.x - placement.glyphSize / 2}, ${placement.point.y - placement.glyphSize / 2})`">
                <AstroGlyph :body="placement.body" :size="placement.glyphSize" class="placement-glyph" />
              </g>
              <text
                v-if="!isCostarVariant"
                class="placement-degree"
                :x="placement.degreePoint.x"
                :y="placement.degreePoint.y"
              >
                {{ placement.degreeLabel }}
              </text>
            </g>
          </g>
        </svg>
        <p v-if="showChrome" class="chart-note">{{ hoverText || defaultHoverText }}</p>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getHouseMeaning } from '../utils/houses'
import { normaliseDegrees, toTitleCase, SIGNS, SIGN_INFO } from '../utils/zodiac'
import AstroGlyph from './AstroGlyph.vue'
import ZodiacIcon from './ZodiacIcon.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false
  },
  showChrome: {
    type: Boolean,
    default: true
  },
  decorative: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'costar'].includes(value)
  },
  placements: {
    type: Array,
    required: true
  },
  aspects: {
    type: Array,
    required: true
  },
  cusps: {
    type: [Array, Object],
    required: true
  }
})

const size = 360
const center = size / 2
const signOuterRadius = 162
const signInnerRadius = 138
const innerRingRadius = 108
const signBandThickness = 3
const signBandOuterRadius = signOuterRadius + signBandThickness
const houseLineRadius = signInnerRadius
const houseLabelRadius = 35
const placementRadius = 126
const placementDegreeRadius = 102
const aspectRadius = 92
const defaultHoverText = 'Hover over a point or line for details.'
const hoverText = ref('')
const isCostarVariant = computed(() => props.variant === 'costar')

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
  const raw = Array.isArray(props.cusps) || ArrayBuffer.isView(props.cusps)
    ? Array.from(props.cusps)
    : []
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

function describeRingSegment(startAngle, endAngle, outerRadius, innerRadius) {
  const normalizedStart = normaliseDegrees(startAngle)
  let normalizedEnd = normaliseDegrees(endAngle)
  if (normalizedEnd <= normalizedStart) normalizedEnd += 360
  const largeArcFlag = normalizedEnd - normalizedStart > 180 ? 1 : 0

  const startOuter = polarToPoint(normalizedStart, outerRadius)
  const endOuter = polarToPoint(normalizedEnd, outerRadius)
  const endInner = polarToPoint(normalizedEnd, innerRadius)
  const startInner = polarToPoint(normalizedStart, innerRadius)

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    'Z'
  ].join(' ')
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

function formatDegreeLabel(placement) {
  const raw = Number(placement.degreeInSign || 0)
  const base = Math.floor(raw)
  let minutes = Math.round((raw - base) * 60)
  let degrees = base
  if (minutes === 60) {
    degrees += 1
    minutes = 0
  }
  const minuteText = minutes.toString().padStart(2, '0')
  const retro = placement.retrograde ? ' R' : ''
  return `${degrees}°${minuteText}'${retro}`
}

const signSegments = computed(() =>
  SIGNS.map((sign, index) => {
    const startAngle = angleForLongitude(index * 30)
    const endAngle = angleForLongitude((index + 1) * 30)
    const info = SIGN_INFO[sign] || { element: 'air' }
    const outerRadius = isCostarVariant.value ? signOuterRadius : signBandOuterRadius
    const innerRadius = isCostarVariant.value ? signInnerRadius : signOuterRadius
    return {
      sign,
      element: info.element,
      path: describeRingSegment(startAngle, endAngle, outerRadius, innerRadius)
    }
  })
)

const signBoundaries = computed(() =>
  SIGNS.map((sign, index) => {
    const angle = angleForLongitude(index * 30)
    return {
      index,
      sign,
      start: polarToPoint(angle, signOuterRadius),
      end: polarToPoint(angle, signInnerRadius)
    }
  })
)

const signGlyphs = computed(() => {
  const radius = (signOuterRadius + signInnerRadius) / 2
  const size = 18
  return SIGNS.map((sign, index) => {
    const angle = angleForLongitude(index * 30 + 15)
    const info = SIGN_INFO[sign] || { element: 'air' }
    return {
      sign,
      element: info.element,
      point: polarToPoint(angle, radius),
      size
    }
  })
})

const signLabels = computed(() => {
  const radius = (signOuterRadius + signInnerRadius) / 2
  return SIGNS.map((sign, index) => {
    const angle = angleForLongitude(index * 30 + 15)
    let rotation = angle
    if (rotation > 90 && rotation < 270) rotation += 180
    return {
      sign,
      label: sign.toUpperCase(),
      point: polarToPoint(angle, radius),
      rotation
    }
  })
})

const houseLines = computed(() =>
  houseCusps.value.map((cusp, index) => {
    const angle = angleForLongitude(cusp)
    return {
      index: index + 1,
      isAxis: [1, 4, 7, 10].includes(index + 1),
      point: polarToPoint(angle, houseLineRadius)
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
      point: polarToPoint(angleForLongitude(midAngle), houseLabelRadius)
    }
  })
})

const placementPoints = computed(() =>
  props.placements.map((placement) => {
    const angle = angleForLongitude(placement.longitude)
    return {
      body: placement.body,
      glyphSize: placement.body === 'sun' || placement.body === 'moon' || placement.body === 'asc' ? 16 : 13,
      point: polarToPoint(angle, placementRadius),
      degreePoint: polarToPoint(angle, placementDegreeRadius),
      degreeLabel: formatDegreeLabel(placement),
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
