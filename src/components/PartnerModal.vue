<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div>
          <p class="modal-kicker">Relationship chart</p>
          <h3 class="modal-title">Add partner birth data</h3>
        </div>
        <button class="subtle-button" type="button" @click="emit('close')">Close</button>
      </div>

      <p class="modal-copy">
        Enter the second person's birth details to compare compatibility, friendship, romance, and chemistry.
      </p>

      <form class="form-grid" @submit.prevent="submitForm">
        <div class="field">
          <label class="label" for="partner-date">Date of birth</label>
          <input id="partner-date" v-model="localForm.date" class="input" type="date" required />
        </div>

        <div class="row-2">
          <div class="field">
            <label class="label" for="partner-time">Time of birth</label>
            <input id="partner-time" v-model="localForm.time" class="input" type="time" required />
          </div>

          <div class="field">
            <label class="label" for="partner-house">House system</label>
            <select id="partner-house" v-model="localForm.houseSystem" class="select">
              <option value="placidus">Placidus</option>
              <option value="whole-sign">Whole Sign</option>
              <option value="koch">Koch</option>
            </select>
          </div>
        </div>

        <div class="field autocomplete">
          <label class="label" for="partner-address">Birthplace or address</label>
          <input
            id="partner-address"
            v-model="localForm.address"
            class="input"
            type="text"
            placeholder="Chicago, IL"
            :required="!localForm.useManualCoordinates"
          />

          <div v-if="!localForm.useManualCoordinates && isSearching" class="note">Searching locations...</div>
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

        <label class="checkbox-label">
          <input v-model="localForm.useManualCoordinates" type="checkbox" />
          Use manual coordinates instead of search
        </label>

        <div v-if="localForm.useManualCoordinates" class="row-2">
          <div class="field">
            <label class="label" for="partner-lat">Latitude</label>
            <input
              id="partner-lat"
              v-model="localForm.lat"
              class="input"
              type="number"
              step="0.0001"
              placeholder="41.8781"
              required
            />
          </div>

          <div class="field">
            <label class="label" for="partner-lon">Longitude</label>
            <input
              id="partner-lon"
              v-model="localForm.lon"
              class="input"
              type="number"
              step="0.0001"
              placeholder="-87.6298"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="partner-timezone">Time zone override (optional)</label>
          <input
            id="partner-timezone"
            v-model="localForm.timeZoneOverride"
            class="input"
            type="text"
            placeholder="America/Chicago"
            list="partner-timezone-options"
          />
          <datalist id="partner-timezone-options">
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

        <div class="row-flex-2">
          <button class="button" type="submit" :disabled="loading">
            {{ loading ? 'Calculating…' : 'Generate relationship chart' }}
          </button>
          <button class="subtle-button" type="button" @click="emit('close')" :disabled="loading">
            Cancel
          </button>
        </div>
      </form>

      <div v-if="selectedLocation" class="note">
        Selected location: {{ selectedLocation.label }} · {{ selectedLocation.lat.toFixed(4) }},
        {{ selectedLocation.lon.toFixed(4) }}
      </div>

      <div v-else-if="resolvedLocation" class="note">
        Resolved location: {{ resolvedLocation.label }} · {{ resolvedLocation.lat.toFixed(4) }},
        {{ resolvedLocation.lon.toFixed(4) }}
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { searchLocations } from '../services/geocoding'

defineProps({
  open: Boolean,
  loading: Boolean,
  error: String,
  resolvedLocation: Object
})

const emit = defineEmits(['submit', 'close'])

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

const locationResults = ref([])
const isSearching = ref(false)
const searchError = ref('')
const selectedLocation = ref(null)
let searchTimeout
let activeRequest = 0

watch(
  () => localForm.address,
  (value) => {
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
}

function selectLocation(result) {
  localForm.address = result.label
  localForm.lat = String(result.lat)
  localForm.lon = String(result.lon)
  localForm.useManualCoordinates = false
  selectedLocation.value = result
  locationResults.value = []
}
</script>
