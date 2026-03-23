<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="size"
    stroke="1.5"
    class="zodiac-icon"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'
import {
  IconZodiacAquarius,
  IconZodiacAries,
  IconZodiacCancer,
  IconZodiacCapricorn,
  IconZodiacGemini,
  IconZodiacLeo,
  IconZodiacLibra,
  IconZodiacPisces,
  IconZodiacSagittarius,
  IconZodiacScorpio,
  IconZodiacTaurus,
  IconZodiacVirgo
} from '@tabler/icons-vue'

const props = defineProps({
  sign: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 18
  }
})

const iconMap = {
  aries: IconZodiacAries,
  taurus: IconZodiacTaurus,
  gemini: IconZodiacGemini,
  cancer: IconZodiacCancer,
  leo: IconZodiacLeo,
  virgo: IconZodiacVirgo,
  libra: IconZodiacLibra,
  scorpio: IconZodiacScorpio,
  sagittarius: IconZodiacSagittarius,
  capricorn: IconZodiacCapricorn,
  aquarius: IconZodiacAquarius,
  pisces: IconZodiacPisces
}

const iconComponent = computed(() => iconMap[props.sign] || null)
</script>
