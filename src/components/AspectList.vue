<template>
  <section class="panel aspect-wrap">
    <div class="panel-inner">
      <h2 class="section-title">Major aspects</h2>
      <p class="section-copy">A simple list view for the strongest detected angular relationships.</p>
    </div>

    <div class="aspect-list">
      <article v-for="aspect in aspects.slice(0, 8)" :key="aspect.bodyA + aspect.type + aspect.bodyB" class="aspect-item">
        <h3 class="aspect-title">
          {{ label(aspect.bodyA) }} {{ prettyType(aspect.type) }} {{ label(aspect.bodyB) }}
        </h3>
        <p class="aspect-copy">Orb: {{ aspect.orb.toFixed(2) }}°</p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  aspects: {
    type: Array,
    required: true
  }
})

function label(body) {
  return body === 'asc' ? 'Ascendant' : body.charAt(0).toUpperCase() + body.slice(1)
}

function prettyType(type) {
  const map = {
    conjunction: 'conjunct',
    sextile: 'sextile',
    square: 'square',
    trine: 'trine',
    opposition: 'oppose'
  }
  return map[type] || type
}
</script>
