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

        <div class="field">
          <label class="label" for="partner-address">Birthplace or address</label>
          <input
            id="partner-address"
            v-model="localForm.address"
            class="input"
            type="text"
            placeholder="Chicago, IL"
            required
          />
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

      <div v-if="resolvedLocation" class="note">
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
import { reactive } from 'vue'

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
  houseSystem: 'placidus'
})

function submitForm() {
  emit('submit', { ...localForm })
}
</script>
