<template>
  <section class="panel birth-form-panel"
    :class="{ 'is-compact': props.compactSummary, 'is-editing': isEditingBirthInfo }">
    <div class="panel-inner">
      <template v-if="props.compactSummary">
        <div v-if="!isEditingBirthInfo" class="birth-summary-compact">
          <p class="birth-summary-kicker">Birth details now live in the profile menu.</p>
          <p class="birth-summary-compact-copy">
            Open the profile menu to review the current chart details, house system and coordinates.
          </p>
          <button class="subtle-button birth-summary-change" type="button" @click="emit('open-editor')">
            Edit birth data
          </button>
        </div>

        <div v-else class="birth-form-overlay modal-overlay" @click.self="closeEditor">
          <div class="modal-card birth-form-modal-card" role="dialog" aria-modal="true"
            aria-labelledby="birth-form-title">
            <div class="birth-form-header">
              <div>
                <h2 id="birth-form-title" class="section-title">Birth data</h2>
                <p class="section-copy">
                  Enter your birth date, time and birthplace. We’ll look up the coordinates and build the chart.
                </p>
              </div>
              <button class="subtle-button birth-summary-close" type="button" @click="isEditingBirthInfo = false">
                Collapse
              </button>
            </div>

            <form class="form-grid birth-form-body" @submit.prevent="submitForm">
              <div class="row-2 birth-date-time-row">
                <div class="field">
                  <label class="label" for="birth-date">Date of birth</label>
                  <input id="birth-date" v-model="localForm.date" class="input" type="date" required />
                </div>

                <div class="field">
                  <div class="label-row">
                    <label class="label" for="birth-time">Time of birth</label>
                    <button class="info-toggle" type="button" aria-label="About birth time accuracy"
                      @click="showTimeInfo = true">
                      info
                    </button>
                  </div>
                  <input id="birth-time" v-model="localForm.time" class="input" type="time" required />
                </div>
              </div>

              <div class="field autocomplete">
                <div class="label-row">
                  <label class="label" for="birth-address">Birthplace or address</label>
                  <button class="info-toggle" type="button" aria-label="About birthplace accuracy"
                    @click="showLocationInfo = true">
                    info
                  </button>
                </div>
                <input id="birth-address" v-model="localForm.address" class="input" type="text"
                  placeholder="San Fernando, Trinidad and Tobago" :required="!localForm.useManualCoordinates" />

                <div v-if="!localForm.useManualCoordinates && isSearching" class="note">Searching locations…</div>
                <div v-if="!localForm.useManualCoordinates && searchError" class="error">
                  {{ searchError }}
                </div>

                <ul v-if="!localForm.useManualCoordinates && locationResults.length" class="suggestion-list">
                  <li v-for="result in locationResults" :key="result.label" class="suggestion-item">
                    <button type="button" class="suggestion-button" @click="selectLocation(result)">
                      {{ result.label }}
                    </button>
                  </li>
                </ul>
              </div>

              <div class="advanced-toggle-row">
                <button class="text-button advanced-toggle" :class="{ 'is-open': advancedOpen }" type="button"
                  :aria-expanded="advancedOpen" aria-controls="birth-advanced" @click="toggleAdvanced">
                  <span>Advanced options</span>
                  <span class="chevron-icon" aria-hidden="true">expand_more</span>
                </button>
                <p class="advanced-toggle-copy">House system, manual coordinates, and timezone override.</p>
              </div>

              <div v-if="advancedOpen" id="birth-advanced" class="advanced-section">
                <div class="field">
                  <div class="label-row">
                    <label class="label" for="house-system">House system</label>
                    <button class="info-toggle" type="button" aria-label="About house systems"
                      @click="showHouseInfo = true">
                      info
                    </button>
                  </div>
                  <select id="house-system" v-model="localForm.houseSystem" class="select">
                    <option value="placidus">Placidus</option>
                    <option value="whole-sign">Whole Sign</option>
                    <option value="koch">Koch</option>
                  </select>
                </div>

                <label class="checkbox-label">
                  <input v-model="localForm.useManualCoordinates" type="checkbox" />
                  Enter coordinates manually
                </label>

                <div v-if="localForm.useManualCoordinates" class="row-2">
                  <div class="field">
                    <label class="label" for="birth-lat">Latitude</label>
                    <input id="birth-lat" v-model="localForm.lat" class="input" type="number" step="0.0001"
                      placeholder="51.5074" required />
                  </div>

                  <div class="field">
                    <label class="label" for="birth-lon">Longitude</label>
                    <input id="birth-lon" v-model="localForm.lon" class="input" type="number" step="0.0001"
                      placeholder="-0.1278" required />
                  </div>
                </div>

                <div class="field">
                  <label class="label" for="birth-timezone">Time zone override (optional)</label>
                  <input id="birth-timezone" v-model="localForm.timeZoneOverride" class="input" type="text"
                    placeholder="America/New_York" list="timezone-options" />
                  <datalist id="timezone-options">
                    <option value="America/New_York"></option>
                    <option value="America/Chicago"></option>
                    <option value="America/Denver"></option>
                    <option value="America/Los_Angeles"></option>
                    <option value="Europe/London"></option>
                    <option value="Europe/Paris"></option>
                    <option value="Asia/Tokyo"></option>
                    <option value="Australia/Sydney"></option>
                  </datalist>
                </div>
              </div>

              <div class="row-flex-2">
                <button class="button" type="submit" :disabled="loading">
                  {{ loading ? 'Calculating…' : 'Generate chart' }}
                </button>
                <button class="subtle-button" type="button" @click="fillExample" :disabled="loading">
                  Load example
                </button>
              </div>
            </form>

            <div v-if="selectedLocation" class="note birth-form-note">
              Chosen location: {{ selectedLocation.label }} · {{ selectedLocation.lat.toFixed(4) }},
              {{ selectedLocation.lon.toFixed(4) }}
            </div>

            <div v-else-if="resolvedLocation" class="note birth-form-note">
              Found location: {{ resolvedLocation.label }} · {{ resolvedLocation.lat.toFixed(4) }},
              {{ resolvedLocation.lon.toFixed(4) }}
            </div>

            <div v-if="error" class="error">
              {{ error }}
            </div>
          </div>
        </div>
      </template>

      <form v-else class="birth-form-form" @submit.prevent="submitForm">
        <section class="birth-form-main">
          <div class="birth-form-panel-head">
            <p class="birth-form-kicker">Birth data</p>
            <!-- <p class="birth-form-rail-copy">
              Enter the core details here. Advanced settings stay tucked away until you open them.
            </p> -->
          </div>

          <div class="birth-form-fields">
            <div class="row-2 birth-date-time-row">
              <div class="field">
                <label class="label" for="birth-date">Date of birth</label>
                <input id="birth-date" v-model="localForm.date" class="input" type="date" required />
              </div>

              <div class="field">
                <div class="label-row">
                  <label class="label" for="birth-time">Time of birth</label>
                  <button class="info-toggle" type="button" aria-label="About birth time accuracy"
                    @click="showTimeInfo = true">
                    info
                  </button>
                </div>
                <input id="birth-time" v-model="localForm.time" class="input" type="time" required />
              </div>
            </div>

            <div class="field autocomplete">
              <div class="label-row">
                <label class="label" for="birth-address">Birthplace or address</label>
                <button class="info-toggle" type="button" aria-label="About birthplace accuracy"
                  @click="showLocationInfo = true">
                  info
                </button>
              </div>
              <input id="birth-address" v-model="localForm.address" class="input" type="text"
                placeholder="San Fernando, Trinidad and Tobago" :required="!localForm.useManualCoordinates" />

              <div v-if="!localForm.useManualCoordinates && isSearching" class="note">Searching locations…</div>
              <div v-if="!localForm.useManualCoordinates && searchError" class="error">
                {{ searchError }}
              </div>

              <ul v-if="!localForm.useManualCoordinates && locationResults.length" class="suggestion-list">
                <li v-for="result in locationResults" :key="result.label" class="suggestion-item">
                  <button type="button" class="suggestion-button" @click="selectLocation(result)">
                    {{ result.label }}
                  </button>
                </li>
              </ul>
            </div>

            <div class="advanced-toggle-row">
              <button class="text-button advanced-toggle" :class="{ 'is-open': advancedOpen }" type="button"
                :aria-expanded="advancedOpen" aria-controls="birth-advanced" @click="toggleAdvanced">
                <span>Advanced options</span>
                <span class="chevron-icon" aria-hidden="true">expand_more</span>
              </button>
              <p class="advanced-toggle-copy">House system, manual coordinates, and timezone override.</p>
            </div>

            <div v-if="advancedOpen" id="birth-advanced" class="advanced-section birth-advanced-panel">
              <div class="field">
                <div class="label-row">
                  <label class="label" for="house-system">House system</label>
                  <button class="info-toggle" type="button" aria-label="About house systems"
                    @click="showHouseInfo = true">
                    info
                  </button>
                </div>
                <select id="house-system" v-model="localForm.houseSystem" class="select">
                  <option value="placidus">Placidus</option>
                  <option value="whole-sign">Whole Sign</option>
                  <option value="koch">Koch</option>
                </select>
              </div>

              <label class="checkbox-label">
                <input v-model="localForm.useManualCoordinates" type="checkbox" />
                Enter coordinates manually
              </label>

              <div v-if="localForm.useManualCoordinates" class="row-2">
                <div class="field">
                  <label class="label" for="birth-lat">Latitude</label>
                  <input id="birth-lat" v-model="localForm.lat" class="input" type="number" step="0.0001"
                    placeholder="51.5074" required />
                </div>

                <div class="field">
                  <label class="label" for="birth-lon">Longitude</label>
                  <input id="birth-lon" v-model="localForm.lon" class="input" type="number" step="0.0001"
                    placeholder="-0.1278" required />
                </div>
              </div>

              <div class="field">
                <label class="label" for="birth-timezone">Time zone override (optional)</label>
                <input id="birth-timezone" v-model="localForm.timeZoneOverride" class="input" type="text"
                  placeholder="America/New_York" list="timezone-options" />
                <datalist id="timezone-options">
                  <option value="America/New_York"></option>
                  <option value="America/Chicago"></option>
                  <option value="America/Denver"></option>
                  <option value="America/Los_Angeles"></option>
                  <option value="Europe/London"></option>
                  <option value="Europe/Paris"></option>
                  <option value="Asia/Tokyo"></option>
                  <option value="Australia/Sydney"></option>
                </datalist>
              </div>
            </div>
          </div>

          <div class="row-flex-2 birth-form-actions">
            <button class="button" type="submit" :disabled="loading">
              {{ loading ? 'Calculating…' : 'Generate chart' }}
            </button>
            <button class="subtle-button" type="button" @click="fillExample" :disabled="loading">
              Load example
            </button>
          </div>

          <div v-if="selectedLocation" class="note birth-form-note">
            Chosen location: {{ selectedLocation.label }} · {{ selectedLocation.lat.toFixed(4) }},
            {{ selectedLocation.lon.toFixed(4) }}
          </div>

          <div v-else-if="resolvedLocation" class="note birth-form-note">
            Found location: {{ resolvedLocation.label }} · {{ resolvedLocation.lat.toFixed(4) }},
            {{ resolvedLocation.lon.toFixed(4) }}
          </div>

          <div v-if="error" class="error">
            {{ error }}
          </div>
        </section>

        <aside class="birth-form-rail" aria-hidden="true">
          <div class="birth-form-rail-graphic">
            <div class="empty-state-orbit birth-form-orbit">
              <span class="empty-state-ring empty-state-ring--outer"></span>
              <span class="empty-state-ring empty-state-ring--inner"></span>
              <span class="empty-state-core"></span>
            </div>
            <div class="birth-form-rail-caption">
              <!-- <p class="birth-form-kicker">Chart field</p> -->
              <p class="birth-form-rail-copy"> Enter a birth date, exact time and birthplace to generate a natal chart with accurate placements and clear readings. </p>
            </div>
          </div>
        </aside>
      </form>

      <div v-if="showHouseInfo" class="modal-overlay" @click.self="showHouseInfo = false">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">House systems</p>
              <h3 class="modal-title">Why house systems matter</h3>
            </div>
            <button class="subtle-button" type="button" @click="showHouseInfo = false">Close</button>
          </div>

          <p class="modal-copy">
            House systems change the house cusps and the house each planet falls in. They do not change the sign,
            degree or aspects. Different systems can shift the focus between areas such as home, work and
            relationships.
          </p>

          <ul class="modal-list">
            <li><strong>Placidus</strong>: a time-based system and a common modern default.</li>
            <li><strong>Koch</strong>: another time-based system with slightly different cusp maths.</li>
            <li><strong>Whole Sign</strong>: each sign becomes a house, starting from the Ascendant sign.</li>
          </ul>
        </div>
      </div>

      <div v-if="showTimeInfo" class="modal-overlay" @click.self="showTimeInfo = false">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Birth time</p>
              <h3 class="modal-title">If you are not sure of the exact time</h3>
            </div>
            <button class="subtle-button" type="button" @click="showTimeInfo = false">Close</button>
          </div>

          <p class="modal-copy">
            Birth time changes the Ascendant and houses, so it can shift the chart quite a bit. If you are unsure, use
            the best time you have or a sensible estimate. Planet positions and aspects will usually stay steady, but
            house placements may change.
          </p>

          <ul class="modal-list">
            <li>Use a birth certificate or hospital record if available.</li>
            <li>If you only know a range, choose the middle as a rough estimate.</li>
            <li>If the time is unknown, use 12:00 as a neutral placeholder.</li>
          </ul>
        </div>
      </div>

      <div v-if="showLocationInfo" class="modal-overlay" @click.self="showLocationInfo = false">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Birthplace</p>
              <h3 class="modal-title">Why location matters</h3>
            </div>
            <button class="subtle-button" type="button" @click="showLocationInfo = false">Close</button>
          </div>

          <p class="modal-copy">
            The birthplace sets the latitude and longitude for the chart, which affects the Ascendant and house cusps.
            The planet sign and degree stay the same, but the house focus can shift if the location is wrong.
          </p>

          <ul class="modal-list">
            <li>Use the city and country where you were born if possible.</li>
            <li>If you only know a nearby city, pick the closest major one.</li>
            <li>Full addresses work too; the app will look up the coordinates automatically.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { searchLocations } from '../services/geocoding'

