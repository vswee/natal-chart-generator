<template>
  <section class="simplified-chart">
    <div class="simple-hero panel">
      <ChartWheel
        class="simple-hero-wheel"
        :embedded="true"
        :show-chrome="false"
        :decorative="true"
        :placements="chart.placements"
        :aspects="chart.aspects"
        :cusps="chart.houseCusps"
      />
      <div class="simple-hero-symbol simple-hero-symbol--sun" aria-hidden="true">
        <AstroGlyph body="sun" :size="124" />
      </div>
      <div class="simple-hero-symbol simple-hero-symbol--moon" aria-hidden="true">
        <AstroGlyph body="moon" :size="104" />
      </div>
      <div class="simple-hero-symbol simple-hero-symbol--asc" aria-hidden="true">
        <AstroGlyph body="asc" :size="112" />
      </div>
      <div class="panel-inner simple-hero-inner">
        <div class="simple-hero-copy">
          <p class="simple-kicker">Simple chart</p>
          <h2 class="simple-title">{{ simpleTitle }}</h2>
          <p class="simple-copy">{{ primarySummary }}</p>
        </div>

        <div class="simple-hero-actions">
          <div v-if="showShareThemeOptions" class="simple-share-theme" aria-label="Share card theme">
            <button
              class="simple-theme-button"
              :class="{ 'is-active': shareTheme === 'light' }"
              type="button"
              :aria-pressed="shareTheme === 'light'"
              @click="shareTheme = 'light'"
            >
              <AstroGlyph body="sun" :size="18" />
              <span>Light</span>
            </button>
            <button
              class="simple-theme-button"
              :class="{ 'is-active': shareTheme === 'dark' }"
              type="button"
              :aria-pressed="shareTheme === 'dark'"
              @click="shareTheme = 'dark'"
            >
              <AstroGlyph body="moon" :size="18" />
              <span>Dark</span>
            </button>
          </div>
          <button class="button simple-share-button" type="button" :disabled="isExporting" @click="shareStoryImage">
            <IconShare3 :size="18" stroke-width="2" />
            <span>{{ isSharing ? 'Creating image...' : 'Share chart' }}</span>
          </button>
          <button
            class="button simple-share-button simple-gif-button"
            :class="{ 'is-ready-to-save': generatedChartGifFile }"
            type="button"
            :disabled="isExporting"
            @click="shareChartGif"
          >
            <IconSparkles :size="18" stroke-width="2" />
            <span>{{ chartGifButtonLabel }}</span>
          </button>
          <div v-if="isRenderingChartGif" class="simple-reel-progress" role="status" aria-live="polite">
            <div class="simple-reel-progress-top">
              <span>{{ chartGifProgressLabel }}</span>
              <strong>{{ chartGifProgressPercent }}%</strong>
            </div>
            <div class="simple-reel-progress-track" aria-hidden="true">
              <span :style="{ width: `${chartGifProgressPercent}%` }"></span>
            </div>
          </div>
          <button
            class="button simple-share-button simple-reel-button"
            :class="{ 'is-ready-to-save': generatedReelFile }"
            type="button"
            :disabled="isExporting"
            @click="shareReelVideo"
          >
            <IconVideo :size="18" stroke-width="2" />
            <span>{{ reelButtonLabel }}</span>
          </button>
          <div v-if="isRenderingReel" class="simple-reel-progress" role="status" aria-live="polite">
            <div class="simple-reel-progress-top">
              <span>{{ reelProgressLabel }}</span>
              <strong>{{ reelProgressPercent }}%</strong>
            </div>
            <div class="simple-reel-progress-track" aria-hidden="true">
              <span :style="{ width: `${reelProgressPercent}%` }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="simple-core-grid">
      <article v-for="item in coreCards" :key="item.key" class="simple-core-card panel">
        <span class="simple-card-planet" aria-hidden="true">
          <AstroGlyph :body="item.key" :size="62" />
        </span>
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
      <article ref="shareCardRef" class="share-card" :class="shareCardClass">
        <div class="share-card-symbol share-card-symbol--sun">
          <AstroGlyph body="sun" :size="320" />
        </div>
        <div class="share-card-symbol share-card-symbol--moon">
          <AstroGlyph body="moon" :size="280" />
        </div>
        <div class="share-card-symbol share-card-symbol--angle">
          <AstroGlyph body="asc" :size="200" />
        </div>

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
          <div v-for="item in shareCoreCards" :key="`share-${item.key}`" class="share-card-core-item">
            <div class="share-card-core-top">
              <span>{{ item.label }}</span>
              <b><AstroGlyph :body="item.key" :size="28" /></b>
            </div>
            <strong>
              <span v-if="item.placement" class="share-card-sign-symbol"><ZodiacIcon :sign="item.placement.sign" :size="28" /></span>
              {{ item.signLabel }}
            </strong>
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

    <canvas ref="reelCanvasRef" class="reel-canvas" width="1080" height="1920" aria-hidden="true"></canvas>
    <canvas ref="chartGifCanvasRef" class="chart-gif-canvas" :width="chartGifSize" :height="chartGifSize" aria-hidden="true"></canvas>
    <video
      ref="reelVideoRef"
      class="reel-video-source"
      :src="reelVideoSrc"
      muted
      playsinline
      loop
      preload="auto"
      crossorigin="anonymous"
      aria-hidden="true"
    ></video>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { IconShare3, IconSparkles, IconUsers, IconVideo } from '@tabler/icons-vue'
