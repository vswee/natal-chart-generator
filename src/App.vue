<template>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <div class="brand-mark">
          <span class="brand-dot"></span>
          Natal chart app by Flat 18
        </div>
        <h1 class="hero-title">Natal chart generator</h1>
        <p class="hero-copy">
          A fast, open-source natal chart generator using Swiss Ephemeris for accurate calculations.
          <span v-if="!chart">Enter your birth data, resolve location, and get a complete chart with clear, structured
            outputs.</span>
        </p>
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
          <FocusAreas :areas="chart.focusAreas" />
          <section v-if="!partnerChart" class="panel relationship-cta">
            <div class="panel-inner">
              <h2 class="section-title">Relationship chart</h2>
              <p class="section-copy">
                Add a second chart to analyse compatibility across attraction, communication, emotional alignment, and overall dynamics.
              </p>
              <button class="button" type="button" @click="openPartnerModal">Add partner chart</button>
            </div>
          </section>

          <RelationshipPanel v-if="relationshipReport" :report="relationshipReport" @edit="openPartnerModal"
            @clear="clearPartnerChart" />

          <div class="card-grid vertical">
            <PlacementTable :placements="chart.placements" />
            <AspectList :aspects="chart.aspects" />
          </div>

          <InterpretationPanel :items="chart.interpretations" />
        </template>

        <section v-else class="panel empty-state">
          <div>
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

    <PartnerModal :open="isPartnerModalOpen" :loading="partnerLoading" :error="partnerError"
      :resolved-location="partnerResolvedLocation" @submit="handlePartnerSubmit" @close="closePartnerModal" />
  </main>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
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
import { geocodeAddress } from './services/geocoding'
import { calculateNatalChart, calculateCurrentTransits } from './services/astrology'
import worldMap from './assets/img/3-Equirectangular_projection_world_map_without_borders.svg'
import { toTitleCase } from './utils/zodiac'
import { buildRelationshipReport } from './utils/relationship'

const loading = ref(false)
const error = ref('')
const resolvedLocation = ref(null)
const chart = ref(null)
const pdfTarget = ref(null)
const isDownloading = ref(false)
const partnerChart = ref(null)
const partnerLoading = ref(false)
const partnerError = ref('')
const partnerResolvedLocation = ref(null)
const isPartnerModalOpen = ref(false)
const currentTransits = ref(null)
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
const relationshipReport = computed(() => {
  if (!chart.value || !partnerChart.value) return null
  return buildRelationshipReport(chart.value, partnerChart.value)
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

    partnerChart.value = await calculateNatalChart({
      date: formData.date,
      time: formData.time,
      address: location.label,
      lat: location.lat,
      lon: location.lon,
      houseSystem: formData.houseSystem,
      timeZoneOverride: formData.timeZoneOverride
    })

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

function clearPartnerChart() {
  partnerChart.value = null
  partnerResolvedLocation.value = null
  partnerError.value = ''
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