const props = defineProps({
  loading: Boolean,
  error: String,
  resolvedLocation: Object,
  compactSummary: Boolean,
  savedBirthData: Object,
  editorRequest: Number
})

const emit = defineEmits(['submit', 'open-editor'])

const localForm = reactive({
  date: '',
  time: '',
  address: '',
  houseSystem: 'placidus',
  lat: '',
  lon: '',
  timeZoneOverride: '',
  useManualCoordinates: false
})

const showHouseInfo = ref(false)
const showTimeInfo = ref(false)
const showLocationInfo = ref(false)
const showAdvanced = ref(false)
const isEditingBirthInfo = ref(false)
const locationResults = ref([])
const isSearching = ref(false)
const searchError = ref('')
const selectedLocation = ref(null)
const suppressSearch = ref(false)
let searchTimeout
let activeRequest = 0

const advancedOpen = computed(() => showAdvanced.value || localForm.useManualCoordinates)

function applySavedBirthData(data) {
  if (!data || typeof data !== 'object') {
    localForm.date = ''
    localForm.time = ''
    localForm.address = ''
    localForm.houseSystem = 'placidus'
    localForm.lat = ''
    localForm.lon = ''
    localForm.timeZoneOverride = ''
    localForm.useManualCoordinates = false
    return
  }

  localForm.date = data.date || ''
  localForm.time = data.time || ''
  localForm.address = data.address || ''
  localForm.houseSystem = data.houseSystem || 'placidus'
  localForm.lat = data.lat ?? ''
  localForm.lon = data.lon ?? ''
  localForm.timeZoneOverride = data.timeZoneOverride || ''
  localForm.useManualCoordinates = Boolean(data.useManualCoordinates)
}