import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import html2canvas from 'html2canvas'
import AstroGlyph from './AstroGlyph.vue'
import ChartWheel from './ChartWheel.vue'
import ZodiacIcon from './ZodiacIcon.vue'
import { loadGlyphImage } from '../utils/astro-glyphs'
import { toTitleCase } from '../utils/zodiac'
import { getHouseMeaning } from '../utils/houses'
import {
  CHART_GIF_DURATION_MS,
  CHART_GIF_FPS,
  CHART_GIF_RENDER_SCALE,
  CHART_GIF_SIZE,
  createChartGifScene,
  drawChartGifFrame
} from '../utils/chart-gif'

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

const emit = defineEmits(['add-partner', 'select-partner', 'remove-partner', 'media-generated'])

const appUrl = 'natal-chart.flat18.app'
const shareCardRef = ref(null)
const reelCanvasRef = ref(null)
const chartGifCanvasRef = ref(null)
const reelVideoRef = ref(null)
const isSharing = ref(false)
const isRenderingReel = ref(false)
const isRenderingChartGif = ref(false)
const generatedReelFile = ref(null)
const generatedChartGifFile = ref(null)
const reelProgress = ref(0)
const chartGifProgress = ref(0)
const shareTheme = ref('light')
const showShareThemeOptions = false
const reelVideoSrc = '/share-loops/instagram-reel-loop.mp4'
const REEL_WIDTH = 1080
const REEL_HEIGHT = 1920
const chartGifSize = CHART_GIF_SIZE
const DEFAULT_REEL_DURATION_MS = 8000
const REEL_FPS = 30
const REEL_SAFE = {
  top: 120,
  right: 190,
  bottom: 360,
  left: 72
}
const reelGlyphAssets = ref(null)

function drawCenteredGlyph(ctx, image, centerX, centerY, size) {
  if (!image) return
  ctx.drawImage(image, centerX - size / 2, centerY - size / 2, size, size)
}

async function preloadReelGlyphAssets() {
  if (reelGlyphAssets.value) return reelGlyphAssets.value

  const assetEntries = await Promise.all([
    ['sunDark', loadGlyphImage('body', 'sun', '#152421')],
    ['moonDark', loadGlyphImage('body', 'moon', '#152421')],
    ['ascDark', loadGlyphImage('body', 'asc', '#152421')],
    ['jupiterDark', loadGlyphImage('body', 'jupiter', '#152421')],
    ['saturnDark', loadGlyphImage('body', 'saturn', '#152421')],
    ['sunLight', loadGlyphImage('body', 'sun', '#fff8ef')],
    ['moonLight', loadGlyphImage('body', 'moon', '#fff8ef')],
    ['ascLight', loadGlyphImage('body', 'asc', '#fff8ef')]
  ])

  reelGlyphAssets.value = Object.fromEntries(assetEntries)
  return reelGlyphAssets.value
}

function emitMediaGenerated(kind, file) {
  if (!file) return
  emit('media-generated', {
    kind,
    file,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString()
  })
}

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

