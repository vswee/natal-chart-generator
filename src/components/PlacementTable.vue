<template>
  <section class="panel table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Body</th>
          <th>Sign</th>
          <th>Degree</th>
          <th>House</th>
          <th>Motion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="placement in placementRows" :key="placement.body">
          <td>
            <span class="body-label">
              <span v-if="symbolForBody(placement.body)" class="body-symbol">
                {{ symbolForBody(placement.body) }}
              </span>
              {{ labelForBody(placement.body) }}
            </span>
          </td>
          <td>
            <span class="badge sign-label">
              <ZodiacIcon :sign="placement.sign" />
              {{ titleCase(placement.sign) }}
            </span>
          </td>
          <td>{{ placement.degreeInSign.toFixed(2) }}°</td>
          <td>
            <button
              v-if="placement.house"
              class="house-button"
              type="button"
              :aria-label="`About house ${placement.house}`"
              @click="openHouse(placement.house)"
            >
              <span class="house-icon" aria-hidden="true">{{ houseIcon(placement.house) }}</span>
              <span v-if="placement.houseOrdinal" class="house-number">
                <span>{{ placement.houseOrdinal.number }}</span>
                <sup class="house-suffix">{{ placement.houseOrdinal.suffix }}</sup>
              </span>
              <span v-else>{{ placement.house }}</span>
            </button>
            <span v-else>—</span>
          </td>
          <td>
            <span class="badge" :class="placement.retrograde ? 'badge--rx' : 'badge--direct'">
              {{ placement.retrograde ? 'Retrograde' : 'Direct' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="activeHouseInfo" class="modal-overlay" @click.self="closeHouse">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Houses</p>
            <h3 class="modal-title">
              <span class="house-number">
                <span>{{ activeHouseOrdinal.number }}</span>
                <sup class="house-suffix">{{ activeHouseOrdinal.suffix }}</sup>
              </span>
              House: {{ activeHouseInfo.name || activeHouseInfo.title }}
            </h3>
          </div>
          <button class="subtle-button" type="button" @click="closeHouse">Close</button>
        </div>
        <p class="modal-copy">{{ activeHouseInfo.body }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { toTitleCase } from '../utils/zodiac'
import { getHouseMeaning, getHouseOrdinal } from '../utils/houses'
import ZodiacIcon from './ZodiacIcon.vue'

const props = defineProps({
  placements: {
    type: Array,
    required: true
  }
})

const activeHouse = ref(null)

const placementRows = computed(() =>
  (Array.isArray(props.placements) ? props.placements : []).map((placement) => ({
    ...placement,
    houseOrdinal: placement.house ? getHouseOrdinal(placement.house) : null
  }))
)

const activeHouseInfo = computed(() => {
  if (!activeHouse.value) return null
  return getHouseMeaning(activeHouse.value)
})

const activeHouseOrdinal = computed(() => getHouseOrdinal(activeHouse.value))

function openHouse(house) {
  activeHouse.value = house
}

function closeHouse() {
  activeHouse.value = null
}

function houseIcon(house) {
  return getHouseMeaning(house)?.icon || 'home'
}

function labelForBody(body) {
  const labels = {
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

  return labels[body] || body
}

function symbolForBody(body) {
  const symbols = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇'
  }

  return symbols[body] || ''
}

function titleCase(value) {
  return toTitleCase(value)
}
</script>
