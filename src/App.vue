<template>
  <main class="app-shell">
    <header class="app-header">
      <div class="hero-content">
        <div class="brand-mark">
          <span class="brand-dot"></span>
          Natal chart app by Flat 18
        </div>
        <h1 class="hero-title">Natal Chart Generator</h1>
        <p class="hero-copy">
          A fast, open-source natal chart generator using Swiss Ephemeris for accurate calculations.
          <span v-if="!chart">Enter your birth data, resolve location, and get a complete chart with clear, structured
            outputs.</span>
        </p>
      </div>

      <div class="hero-atmosphere" aria-hidden="true">
        <div class="hero-orbit hero-orbit--outer"></div>
        <div class="hero-orbit hero-orbit--inner"></div>
        <div class="hero-aura hero-aura--gold"></div>
        <div class="hero-aura hero-aura--blue"></div>
        <div class="hero-star hero-star--one"></div>
        <div class="hero-star hero-star--two"></div>
        <div class="hero-star hero-star--three"></div>
        <div class="hero-moon"></div>
        <div class="hero-glyph">✦</div>
      </div>
    </header>

    <div :class="`layout ${chart ? '' : 'flex'}`">
      <div class="stack">
        <BirthForm :loading="loading" :error="error" :resolved-location="resolvedLocation" @submit="handleSubmit" />

        <section v-if="chart" class="panel">
          <div class="panel-inner">
            <h2 class="section-title">Chart meta</h2>
            <p class="section-copy">Precise birth data and coordinates used to generate this chart.</p>

            <div class="meta-grid">
              <article class="meta-card">
                <span class="meta-kicker">Date</span>
                <div class="meta-value">{{ chart.meta.date }}</div>
              </article>

              <article class="meta-card">
                <span class="meta-kicker">Time</span>
                <div class="meta-value">{{ chart.meta.time }}</div>
              </article>

              <article class="meta-card">
                <span class="meta-kicker">Coordinates</span>
                <div class="meta-value">{{ chart.meta.lat.toFixed(2) }}, {{ chart.meta.lon.toFixed(2) }}</div>
              </article>

              <article class="meta-card">
                <span class="meta-kicker">Time zone</span>
                <div class="meta-value">{{ chart.meta.timeZone }}</div>
                <div class="meta-subvalue">
                  {{ formatOffset(chart.meta.utcOffsetMinutes) }}
                  <span v-if="chart.meta.timeZoneOverride" class="meta-hint">(override)</span>
                </div>
              </article>

              <article class="meta-card">
                <span class="meta-kicker">House system</span>
                <div class="meta-value">{{ formatHouseSystem(chart.meta.houseSystem) }}</div>
              </article>
            </div>

            <p class="footer-note">
              Chart math now runs on Swiss Ephemeris (WebAssembly) with the birth time converted to UTC using the
              location’s
              inferred time zone. House system choices are applied directly to the ephemeris calculation.
            </p>
            <div class="meta-actions">
              <button class="button" type="button" :disabled="isDownloading" @click="downloadPdf">
                {{ isDownloading ? 'Preparing PDF…' : 'Download chart PDF' }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <section ref="pdfTarget" :class="`results-grid ${chart ? '' : 'empty'}`">
        <template v-if="chart">
          <div class="map-row">
            <section class="panel map-card">
              <div class="panel-inner">
                <div class="map-visual">
                  <div class="map-circle" :style="mapStyle">
                    <span class="map-crosshair map-crosshair--h"></span>
                    <span class="map-crosshair map-crosshair--v"></span>
                    <span class="map-marker"></span>
                  </div>
                </div>
                <div class="map-meta">
                  <div class="map-meta-title">Birth data</div>
                  <div class="map-meta-copy">
                    {{ chart.meta.date }} · {{ chart.meta.time }}
                  </div>
                  <div class="map-meta-copy">
                    {{ resolvedLocation.label }}.
                    {{ resolvedLocation.lat }},
                    {{ resolvedLocation.lon }}
                  </div>
                </div>
              </div>
            </section>

            <section class="panel core-card">
              <div class="panel-inner">
                <h2 class="section-title">Core triad</h2>
                <p class="section-copy">The three primary placements that define identity, emotional response, and outward presentation.</p>

                <div class="core-list">
                  <article class="core-item">
                    <div class="core-title">Sun</div>
                    <div class="core-value">
                      <span v-if="corePlacements.sun" class="core-icon">
                        <ZodiacIcon :sign="corePlacements.sun.sign" :size="18" />
                      </span>
                      {{ formatPlacement(corePlacements.sun) }}
                    </div>
                    <div class="core-copy">Core vitality, ego, and life direction.</div>
                  </article>

                  <article class="core-item">
                    <div class="core-title">Moon</div>
                    <div class="core-value">
                      <span v-if="corePlacements.moon" class="core-icon">
                        <ZodiacIcon :sign="corePlacements.moon.sign" :size="18" />
                      </span>
                      {{ formatPlacement(corePlacements.moon) }}
                    </div>
                    <div class="core-copy">Emotional needs, instincts, and inner climate.</div>
                  </article>

                  <article class="core-item">
                    <div class="core-title">Ascendant</div>
                    <div class="core-value">
                      <span v-if="corePlacements.asc" class="core-icon">
                        <ZodiacIcon :sign="corePlacements.asc.sign" :size="18" />
                      </span>
                      {{ formatPlacement(corePlacements.asc) }}
                    </div>
                    <div class="core-copy">How you meet the world and how others first perceive you.</div>
                  </article>
                </div>
              </div>
            </section>
          </div>

          <div class="summary-row">
            <ChartWheel :placements="chart.placements" :aspects="chart.aspects" :cusps="chart.houseCusps" />
            <SummaryGauges :metrics="chart.metrics" />
          </div>
          <ElementModePanel :placements="chart.placements" />
          <PresentTimePanel v-if="currentTransits" :transits="currentTransits" />
          <!-- <AstroDepthPanel
            :extra-points="chart.extraPoints"
            :dignities="chart.dignities"
            :dispositors="chart.dispositors"
            :chart-ruler="chart.chartRuler"
            :aspect-patterns="chart.aspectPatterns"
          /> -->
          <FocusAreas :areas="chart.focusAreas" />
          <PartnerComparePanel
            :partners="partnerReports"
            :active-id="activePartner?.id || ''"
            @add="openPartnerModal"
            @select="selectPartnerChart"
            @remove="removePartnerChart"
          />

          <div ref="comparisonDetailRef" class="compare-detail">
            <RelationshipPanel
              v-if="relationshipReport"
              :report="relationshipReport"
              primary-action-label="Add partner"
              secondary-action-label="Remove partner"
              @edit="openPartnerModal"
              @clear="removeActivePartner"
            />

            <SynastryAspectList
              v-if="activePartner"
              :aspects="synastryAspects"
              :label-a="'You'"
              :label-b="activePartner?.label || 'Partner'"
            />

            <CompositeChartPanel v-if="compositeChart" :composite="compositeChart" />
          </div>

          <div class="card-grid vertical">
            <PlacementTable :placements="chart.placements" />
            <AspectList :aspects="chart.aspects" />
          </div>

          <InterpretationPanel :items="chart.interpretations" />
        </template>

        <section v-else class="panel empty-state">
          <div class="empty-state-inner">
            <div class="empty-state-orbit" aria-hidden="true">
              <span class="empty-state-ring empty-state-ring--outer"></span>
              <span class="empty-state-ring empty-state-ring--inner"></span>
              <span class="empty-state-core"></span>
            </div>
            <p class="empty-state-kicker">Birth chart preview</p>
            <h3>No chart loaded</h3>
            <p>
              Enter a birth date, exact time, and birthplace to generate a complete natal chart with accurate planetary positions and structured insights.
            </p>
          </div>
        </section>
      </section>
    </div>

    <footer class="app-footer">
      <div class="footer-title">Attribution & Licensing</div>
      <div class="footer-actions">
        <button class="footer-link-button" type="button" @click="isAboutModalOpen = true">
          About this app
        </button>
      </div>
      <ul class="footer-list">
        <li>
          Built with ❤️ by <a href="https://flat18.co.uk">Flat 18</a>
        </li>
        <li>
          Sourcecode on <a href="https://github.com/vswee/natal-chart-generator">GitHub</a>
        </li>
        <li>
          Geocoding: <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">Nominatim</a> on
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> data ©
          OpenStreetMap contributors (ODbL).
        </li>
        <li>
          Ephemeris: <a href="https://www.astro.com/swisseph/" target="_blank" rel="noreferrer">Swiss Ephemeris</a> via
          <a href="https://github.com/prolaxu/swisseph-wasm" target="_blank" rel="noreferrer">swisseph-wasm</a>
          (GPL-3.0-or-later; Swiss Ephemeris dual-licensed GPL/commercial).
        </li>
        <li>
          Icons: <a href="https://tabler.io/icons" target="_blank" rel="noreferrer">Tabler Icons</a> (MIT).
        </li>
      </ul>
    </footer>

    <div v-if="isAboutModalOpen" class="modal-overlay" @click.self="isAboutModalOpen = false">
      <div class="modal-card about-modal" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">About</p>
            <h3 id="about-modal-title" class="modal-title">How this app works and how accurate it is</h3>
          </div>
          <button class="subtle-button" type="button" @click="isAboutModalOpen = false">Close</button>
        </div>

        <section class="about-hero">
          <div class="about-hero-copy">
            <p class="modal-copy about-intro-copy">
              This guide explains what is scientifically precise in a natal chart, what remains interpretive,
              and why this app’s calculations can still be trusted as highly accurate and professional.
            </p>

            <div class="about-pill-row">
              <span class="about-pill">
                <IconStars :size="16" stroke-width="1.8" />
                Astronomy-led calculation
              </span>
              <span class="about-pill">
                <IconShieldCheck :size="16" stroke-width="1.8" />
                Professional-grade ephemeris
              </span>
              <span class="about-pill">
                <IconSparkles :size="16" stroke-width="1.8" />
                Interpretive, not deterministic
              </span>
            </div>
          </div>

          <div class="about-hero-art" aria-hidden="true">
            <div class="about-orbit about-orbit--outer"></div>
            <div class="about-orbit about-orbit--inner"></div>
            <div class="about-glow about-glow--a"></div>
            <div class="about-glow about-glow--b"></div>
            <div class="about-star about-star--a"></div>
            <div class="about-star about-star--b"></div>
            <div class="about-star about-star--c"></div>
            <div class="about-planet about-planet--major">
              <IconPlanet :size="34" stroke-width="1.8" />
            </div>
            <div class="about-planet about-planet--minor">
              <IconMoonStars :size="22" stroke-width="1.8" />
            </div>
            <div class="about-center-glyph">
              <IconNorthStar :size="20" stroke-width="1.8" />
            </div>
          </div>
        </section>

        <section class="about-stats" aria-label="About highlights">
          <article class="about-stat">
            <span class="about-stat-icon"><IconClock :size="18" stroke-width="1.9" /></span>
            <div>
              <div class="about-stat-label">Time handling</div>
              <div class="about-stat-value">Birth time converted to UTC</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon"><IconMapPin :size="18" stroke-width="1.9" /></span>
            <div>
              <div class="about-stat-label">Location handling</div>
              <div class="about-stat-value">Coordinates resolved from birthplace</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon"><IconChartDots3 :size="18" stroke-width="1.9" /></span>
            <div>
              <div class="about-stat-label">Chart engine</div>
              <div class="about-stat-value">Swiss Ephemeris in WebAssembly</div>
            </div>
          </article>
        </section>

        <div class="about-grid">
          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconNorthStar :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Astronomy, astrology, and method</p>
            </div>
            <h3 class="about-title">The chart is built from real celestial positions</h3>
            <p class="about-copy">
              Astrology starts with astronomy: the exact observed or modeled positions of the Sun, Moon, planets,
              and key angles for a specific moment and place on Earth. A natal chart is therefore a mathematically
              defined sky map for birth time and location.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              The interpretive layer is different. Astrology is a symbolic tradition with long historical use, but it
              is not established by mainstream science as a proven predictive discipline in the way physics or
              medicine are. In practice, most astrologers use it as a structured interpretive framework for patterns,
              timing, temperament, and reflection rather than as deterministic proof about a person’s life.
            </p>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconAtom2 :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Technology stack</p>
            </div>
            <h3 class="about-title">How our app calculates charts</h3>
            <p class="about-copy">
              Our app uses Swiss Ephemeris via WebAssembly in the browser, which is the same class of ephemeris
              engine trusted in professional astrology software. That means the planetary longitudes, house cusps,
              Ascendant, Midheaven, retrograde status, and aspect geometry are calculated from a serious astronomical
              library rather than approximated from simplified lookup tables.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <ul class="about-list">
              <li>Birthplace is resolved to latitude and longitude through geocoding.</li>
              <li>Time zone is inferred from coordinates, then converted to UTC before calculation.</li>
              <li>House systems such as Placidus, Koch, and Whole Sign are applied directly in chart math.</li>
              <li>Interpretations are then built from the computed placements, aspects, dignities, and emphasis scores.</li>
            </ul>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconShieldCheck :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Accuracy and trust</p>
            </div>
            <h3 class="about-title">What is highly accurate, and what should be read with care</h3>
            <p class="about-copy">
              If the birth date, birth time, and birthplace are correct, the astronomical side of the chart should be
              highly accurate and in line with professional-grade chart software. The strongest source of error is
              usually not the ephemeris engine, but the input data: even small birth-time differences can noticeably
              shift the Ascendant, house cusps, and sometimes the Moon.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              The app’s written meanings are best understood as professional-style astrological interpretations, not as
              scientifically guaranteed facts. You can trust the chart construction, the coordinate and time handling,
              and the consistency of the astrological techniques used. You should treat the interpretive text as a
              thoughtful reading framework whose usefulness depends on accurate birth data, the chosen house system,
              and how strongly you resonate with astrological symbolism.
            </p>

            <div class="about-note">
              <IconMoonStars :size="18" stroke-width="1.8" />
              <span>The calculations are exacting; the meaning layer remains symbolic and personal.</span>
            </div>
          </article>
        </div>
      </div>
    </div>

    <PartnerModal :open="isPartnerModalOpen" :loading="partnerLoading" :error="partnerError"
      :resolved-location="partnerResolvedLocation" @submit="handlePartnerSubmit" @close="closePartnerModal" />
  </main>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import {
  IconAtom2,
  IconChartDots3,
  IconClock,
  IconMapPin,
  IconMoonStars,
  IconNorthStar,
  IconPlanet,
  IconShieldCheck,
  IconSparkles,
  IconStars
} from '@tabler/icons-vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import BirthForm from './components/BirthForm.vue'
import SummaryGauges from './components/SummaryGauges.vue'
import FocusAreas from './components/FocusAreas.vue'
import RelationshipPanel from './components/RelationshipPanel.vue'
import PartnerModal from './components/PartnerModal.vue'
import PlacementTable from './components/PlacementTable.vue'
import AspectList from './components/AspectList.vue'
import InterpretationPanel from './components/InterpretationPanel.vue'
import ZodiacIcon from './components/ZodiacIcon.vue'
import ChartWheel from './components/ChartWheel.vue'
import ElementModePanel from './components/ElementModePanel.vue'
import PresentTimePanel from './components/PresentTimePanel.vue'
import PartnerComparePanel from './components/PartnerComparePanel.vue'
import SynastryAspectList from './components/SynastryAspectList.vue'
import CompositeChartPanel from './components/CompositeChartPanel.vue'
import { geocodeAddress } from './services/geocoding'
import { calculateNatalChart, calculateCurrentTransits, calculateCompositeChart } from './services/astrology'
import worldMap from './assets/img/3-Equirectangular_projection_world_map_without_borders.svg'
import { toTitleCase } from './utils/zodiac'
import { buildRelationshipReport } from './utils/relationship'
import { buildCrossAspects } from './utils/aspects'

const loading = ref(false)
const error = ref('')
const resolvedLocation = ref(null)
const chart = ref(null)
const pdfTarget = ref(null)
const isDownloading = ref(false)
const partnerCharts = ref([])
const activePartnerId = ref('')
const partnerLoading = ref(false)
const partnerError = ref('')
const partnerResolvedLocation = ref(null)
const isPartnerModalOpen = ref(false)
const isAboutModalOpen = ref(false)
const currentTransits = ref(null)
const compositeChart = ref(null)
const comparisonDetailRef = ref(null)
const corePlacements = computed(() => {
  if (!chart.value) return { sun: null, moon: null, asc: null }

  const placements = chart.value.placements || []
  const findBody = (body) => placements.find((item) => item.body === body)

  return {
    sun: findBody('sun'),
    moon: findBody('moon'),
    asc: findBody('asc')
  }
})
const activePartner = computed(() => {
  if (!partnerCharts.value.length) return null
  const match = partnerCharts.value.find((partner) => partner.id === activePartnerId.value)
  return match || partnerCharts.value[0]
})

const partnerReports = computed(() => {
  if (!chart.value) return []
  return partnerCharts.value.map((partner) => ({
    ...partner,
    report: buildRelationshipReport(chart.value, partner.chart, {
      labelA: 'You',
      labelB: partner.label
    })
  }))
})

const relationshipReport = computed(() => {
  if (!chart.value || !activePartner.value) return null
  return buildRelationshipReport(chart.value, activePartner.value.chart, {
    labelA: 'You',
    labelB: activePartner.value.label
  })
})

const synastryAspects = computed(() => {
  if (!chart.value || !activePartner.value) return []
  const allowedBodies = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'asc'
  ]
  return buildCrossAspects(chart.value.placements, activePartner.value.chart.placements, allowedBodies)
})
const mapStyle = computed(() => {
  if (!chart.value) return {}

  const { lat, lon } = chart.value.meta
  const lonPercent = ((lon + 180) / 360) * 100
  const x = 50
  const y = ((90 - lat) / 180) * 100
  const mapShiftX = 2 * lonPercent - 50

  return {
    '--crosshair-x': `${x}%`,
    '--crosshair-y': `${y}%`,
    '--map-shift-x': `${mapShiftX}%`,
    backgroundImage: `url(${worldMap})`
  }
})