watch(
  () => props.compactSummary,
  (value) => {
    if (!value) isEditingBirthInfo.value = false
  }
)

watch(
  () => props.editorRequest,
  () => {
    if (props.compactSummary) isEditingBirthInfo.value = true
  }
)

watch(
  () => props.savedBirthData,
  (value) => {
    applySavedBirthData(value)
  },
  { immediate: true, deep: true }
)

watch(
  () => localForm.address,
  (value) => {
    if (suppressSearch.value) {
      suppressSearch.value = false
      locationResults.value = []
      isSearching.value = false
      searchError.value = ''
      return
    }
    if (localForm.useManualCoordinates) return
    selectedLocation.value = null
    localForm.lat = ''
    localForm.lon = ''

    if (!value || value.trim().length < 3) {
      locationResults.value = []
      return
    }

    clearTimeout(searchTimeout)
    const query = value.trim()
    searchTimeout = setTimeout(async () => {
      const requestId = (activeRequest += 1)
      isSearching.value = true
      searchError.value = ''
      try {
        const results = await searchLocations(query, 5)
        if (requestId !== activeRequest) return
        locationResults.value = results
      } catch (err) {
        if (requestId !== activeRequest) return
        searchError.value = err instanceof Error ? err.message : 'Location search failed.'
        locationResults.value = []
      } finally {
        if (requestId === activeRequest) {
          isSearching.value = false
        }
      }
    }, 350)
  }
)

