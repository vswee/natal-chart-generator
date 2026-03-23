<template>
  <section class="panel">
    <div class="panel-inner">
      <h2 class="section-title">Birth data</h2>
      <p class="section-copy">
        Enter date, time and birthplace. We'll resolve the coordinates and build the chart.
      </p>

      <form class="form-grid" @submit.prevent="submitForm">
        <div class="field">
          <label class="label" for="birth-date">Date of birth</label>
          <input id="birth-date" v-model="localForm.date" class="input" type="date" required />
        </div>

        <div class="row-2">
          <div class="field">
            <div class="label-row">
              <label class="label" for="birth-time">Time of birth</label>
              <button
                class="info-toggle"
                type="button"
                aria-label="About birth time accuracy"
                @click="showTimeInfo = true"
              >
                info
              </button>
            </div>
            <input id="birth-time" v-model="localForm.time" class="input" type="time" required />
          </div>

          <div class="field">
            <div class="label-row">
              <label class="label" for="house-system">House system</label>
              <button
                class="info-toggle"
                type="button"
                aria-label="About house systems"
                @click="showHouseInfo = true"
              >
                info
              </button>
            </div>
            <select id="house-system" v-model="localForm.houseSystem" class="select">
              <option value="placidus">Placidus</option>
              <option value="whole-sign">Whole Sign</option>
              <option value="koch">Koch</option>
            </select>
          </div>
        </div>

        <div class="field">
          <div class="label-row">
            <label class="label" for="birth-address">Birthplace or address</label>
            <button
              class="info-toggle"
              type="button"
              aria-label="About birthplace accuracy"
              @click="showLocationInfo = true"
            >
              info
            </button>
          </div>
          <input
            id="birth-address"
            v-model="localForm.address"
            class="input"
            type="text"
            placeholder="San Fernando, Trinidad and Tobago"
            required
          />
        </div>

        <div class="row-flex-2">
          <button class="button" type="submit" :disabled="loading">
            {{ loading ? 'Calculating…' : 'Calculate chart' }}
          </button>
          <button class="subtle-button" type="button" @click="fillExample" :disabled="loading">
            Load sample
          </button>
        </div>
      </form>

      <div v-if="resolvedLocation" class="note">
        Resolved location: {{ resolvedLocation.label }} · {{ resolvedLocation.lat.toFixed(4) }},
        {{ resolvedLocation.lon.toFixed(4) }}
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>

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
          House systems only change the house cusps and which house each planet lands in. The planet sign/degree and
          aspects do not change. Different systems can shift relationship, career, or home emphasis depending on where
          the cusps fall.
        </p>

        <ul class="modal-list">
          <li><strong>Placidus</strong>: time-based quadrant houses, popular modern default.</li>
          <li><strong>Koch</strong>: another time-based system with slightly different cusp math.</li>
          <li><strong>Whole Sign</strong>: each sign becomes a house; the Ascendant sign is the 1st.</li>
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
          The exact birth time changes the Ascendant and houses, which can shift life area emphasis. If you are unsure,
          use the most accurate time you have, or choose a rounded estimate. Results for planets and aspects will still
          be consistent, but house placements may vary.
        </p>

        <ul class="modal-list">
          <li>Use a birth certificate or hospital record if available.</li>
          <li>If you only know a range, choose the middle for a balanced estimate.</li>
          <li>Unknown time? Use 12:00 to keep a neutral reference point.</li>
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
          The birthplace sets your chart’s latitude and longitude, which changes the Ascendant and house cusps.
          Planet sign and degree stay the same, but life-area emphasis can shift if the location is off.
        </p>

        <ul class="modal-list">
          <li>Use the city and country where you were born if possible.</li>
          <li>If you only know a nearby city, pick the closest major one.</li>
          <li>Addresses work too; the app will resolve coordinates automatically.</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineProps({
  loading: Boolean,
  error: String,
  resolvedLocation: Object
})

const emit = defineEmits(['submit'])

const localForm = reactive({
  date: '',
  time: '',
  address: '',
  houseSystem: 'placidus'
})

const showHouseInfo = ref(false)
const showTimeInfo = ref(false)
const showLocationInfo = ref(false)

function submitForm() {
  emit('submit', { ...localForm })
}

function fillExample() {
  localForm.date = '1990-01-05'
  localForm.time = '15:30'
  localForm.address = 'Port of Spain General Hospital, Trinidad and Tobago'
  localForm.houseSystem = 'placidus'
}
</script>
