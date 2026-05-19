<template>
  <section class="simplified-chart">
    <div class="simple-hero panel">
      <div class="panel-inner simple-hero-inner">
        <div class="simple-hero-copy">
          <p class="simple-kicker">Simple chart</p>
          <h2 class="simple-title">{{ simpleTitle }}</h2>
          <p class="simple-copy">{{ primarySummary }}</p>
        </div>

        <div class="simple-hero-actions">
          <button class="button simple-share-button" type="button" :disabled="isSharing" @click="shareStoryImage">
            <IconShare3 :size="18" stroke-width="2" />
            <span>{{ isSharing ? 'Creating image...' : 'Share chart' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="simple-core-grid">
      <article v-for="item in coreCards" :key="item.key" class="simple-core-card panel">
        <div class="panel-inner simple-core-inner">
          <p class="simple-kicker">{{ item.role }}</p>
          <div class="simple-core-sign">
            <span v-if="item.placement" class="simple-core-icon">
              <ZodiacIcon :sign="item.placement.sign" :size="30" />
            </span>
            <span>{{ item.signLabel }}</span>
          </div>
          <p class="simple-core-label">{{ item.label }}</p>
          <p class="simple-copy">{{ item.summary }}</p>
        </div>
      </article>
    </div>

    <section class="panel">
      <div class="panel-inner simple-section">
        <div class="simple-section-header">
          <div>
            <p class="simple-kicker">Personality</p>
            <h2 class="section-title">Personality highlights</h2>
          </div>
        </div>

        <div class="simple-highlight-list">
          <article v-for="highlight in personalityHighlights" :key="highlight.title" class="simple-highlight">
            <p class="simple-highlight-title">{{ highlight.title }}</p>
            <p class="simple-copy">{{ highlight.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <div class="simple-forecast-grid">
      <section class="panel">
        <div class="panel-inner simple-section">
          <div class="simple-section-header">
            <div>
              <p class="simple-kicker">Today</p>
              <h2 class="section-title">Planetary highlights</h2>
            </div>
            <p class="simple-date">{{ todayLabel }}</p>
          </div>

          <div class="simple-highlight-list">
            <article v-for="highlight in todayHighlights" :key="highlight.title" class="simple-highlight">
              <p class="simple-highlight-title">{{ highlight.title }}</p>
              <p class="simple-copy">{{ highlight.text }}</p>
            </article>
          </div>

          <div class="simple-prediction">
            <p class="simple-kicker">Horoscope</p>
            <p>{{ todayPrediction }}</p>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-inner simple-section">
          <div class="simple-section-header">
            <div>
              <p class="simple-kicker">{{ yearLabel }}</p>
              <h2 class="section-title">Yearly highlights</h2>
            </div>
          </div>

          <div class="simple-highlight-list">
            <article v-for="highlight in yearHighlights" :key="highlight.title" class="simple-highlight">
              <p class="simple-highlight-title">{{ highlight.title }}</p>
              <p class="simple-copy">{{ highlight.text }}</p>
            </article>
          </div>

          <div class="simple-prediction">
            <p class="simple-kicker">Year ahead</p>
            <p>{{ yearPrediction }}</p>
          </div>
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-inner simple-section">
        <div class="simple-compare-header">
          <div>
            <p class="simple-kicker">Partner chart</p>
            <h2 class="section-title">Compare simplified charts</h2>
          </div>
          <button class="subtle-button simple-icon-button" type="button" @click="emit('add-partner')">
            <IconUsers :size="18" stroke-width="2" />
            <span>Add partner</span>
          </button>
        </div>

        <div v-if="partnerSummaries.length" class="simple-partner-grid">
          <article v-for="partner in partnerSummaries" :key="partner.id" class="simple-partner-card">
            <div>
              <p class="simple-partner-name">{{ partner.label }}</p>
              <p class="simple-copy">{{ partner.summary }}</p>
            </div>
            <div class="simple-partner-score">
              <span>{{ partner.score }}</span>
              <small>match</small>
            </div>
            <div class="simple-partner-actions">
              <button class="subtle-button" type="button" @click="emit('select-partner', partner.id)">View</button>
              <button class="subtle-button" type="button" @click="emit('remove-partner', partner.id)">Remove</button>
            </div>
          </article>
        </div>

        <div v-else class="simple-empty-compare">
          <IconUsers :size="28" stroke-width="1.8" />
          <p>Compare your Sun, Moon, Ascendant and relationship scores with someone else.</p>
        </div>
      </div>
    </section>

    <div class="share-stage" aria-hidden="true" inert>
      <article ref="shareCardRef" class="share-card">
        <div class="share-card-top">
          <p class="share-card-kicker">Natal Chart App</p>
          <p class="share-card-date">{{ todayLabel }}</p>
        </div>

        <div class="share-card-title-block">
          <p class="share-card-label">Simple natal chart</p>
          <h2>{{ simpleTitle }}</h2>
          <p>{{ primarySummary }}</p>
        </div>

        <div class="share-card-core">
          <div v-for="item in coreCards" :key="`share-${item.key}`" class="share-card-core-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.signLabel }}</strong>
          </div>
        </div>

        <div class="share-card-section">
          <p class="share-card-label">Personality</p>
          <ul>
            <li v-for="highlight in sharePersonalityHighlights" :key="`share-personality-${highlight.title}`">
              {{ highlight.text }}
            </li>
          </ul>
        </div>

        <div class="share-card-section share-card-section--forecast">
          <p class="share-card-label">Today</p>
          <p>{{ todayPrediction }}</p>
        </div>

        <div class="share-card-section share-card-section--forecast">
          <p class="share-card-label">{{ yearLabel }}</p>
          <p>{{ yearPrediction }}</p>
        </div>

        <footer class="share-card-footer">
          <span>Generated lovingly by Natal Chart App</span>
          <strong>{{ appUrl }}</strong>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { IconShare3, IconUsers } from '@tabler/icons-vue'
import html2canvas from 'html2canvas'
import ZodiacIcon from './ZodiacIcon.vue'
import { toTitleCase } from '../utils/zodiac'
import { getHouseMeaning } from '../utils/houses'

const props = defineProps({
  chart: {
    type: Object,
    required: true
  },
  currentTransits: {
    type: Object,
    default: null
  },
  partnerReports: {
    type: Array,
    default: () => []
  },
  resolvedLocation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-partner', 'select-partner', 'remove-partner'])

const appUrl = 'natal-chart.flat18.app'
const shareCardRef = ref(null)
const isSharing = ref(false)

const BODY_LABELS = {
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
  asc: 'Ascendant'
}

const SIGN_PROFILES = {
  aries: {
    identity: 'direct, self-starting and quick to act',
    emotional: 'honest feeling, movement and room to respond fast',
    impression: 'bold, energetic and hard to ignore',
    today: 'clean decisions, movement and a little courage'
  },
  taurus: {
    identity: 'steady, sensual and built around what is real',
    emotional: 'comfort, loyalty and a pace that feels trustworthy',
    impression: 'calm, grounded and difficult to rush',
    today: 'simple pleasures, practical choices and follow-through'
  },
  gemini: {
    identity: 'curious, verbal and always gathering options',
    emotional: 'conversation, variety and space to think things through',
    impression: 'bright, responsive and easy to talk to',
    today: 'messages, questions and flexible thinking'
  },
  cancer: {
    identity: 'protective, intuitive and shaped by belonging',
    emotional: 'safety, care and a home base for feelings',
    impression: 'warm, observant and emotionally aware',
    today: 'care, memory and tending what needs protection'
  },
  leo: {
    identity: 'expressive, warm and drawn toward visibility',
    emotional: 'appreciation, play and generous affection',
    impression: 'confident, creative and naturally noticeable',
    today: 'creativity, pleasure and showing up with heart'
  },
  virgo: {
    identity: 'precise, useful and focused on improvement',
    emotional: 'order, practical care and details that make life easier',
    impression: 'thoughtful, capable and quietly discerning',
    today: 'editing, organising and making one useful fix'
  },
  libra: {
    identity: 'relational, fair and tuned to beauty and balance',
    emotional: 'harmony, mutual respect and graceful connection',
    impression: 'polished, considerate and socially aware',
    today: 'agreement, aesthetics and choosing the balanced route'
  },
  scorpio: {
    identity: 'intense, private and drawn to emotional truth',
    emotional: 'loyalty, depth and honesty without performance',
    impression: 'magnetic, contained and difficult to read fully',
    today: 'focus, intimacy and trusting the deeper signal'
  },
  sagittarius: {
    identity: 'expansive, candid and hungry for meaning',
    emotional: 'freedom, honesty and a horizon to move toward',
    impression: 'open, adventurous and direct',
    today: 'perspective, movement and saying the honest thing kindly'
  },
  capricorn: {
    identity: 'strategic, disciplined and serious about long-term results',
    emotional: 'reliability, respect and structure that can be trusted',
    impression: 'composed, capable and self-possessed',
    today: 'planning, boundaries and doing the next solid thing'
  },
  aquarius: {
    identity: 'original, independent and tuned to wider patterns',
    emotional: 'space, friendship and room to be unconventional',
    impression: 'distinctive, cool-headed and future-minded',
    today: 'fresh thinking, community and a useful experiment'
  },
  pisces: {
    identity: 'sensitive, imaginative and guided by feeling',
    emotional: 'softness, compassion and time to absorb the mood',
    impression: 'gentle, intuitive and hard to pin down',
    today: 'intuition, rest and following the creative current'
  }
}

const PHASE_PROMPTS = {
  'New Moon': 'a clean intention',
  'Waxing Crescent': 'a small first step',
  'First Quarter': 'a choice that needs momentum',
  'Waxing Gibbous': 'refining what is already growing',
  'Full Moon': 'clarity, release and emotional honesty',
  'Waning Gibbous': 'sharing what you have learned',
  'Last Quarter': 'editing what no longer fits',
  'Waning Crescent': 'rest, closure and inner listening'
}

const YEAR_BODY_COPY = {
  jupiter: {
    title: 'Jupiter growth',
    verb: 'opens growth, confidence and possibility through'
  },
  saturn: {
    title: 'Saturn structure',
    verb: 'asks for patience, boundaries and stronger foundations in'
  },
  uranus: {
    title: 'Uranus change',
    verb: 'keeps change, freedom and reinvention moving through'
  },
  neptune: {
    title: 'Neptune vision',
    verb: 'softens the picture and asks for imagination around'
  },
  pluto: {
    title: 'Pluto depth',
    verb: 'deepens transformation, honesty and renewal around'
  }
}

const CORE_DEFS = [
  { key: 'sun', label: 'Sun', role: 'Identity' },
  { key: 'moon', label: 'Moon', role: 'Feelings' },
  { key: 'asc', label: 'Ascendant', role: 'First impression' }
]

const placementsByBody = computed(() => {
  const map = new Map()
  ;(props.chart.placements || []).forEach((placement) => {
    map.set(placement.body, placement)
  })
  return map
})

const coreCards = computed(() => CORE_DEFS.map((def) => {
  const placement = placementsByBody.value.get(def.key)
  const signProfile = getSignProfile(placement?.sign)
  const signLabel = placement ? toTitleCase(placement.sign) : 'Unknown'
  const summary = getCoreSummary(def.key, signLabel, signProfile)

  return {
    ...def,
    placement,
    signLabel,
    summary
  }
}))

const simpleTitle = computed(() => {
  const sun = coreCards.value.find((item) => item.key === 'sun')?.signLabel || 'Solar'
  const moon = coreCards.value.find((item) => item.key === 'moon')?.signLabel || 'Lunar'
  const asc = coreCards.value.find((item) => item.key === 'asc')?.signLabel || 'Rising'
  return `${sun} Sun, ${moon} Moon, ${asc} Rising`
})

const primarySummary = computed(() => {
  const sun = coreCards.value.find((item) => item.key === 'sun')
  const moon = coreCards.value.find((item) => item.key === 'moon')
  const asc = coreCards.value.find((item) => item.key === 'asc')
  return `A chart led by ${sun?.signLabel || 'the Sun'}, felt through ${moon?.signLabel || 'the Moon'}, and first seen as ${asc?.signLabel || 'the Ascendant'}.`
})

const dominantFocus = computed(() => {
  const areas = Array.isArray(props.chart.focusAreas) ? props.chart.focusAreas : []
  return [...areas].sort((a, b) => b.score - a.score)[0] || null
})

const personalityHighlights = computed(() => {
  const highlights = coreCards.value.map((item) => ({
    title: item.role,
    text: `${item.label} in ${item.signLabel}: ${item.summary}`
  }))

  if (dominantFocus.value) {
    highlights.push({
      title: `${dominantFocus.value.label} emphasis`,
      text: dominantFocus.value.summaryLong || dominantFocus.value.summary
    })
  }

  return highlights.slice(0, 4)
})

const sharePersonalityHighlights = computed(() => personalityHighlights.value.slice(0, 3))

const todayDate = computed(() => {
  const raw = props.currentTransits?.generatedAt
  const date = raw ? new Date(raw) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
})

const todayLabel = computed(() => todayDate.value.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}))

const yearLabel = computed(() => String(todayDate.value.getFullYear()))

const activeTransitHouses = computed(() => {
  const placements = Array.isArray(props.currentTransits?.placements) ? props.currentTransits.placements : []
  const weights = {
    sun: 4,
    moon: 4,
    mercury: 2,
    venus: 3,
    mars: 3,
    jupiter: 4,
    saturn: 4,
    uranus: 3,
    neptune: 3,
    pluto: 3
  }
  const map = new Map()

  placements.forEach((placement) => {
    if (!placement.house) return
    const current = map.get(placement.house) || { house: placement.house, score: 0, bodies: [] }
    current.score += weights[placement.body] || 1
    current.bodies.push(BODY_LABELS[placement.body] || toTitleCase(placement.body))
    map.set(placement.house, current)
  })

  return Array.from(map.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item,
      meaning: getHouseMeaning(item.house)
    }))
})

const todayHighlights = computed(() => {
  if (!props.currentTransits) {
    return [{
      title: 'Current sky',
      text: "Today's planetary highlights are still loading."
    }]
  }

  const highlights = []
  const moon = props.currentTransits.moon
  if (moon) {
    const profile = getSignProfile(moon.sign)
    const phaseFocus = PHASE_PROMPTS[moon.phaseName] || 'checking in with the moment'
    highlights.push({
      title: `Moon in ${toTitleCase(moon.sign)}`,
      text: `${moon.phaseName} energy favours ${phaseFocus}. Let the day move through ${profile.today}.`
    })
  }

  activeTransitHouses.value.slice(0, 2).forEach((house) => {
    const name = house.meaning?.name || `House ${house.house}`
    highlights.push({
      title: name,
      text: `${house.bodies.join(', ')} currently highlight ${name.toLowerCase()}.`
    })
  })

  const retrogrades = Array.isArray(props.currentTransits.retrogrades) ? props.currentTransits.retrogrades : []
  highlights.push({
    title: retrogrades.length ? 'Retrograde review' : 'Forward motion',
    text: retrogrades.length
      ? `${retrogrades.map((item) => BODY_LABELS[item.body] || toTitleCase(item.body)).join(', ')} retrograde asks for review before rushing the next move.`
      : 'No major retrogrades are active in this chart view, so the day reads more direct and outward-moving.'
  })

  return highlights.slice(0, 4)
})

const todayPrediction = computed(() => {
  const moon = props.currentTransits?.moon
  const moonProfile = getSignProfile(moon?.sign)
  const topHouse = activeTransitHouses.value[0]
  const focus = topHouse?.meaning?.name?.toLowerCase() || 'the part of life asking for attention'
  const phaseFocus = PHASE_PROMPTS[moon?.phaseName] || 'one clear choice'
  return `Today favours ${moonProfile.today}. Put the most care into ${focus}, then make ${phaseFocus} easier to act on.`
})

const yearHighlights = computed(() => {
  const placements = Array.isArray(props.currentTransits?.placements) ? props.currentTransits.placements : []
  const byBody = new Map(placements.map((placement) => [placement.body, placement]))

  return ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
    .map((body) => {
      const placement = byBody.get(body)
      const profile = YEAR_BODY_COPY[body]
      if (!placement || !profile) return null
      const house = getHouseMeaning(placement.house)
      const area = house?.name || `House ${placement.house || ''}`.trim()
      return {
        title: profile.title,
        text: `${BODY_LABELS[body]} in ${toTitleCase(placement.sign)} ${profile.verb} ${area.toLowerCase()}.`
      }
    })
    .filter(Boolean)
    .slice(0, 3)
})

const yearPrediction = computed(() => {
  const placements = Array.isArray(props.currentTransits?.placements) ? props.currentTransits.placements : []
  const byBody = new Map(placements.map((placement) => [placement.body, placement]))
  const jupiterHouse = getHouseMeaning(byBody.get('jupiter')?.house)?.name || 'growth'
  const saturnHouse = getHouseMeaning(byBody.get('saturn')?.house)?.name || 'responsibility'
  return `${yearLabel.value} looks like a year of opening doors through ${jupiterHouse.toLowerCase()} while building stronger discipline around ${saturnHouse.toLowerCase()}.`
})

const partnerSummaries = computed(() => props.partnerReports.map((partner) => {
  const categories = partner.report?.categories || []
  const score = categories.length
    ? Math.round(categories.reduce((total, item) => total + item.score, 0) / categories.length)
    : 0
  const strongest = [...categories].sort((a, b) => b.score - a.score)[0]

  return {
    id: partner.id,
    label: partner.label,
    score,
    summary: strongest?.summary || 'Add partner details to compare your simplified charts.'
  }
}))

function getSignProfile(sign) {
  return SIGN_PROFILES[sign] || {
    identity: 'distinctive and personal',
    emotional: 'space to feel things in their own way',
    impression: 'individual and specific',
    today: 'noticing what feels most alive'
  }
}

function getCoreSummary(key, signLabel, profile) {
  if (key === 'sun') return `Your ${signLabel} identity is ${profile.identity}.`
  if (key === 'moon') return `Your ${signLabel} Moon needs ${profile.emotional}.`
  return `Your ${signLabel} Rising comes across as ${profile.impression}.`
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to create image.'))
    }, 'image/png')
  })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function shareStoryImage() {
  if (!shareCardRef.value || isSharing.value) return
  isSharing.value = true

  try {
    await nextTick()
    const canvas = await html2canvas(shareCardRef.value, {
      scale: 1,
      backgroundColor: '#f7f1e8',
      useCORS: true,
      width: 1080,
      height: 1920,
      windowWidth: 1080,
      windowHeight: 1920,
      scrollX: 0,
      scrollY: 0
    })
    const blob = await canvasToBlob(canvas)
    const file = new File([blob], `natal-chart-${props.chart.meta?.date || 'share'}.png`, { type: 'image/png' })
    const canNativeShare = navigator.maxTouchPoints > 0
      && navigator.share
      && navigator.canShare?.({ files: [file] })

    if (canNativeShare) {
      try {
        await navigator.share({
          title: 'My natal chart',
          text: simpleTitle.value,
          files: [file]
        })
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
        console.warn(error)
      }
    }

    downloadBlob(blob, file.name)
  } catch (error) {
    console.error(error)
  } finally {
    isSharing.value = false
  }
}
</script>