const shareCoreCards = computed(() => coreCards.value.map((item) => ({ ...item })))

const shareCardClass = computed(() => ({
  'share-card--dark': shareTheme.value === 'dark'
}))

const reelProgressPercent = computed(() => Math.min(100, Math.max(0, Math.round(reelProgress.value * 100))))

const reelProgressLabel = computed(() => {
  if (reelProgress.value < 0.08) return 'Preparing video'
  if (reelProgress.value < 0.98) return 'Rendering reel'
  return 'Finishing export'
})

const reelButtonLabel = computed(() => {
  if (isRenderingReel.value) return 'Creating reel...'
  if (generatedReelFile.value) return 'Save reel'
  return 'Share reel'
})

const isExporting = computed(() => isSharing.value || isRenderingReel.value || isRenderingChartGif.value)

const chartGifProgressPercent = computed(() => Math.min(100, Math.max(0, Math.round(chartGifProgress.value * 100))))

const chartGifProgressLabel = computed(() => {
  if (chartGifProgress.value < 0.14) return 'Spinning up the wheel'
  if (chartGifProgress.value < 0.48) return 'Settling into alignment'
  if (chartGifProgress.value < 0.95) return 'Rendering chart GIF'
  return 'Finishing GIF'
})

const chartGifButtonLabel = computed(() => {
  if (isRenderingChartGif.value) return 'Creating GIF...'
  if (generatedChartGifFile.value) return 'Save GIF'
  return 'Share chart GIF'
})

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

watch([simpleTitle, primarySummary, todayPrediction, yearPrediction], () => {
  clearGeneratedReel()
  clearGeneratedChartGif()
})

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

function clearGeneratedReel() {
  generatedReelFile.value = null
}

function clearGeneratedChartGif() {
  generatedChartGifFile.value = null
}

function isLikelyIOS() {
  const platform = navigator.platform || ''
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function shouldUseTapToShareReelFlow() {
  return isLikelyIOS() || (navigator.maxTouchPoints > 0 && !!navigator.share)
}

function shouldUseTapToShareGifFlow() {
  return shouldUseTapToShareReelFlow()
}

function showShareUnavailableMessage(kind, saveLabel) {
  const message = window.isSecureContext
    ? `This browser could not open the share sheet for this ${kind}.`
    : `iOS can save ${kind}s from the share sheet only on HTTPS. Use the live HTTPS site or an HTTPS dev URL, then tap ${saveLabel} again.`

  if (typeof window.alert === 'function') {
    window.alert(message)
  } else {
    console.error(message)
  }
}

function getPreferredReelFormat() {
  if (typeof MediaRecorder === 'undefined') return null
  const formats = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs="avc1.42E01E"', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs=h264', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' }
  ]
  return formats.find((format) => MediaRecorder.isTypeSupported(format.mimeType)) || null
}

function getBaseVideoType(mimeType) {
  return (mimeType || '').split(';')[0].trim().toLowerCase()
}

function getReelExtension(mimeType, fallbackExtension) {
  const baseType = getBaseVideoType(mimeType)
  if (baseType === 'video/mp4') return 'mp4'
  if (baseType === 'video/webm') return 'webm'
  return fallbackExtension || 'mp4'
}

function getRecordedVideoType(chunks, recorderMimeType, fallbackMimeType) {
  const chunkType = chunks.find((chunk) => chunk?.type)?.type
  return getBaseVideoType(chunkType || recorderMimeType || fallbackMimeType) || 'video/mp4'
}

function validateVideoBlob(blob) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(blob)
    let settled = false

    const finish = (error) => {
      if (settled) return
      settled = true
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
      video.removeEventListener('error', onError)
      window.clearTimeout(timeout)
      URL.revokeObjectURL(url)

      if (error) reject(error)
      else resolve()
    }

    const onLoaded = () => {
      if (video.videoWidth && video.videoHeight) finish()
      else finish(new Error('The exported video could not be read.'))
    }
    const onError = () => finish(new Error('The exported video could not be read.'))
    const timeout = window.setTimeout(() => finish(new Error('The exported video timed out while loading.')), 4000)

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.addEventListener('loadedmetadata', onLoaded, { once: true })
    video.addEventListener('canplay', onLoaded, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.src = url
    video.load()
  })
}