watch(
  () => [chart.value, activePartner.value],
  async ([baseChart, partner]) => {
    if (!baseChart || !partner) {
      compositeChart.value = null
      return
    }
    try {
      compositeChart.value = await calculateCompositeChart(baseChart, partner.chart)
    } catch (error) {
      console.warn(error)
      compositeChart.value = null
    }
  },
  { immediate: true }
)

function formatPlacement(placement) {
  if (!placement) return '—'
  return `${toTitleCase(placement.sign)} ${placement.degreeInSign.toFixed(2)}°`
}

async function handleSubmit(formData) {
  loading.value = true
  error.value = ''
  currentTransits.value = null

  try {
    const manualLat = formData.lat === '' ? NaN : Number(formData.lat)
    const manualLon = formData.lon === '' ? NaN : Number(formData.lon)
    const hasManualCoords = Number.isFinite(manualLat) && Number.isFinite(manualLon)
    const location = hasManualCoords
      ? {
          lat: manualLat,
          lon: manualLon,
          label: formData.address || 'Custom coordinates'
        }
      : await geocodeAddress(formData.address)
    resolvedLocation.value = location

    const chartData = await calculateNatalChart({
      date: formData.date,
      time: formData.time,
      address: location.label,
      lat: location.lat,
      lon: location.lon,
      houseSystem: formData.houseSystem,
      timeZoneOverride: formData.timeZoneOverride
    })
    chart.value = chartData
    try {
      currentTransits.value = await calculateCurrentTransits(chartData)
    } catch (transitError) {
      console.warn(transitError)
      currentTransits.value = null
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

async function downloadPdf() {
  if (!chart.value || !pdfTarget.value || isDownloading.value) return
  isDownloading.value = true

  try {
    await nextTick()

    const canvas = await html2canvas(pdfTarget.value, {
      scale: 2,
      backgroundColor: '#f5f7fb',
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const scale = pageWidth / imgWidth
    const scaledHeight = imgHeight * scale

    let position = 0
    let heightLeft = scaledHeight

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight)
      heightLeft -= pageHeight
    }

    const filename = chart.value?.meta?.date
      ? `natal-chart-${chart.value.meta.date}.pdf`
      : 'natal-chart.pdf'
    pdf.save(filename)
  } catch (err) {
    console.error(err)
  } finally {
    isDownloading.value = false
  }
}

async function handlePartnerSubmit(formData) {
  partnerLoading.value = true
  partnerError.value = ''

  try {
    const manualLat = formData.lat === '' ? NaN : Number(formData.lat)
    const manualLon = formData.lon === '' ? NaN : Number(formData.lon)
    const hasManualCoords = Number.isFinite(manualLat) && Number.isFinite(manualLon)
    const location = hasManualCoords
      ? {
          lat: manualLat,
          lon: manualLon,
          label: formData.address || 'Custom coordinates'
        }
      : await geocodeAddress(formData.address)
    partnerResolvedLocation.value = location

    const chartData = await calculateNatalChart({
      date: formData.date,
      time: formData.time,
      address: location.label,
      lat: location.lat,
      lon: location.lon,
      houseSystem: formData.houseSystem,
      timeZoneOverride: formData.timeZoneOverride
    })

    const label = formData.label?.trim() || `Partner ${partnerCharts.value.length + 1}`
    const id = (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
    partnerCharts.value = [
      ...partnerCharts.value,
      {
        id,
        label,
        chart: chartData
      }
    ]
    activePartnerId.value = id
    isPartnerModalOpen.value = false
  } catch (err) {
    partnerError.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    partnerLoading.value = false
  }
}

function openPartnerModal() {
  partnerError.value = ''
  partnerResolvedLocation.value = null
  isPartnerModalOpen.value = true
}

function closePartnerModal() {
  isPartnerModalOpen.value = false
}

function removePartnerChart(id) {
  partnerCharts.value = partnerCharts.value.filter((partner) => partner.id !== id)
  if (activePartnerId.value === id) {
    activePartnerId.value = partnerCharts.value[0]?.id || ''
  }
}

function selectPartnerChart(id) {
  activePartnerId.value = id
  nextTick(() => {
    if (!comparisonDetailRef.value) return
    comparisonDetailRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function removeActivePartner() {
  if (!activePartner.value) return
  removePartnerChart(activePartner.value.id)
}

function formatOffset(minutes) {
  if (typeof minutes !== 'number' || Number.isNaN(minutes)) return ''
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const mins = Math.round(abs % 60)
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function formatHouseSystem(value) {
  if (!value) return 'Placidus'
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
</script>
