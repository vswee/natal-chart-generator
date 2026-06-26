<template>
  <ChartWheel
    class="co-star-style-chart-wheel"
    v-bind="props"
    variant="costar"
  />
</template>

<script setup>
import ChartWheel from './ChartWheel.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false
  },
  showChrome: {
    type: Boolean,
    default: true
  },
  decorative: {
    type: Boolean,
    default: false
  },
  placements: {
    type: Array,
    required: true
  },
  aspects: {
    type: Array,
    required: true
  },
  cusps: {
    type: [Array, Object],
    required: true
  }
})
</script>

<style>
.co-star-style-chart-wheel .chart-wheel-wrap {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.co-star-style-chart-wheel.embedded .panel-inner,
.co-star-style-chart-wheel .chart-wheel-wrap {
  padding: 0;
}

.co-star-style-chart-wheel .chart-wheel {
  width: 100%;
  max-width: none;
  overflow: visible;
  filter: none;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-sign-segment {
  fill: #000;
  opacity: 1;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-sign-boundary {
  stroke: #fff;
  stroke-width: 0.7;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-ring--outer {
  stroke: #000;
  stroke-width: 1.35;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-ring--sign {
  stroke: rgba(17, 17, 17, 0.18);
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-ring--inner {
  stroke: rgba(17, 17, 17, 0.16);
  stroke-dasharray: none;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-sign-label {
  fill: #fff;
  font-family: "Courier New", ui-monospace, monospace;
  font-size: 7.6px;
  font-weight: 700;
  letter-spacing: 0;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-house-line {
  stroke: rgba(17, 17, 17, 0.16);
  stroke-width: 0.8;
}

.co-star-style-chart-wheel .chart-wheel--costar .wheel-house-line--axis {
  stroke: rgba(17, 17, 17, 0.62);
  stroke-width: 1.25;
}

.co-star-style-chart-wheel .chart-wheel--costar .aspect-line {
  stroke: rgba(17, 17, 17, 0.78);
  stroke-width: 0.85;
  stroke-dasharray: 3 4;
  stroke-opacity: 1;
}

.co-star-style-chart-wheel .chart-wheel--costar .aspect-line--trine,
.co-star-style-chart-wheel .chart-wheel--costar .aspect-line--sextile {
  stroke-opacity: 0.42;
}

.co-star-style-chart-wheel .chart-wheel--costar .aspect-line--square,
.co-star-style-chart-wheel .chart-wheel--costar .aspect-line--opposition {
  stroke-dasharray: none;
  stroke-opacity: 0.62;
}

.co-star-style-chart-wheel .chart-wheel--costar .placement-glyph {
  color: #111;
  fill: #111;
}
</style>