async function shareFile(file, title, text) {
  if (!navigator.share) return false

  const shareData = {
    title,
    text,
    files: [file]
  }

  try {
    await navigator.share(shareData)
    return true
  } catch (error) {
    if (error?.name === 'AbortError') return true
    console.warn(error)
    return false
  }
}

async function sharePreparedReel() {
  const file = generatedReelFile.value
  if (!file) return false

  if (await shareFile(file, 'My natal chart reel', simpleTitle.value)) {
    return true
  }

  if (isLikelyIOS()) {
    showShareUnavailableMessage('reel', 'Save reel')
    return true
  }

  downloadBlob(file, file.name)
  clearGeneratedReel()
  return true
}

async function sharePreparedChartGif() {
  const file = generatedChartGifFile.value
  if (!file) return false

  if (await shareFile(file, 'My natal chart GIF', simpleTitle.value)) {
    return true
  }

  if (isLikelyIOS()) {
    showShareUnavailableMessage('GIF', 'Save GIF')
    return true
  }

  downloadBlob(file, file.name)
  clearGeneratedChartGif()
  return true
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function waitForVideoReady(video) {
  return new Promise((resolve) => {
    if (!video) {
      resolve(null)
      return
    }

    if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
      resolve(video)
      return
    }

    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
      video.removeEventListener('error', onError)
      window.clearTimeout(timeout)
      resolve(result)
    }
    const onLoaded = () => finish(video)
    const onError = () => finish(null)
    const timeout = window.setTimeout(() => finish(null), 1800)

    video.addEventListener('loadeddata', onLoaded, { once: true })
    video.addEventListener('canplay', onLoaded, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.load()
  })
}

function drawCoverVideo(ctx, video) {
  const videoRatio = video.videoWidth / video.videoHeight
  const canvasRatio = REEL_WIDTH / REEL_HEIGHT
  let sourceWidth = video.videoWidth
  let sourceHeight = video.videoHeight
  let sourceX = 0
  let sourceY = 0

  if (videoRatio > canvasRatio) {
    sourceWidth = video.videoHeight * canvasRatio
    sourceX = (video.videoWidth - sourceWidth) / 2
  } else {
    sourceHeight = video.videoWidth / canvasRatio
    sourceY = (video.videoHeight - sourceHeight) / 2
  }

  ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, REEL_WIDTH, REEL_HEIGHT)
}

function drawGeneratedReelBackground(ctx, progress) {
  const gradient = ctx.createLinearGradient(0, 0, REEL_WIDTH, REEL_HEIGHT)
  gradient.addColorStop(0, '#fff8ee')
  gradient.addColorStop(0.48, '#e9f4ef')
  gradient.addColorStop(1, '#f7e8e2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT)

  const glyphs = [
    { image: reelGlyphAssets.value?.sunDark, size: 230 },
    { image: reelGlyphAssets.value?.moonDark, size: 230 },
    { image: reelGlyphAssets.value?.ascDark, size: 190 },
    { image: reelGlyphAssets.value?.jupiterDark, size: 220 },
    { image: reelGlyphAssets.value?.saturnDark, size: 220 }
  ]

  glyphs.forEach((glyph, index) => {
    const phase = progress + index * 0.18
    const x = REEL_WIDTH * (0.12 + ((index * 0.23 + progress * 0.08) % 0.78))
    const y = REEL_HEIGHT * (0.12 + ((index * 0.19 + progress * 0.12) % 0.72))
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.sin(phase * Math.PI * 2) * 0.08)
    ctx.globalAlpha = index === 0 ? 0.12 : 0.085
    drawCenteredGlyph(ctx, glyph.image, 0, 0, glyph.size)
    ctx.restore()
  })
}

