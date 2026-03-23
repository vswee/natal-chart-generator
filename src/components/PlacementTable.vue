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
        <tr v-for="placement in placements" :key="placement.body">
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
          <td>{{ placement.house || '—' }}</td>
          <td>
            <span class="badge" :class="placement.retrograde ? 'badge--rx' : 'badge--direct'">
              {{ placement.retrograde ? 'Retrograde' : 'Direct' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { toTitleCase } from '../utils/zodiac'
import ZodiacIcon from './ZodiacIcon.vue'

defineProps({
  placements: {
    type: Array,
    required: true
  }
})

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