watch(
  () => localForm.useManualCoordinates,
  (value) => {
    if (!value) return
    clearTimeout(searchTimeout)
    isSearching.value = false
    searchError.value = ''
    locationResults.value = []
    selectedLocation.value = null
  }
)

function submitForm() {
  emit('submit', { ...localForm })
  if (props.compactSummary) isEditingBirthInfo.value = false
}

function closeEditor() {
  if (props.compactSummary) isEditingBirthInfo.value = false
}

function toggleAdvanced() {
  if (localForm.useManualCoordinates) return
  showAdvanced.value = !showAdvanced.value
}

function selectLocation(result) {
  suppressSearch.value = true
  localForm.address = result.label
  localForm.lat = String(result.lat)
  localForm.lon = String(result.lon)
  localForm.useManualCoordinates = false
  selectedLocation.value = result
  locationResults.value = []
}

function fillExample() {
  suppressSearch.value = true
  locationResults.value = []
  isSearching.value = false
  searchError.value = ''
  selectedLocation.value = null
  localForm.date = '1990-01-05'
  localForm.time = '15:30'
  localForm.address = 'Port of Spain General Hospital, Trinidad and Tobago'
  localForm.houseSystem = 'placidus'
  localForm.lat = ''
  localForm.lon = ''
  localForm.timeZoneOverride = ''
  localForm.useManualCoordinates = false
}
</script>