function drawReelText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)
  const visibleLines = lines.slice(0, maxLines)
  visibleLines.forEach((item, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? '...' : ''
    ctx.fillText(`${item}${suffix}`, x, y + index * lineHeight)
  })
  return visibleLines.length * lineHeight
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function drawReelOverlay(ctx, progress) {
  const safeLeft = REEL_SAFE.left
  const safeRight = REEL_WIDTH - REEL_SAFE.right
  const safeTop = REEL_SAFE.top
  const safeBottom = REEL_HEIGHT - REEL_SAFE.bottom
  const safeWidth = safeRight - safeLeft
  const pulse = 0.94 + Math.sin(progress * Math.PI * 2) * 0.04
  const cardX = safeLeft
  const cardWidth = safeWidth
  const innerX = cardX + 44
  const innerWidth = cardWidth - 88

  ctx.save()
  ctx.fillStyle = 'rgba(8, 12, 18, 0.22)'
  ctx.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT)

  ctx.globalAlpha = 0.92
  ctx.fillStyle = 'rgba(255, 251, 246, 0.82)'
  drawRoundedRect(ctx, cardX, safeTop + 118, cardWidth, 610, 44)
  ctx.fill()

  ctx.globalAlpha = 0.42
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.76)'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, cardX + 12, safeTop + 130, cardWidth - 24, 586, 34)
  ctx.stroke()

  ctx.globalAlpha = 0.3
  drawCenteredGlyph(ctx, reelGlyphAssets.value?.sunDark, safeRight - 24, safeTop + 305, 210)

  ctx.globalAlpha = 1
  ctx.fillStyle = '#172421'
  ctx.font = '800 22px Manrope, Arial, sans-serif'
  ctx.letterSpacing = '0px'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('NATAL CHART APP', innerX, safeTop + 184)

  ctx.fillStyle = 'rgba(23, 36, 33, 0.55)'
  ctx.font = '800 20px Manrope, Arial, sans-serif'
  ctx.fillText('SIMPLE NATAL CHART', innerX, safeTop + 224)

  ctx.fillStyle = '#172421'
  ctx.font = '700 78px "Cormorant Garamond", Georgia, serif'
  drawReelText(ctx, simpleTitle.value, innerX, safeTop + 332, innerWidth, 74, 3)

  ctx.fillStyle = 'rgba(23, 36, 33, 0.72)'
  ctx.font = '700 27px Manrope, Arial, sans-serif'
  drawReelText(ctx, primarySummary.value, innerX, safeTop + 548, innerWidth - 30, 40, 3)

  const coreItemWidth = (cardWidth - 112) / 3
  const cardY = safeTop + 770
  shareCoreCards.value.forEach((item, index) => {
    const x = innerX + index * (coreItemWidth + 12)
    ctx.globalAlpha = 0.9
    ctx.fillStyle = 'rgba(255, 251, 246, 0.78)'
    drawRoundedRect(ctx, x, cardY, coreItemWidth, 178, 28)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.54)'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, x + 1, cardY + 1, coreItemWidth - 2, 176, 27)
    ctx.stroke()
    const assetKey = `${item.key}Dark`
    drawCenteredGlyph(ctx, reelGlyphAssets.value?.[assetKey], x + coreItemWidth / 2, cardY + 62, 58)
    ctx.fillStyle = 'rgba(23, 36, 33, 0.62)'
    ctx.font = '800 18px Manrope, Arial, sans-serif'
    ctx.fillText(item.label.toUpperCase(), x + coreItemWidth / 2, cardY + 100)
    ctx.fillStyle = '#172421'
    ctx.font = '700 34px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(item.signLabel, x + coreItemWidth / 2, cardY + 142)
  })

  ctx.globalAlpha = 0.92
  ctx.fillStyle = 'rgba(18, 29, 27, 0.78)'
  drawRoundedRect(ctx, cardX, safeTop + 982, cardWidth, 318, 38)
  ctx.fill()
  ctx.globalAlpha = 0.2
  drawCenteredGlyph(ctx, reelGlyphAssets.value?.moonLight, safeRight - 34, safeTop + 1160, 180)

  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(255, 248, 239, 0.68)'
  ctx.font = '800 22px Manrope, Arial, sans-serif'
  ctx.fillText('TODAY', innerX, safeTop + 1060)
  ctx.fillStyle = '#fff8ef'
  ctx.font = '800 35px Manrope, Arial, sans-serif'
  drawReelText(ctx, todayPrediction.value, innerX, safeTop + 1128, innerWidth - 18, 50, 3)

  ctx.globalAlpha = 0.82
  ctx.strokeStyle = 'rgba(255, 248, 239, 0.42)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(innerX, safeTop + 1274)
  ctx.lineTo(safeRight - 40, safeTop + 1274)
  ctx.stroke()

  ctx.globalAlpha = 0.88
  ctx.fillStyle = 'rgba(255, 248, 239, 0.84)'
  const footerTop = safeBottom - 126
  drawRoundedRect(ctx, safeLeft, footerTop, safeWidth, 112, 34)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#172421'
  ctx.font = '800 24px Manrope, Arial, sans-serif'
  ctx.fillText('Generated lovingly by Natal Chart App', safeLeft + 34, footerTop + 48)
  ctx.fillStyle = 'rgba(23, 36, 33, 0.68)'
  ctx.font = '800 22px Manrope, Arial, sans-serif'
  ctx.fillText(appUrl, safeLeft + 34, footerTop + 82)

  ctx.translate(safeRight - 78, safeTop + 92)
  ctx.scale(pulse, pulse)
  ctx.globalAlpha = 0.72
  drawCenteredGlyph(ctx, reelGlyphAssets.value?.sunLight, 0, 0, 86)
  ctx.restore()
}

