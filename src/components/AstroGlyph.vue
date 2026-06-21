<template>
  <svg
    v-if="glyphMarkup"
    class="astro-glyph"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :style="svgStyle"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    v-html="glyphMarkup"
  />
</template>

<script setup>
import { computed } from 'vue'
import { GLYPH_VIEWBOX, getGlyphInnerSvg } from '../utils/astro-glyphs'

const props = defineProps({
  body: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 18
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const viewBox = GLYPH_VIEWBOX
const glyphMarkup = computed(() => getGlyphInnerSvg('body', props.body))
const svgStyle = computed(() => (props.color && props.color !== 'currentColor' ? { color: props.color } : undefined))
</script>