function getReelDurationMs(video) {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    return DEFAULT_REEL_DURATION_MS
  }
  return Math.round(video.duration * 1000)
}

function renderReelFrame(ctx, video, startTime, timestamp, durationMs) {
  const elapsed = timestamp - startTime
  const progress = Math.min(elapsed / durationMs, 1)

  if (video && video.readyState >= 2 && video.videoWidth && video.videoHeight) {
    drawCoverVideo(ctx, video)
  } else {
    drawGeneratedReelBackground(ctx, progress)
  }
  drawReelOverlay(ctx, progress)
  return progress
}

async function shareReelVideo() {
  if (isRenderingReel.value) return

  if (generatedReelFile.value) {
    await sharePreparedReel()
    return
  }

  const canvas = reelCanvasRef.value
  const reelFormat = getPreferredReelFormat()

  if (!canvas || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined' || !reelFormat) {
    console.error('This browser cannot create reel video exports.')
    return
  }

  isRenderingReel.value = true
  reelProgress.value = 0

  try {
    await nextTick()
    await preloadReelGlyphAssets()
    const ctx = canvas.getContext('2d')
    const stream = canvas.captureStream(REEL_FPS)
    const recorder = new MediaRecorder(stream, {
      mimeType: reelFormat.mimeType,
      videoBitsPerSecond: 6_000_000
    })
    const chunks = []

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) chunks.push(event.data)
    })

    const stopped = new Promise((resolve) => {
      recorder.addEventListener('stop', resolve, { once: true })
    })

    const video = await waitForVideoReady(reelVideoRef.value)
    const durationMs = getReelDurationMs(video)
    reelProgress.value = 0.04
    if (video) {
      video.currentTime = 0
      await video.play().catch(() => null)
    }

    recorder.start(250)
    await new Promise((resolve) => {
      const startTime = performance.now()
      const draw = (timestamp) => {
        const progress = renderReelFrame(ctx, video, startTime, timestamp, durationMs)
        reelProgress.value = Math.min(0.98, progress)
        if (progress >= 1) {
          resolve()
          return
        }
        requestAnimationFrame(draw)
      }
      requestAnimationFrame(draw)
    })

    if (recorder.state === 'recording' && typeof recorder.requestData === 'function') {
      recorder.requestData()
    }
    recorder.stop()
    if (video) video.pause()
    await stopped
    reelProgress.value = 1

    if (!chunks.length) {
      throw new Error('No video data was recorded.')
    }

    const recordedType = getRecordedVideoType(chunks, recorder.mimeType, reelFormat.mimeType)
    const blob = new Blob(chunks, { type: recordedType })
    await validateVideoBlob(blob)

    const extension = getReelExtension(recordedType, reelFormat.extension)
    const file = new File(
      [blob],
      `natal-chart-${props.chart.meta?.date || 'share'}-reel.${extension}`,
      { type: recordedType }
    )
    generatedReelFile.value = file
    emitMediaGenerated('reel', file)

    if (shouldUseTapToShareReelFlow()) return

    if (await shareFile(file, 'My natal chart reel', simpleTitle.value)) return

    downloadBlob(blob, file.name)
    clearGeneratedReel()
  } catch (error) {
    console.error(error)
  } finally {
    isRenderingReel.value = false
    window.setTimeout(() => {
      if (!isRenderingReel.value) reelProgress.value = 0
    }, 300)
  }
}

function getChartGifFrameDelay() {
  return Math.round(1000 / CHART_GIF_FPS)
}

function createChartGifFileName() {
  return `natal-chart-${props.chart.meta?.date || 'share'}-chart.gif`
}

async function shareChartGif() {
  if (isRenderingChartGif.value) return

  if (generatedChartGifFile.value) {
    await sharePreparedChartGif()
    return
  }

  const canvas = chartGifCanvasRef.value
  if (!canvas || typeof canvas.getContext !== 'function') {
    console.error('This browser cannot create GIF exports.')
    return
  }

  isRenderingChartGif.value = true
  chartGifProgress.value = 0

  try {
    await nextTick()
    if (document.fonts?.ready) {
      await document.fonts.ready.catch(() => null)
    }

    const outputCtx = canvas.getContext('2d', { willReadFrequently: true })
    if (!outputCtx) {
      throw new Error('Unable to prepare the GIF canvas.')
    }

    const renderSize = Math.round(CHART_GIF_SIZE * CHART_GIF_RENDER_SCALE)
    const renderCanvas = document.createElement('canvas')
    renderCanvas.width = renderSize
    renderCanvas.height = renderSize
    const renderCtx = renderCanvas.getContext('2d')
    if (!renderCtx) {
      throw new Error('Unable to prepare the high-resolution GIF canvas.')
    }
    outputCtx.imageSmoothingEnabled = true
    if ('imageSmoothingQuality' in outputCtx) {
      outputCtx.imageSmoothingQuality = 'high'
    }

    const scene = await createChartGifScene(props.chart, renderSize)
    const frameCount = Math.max(2, Math.round((CHART_GIF_DURATION_MS / 1000) * CHART_GIF_FPS))
    const frameDelay = getChartGifFrameDelay()
    const gif = GIFEncoder({
      auto: true,
      initialCapacity: CHART_GIF_SIZE * CHART_GIF_SIZE
    })

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const progress = frameIndex / (frameCount - 1)
      renderCtx.clearRect(0, 0, renderSize, renderSize)
      drawChartGifFrame(renderCtx, scene, progress)
      outputCtx.clearRect(0, 0, CHART_GIF_SIZE, CHART_GIF_SIZE)
      outputCtx.drawImage(renderCanvas, 0, 0, renderSize, renderSize, 0, 0, CHART_GIF_SIZE, CHART_GIF_SIZE)
      const imageData = outputCtx.getImageData(0, 0, CHART_GIF_SIZE, CHART_GIF_SIZE)
      const palette = quantize(imageData.data, 256, { format: 'rgb565' })
      const indexed = applyPalette(imageData.data, palette)

      gif.writeFrame(indexed, CHART_GIF_SIZE, CHART_GIF_SIZE, {
        palette,
        delay: frameDelay
      })

      chartGifProgress.value = Math.min(0.98, progress)
      if (frameIndex % 2 === 0) {
        await waitForAnimationFrame()
      }
    }

    gif.finish()
    chartGifProgress.value = 1

    const blob = new Blob([gif.bytes()], { type: 'image/gif' })
    const file = new File([blob], createChartGifFileName(), { type: 'image/gif' })
    generatedChartGifFile.value = file
    emitMediaGenerated('chart-gif', file)

    if (shouldUseTapToShareGifFlow()) return

    downloadBlob(blob, file.name)
    clearGeneratedChartGif()
  } catch (error) {
    console.error(error)
  } finally {
    isRenderingChartGif.value = false
    window.setTimeout(() => {
      if (!isRenderingChartGif.value) chartGifProgress.value = 0
    }, 300)
  }
}

async function shareStoryImage() {
  if (!shareCardRef.value || isExporting.value) return
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
    const file = new File(
      [blob],
      `natal-chart-${props.chart.meta?.date || 'share'}-${shareTheme.value}.png`,
      { type: 'image/png' }
    )
    emitMediaGenerated('story-image', file)
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
