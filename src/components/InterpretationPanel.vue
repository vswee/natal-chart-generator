<template>
  <section class="panel reading-wrap">
    <div class="panel-inner">
      <h2 class="section-title">Interpretation blocks</h2>
      <p class="section-copy">
        General text blocks are assembled from placements, aspects and summary thresholds.
      </p>
    </div>

    <div class="reading-list">
      <article v-for="item in items" :key="item.id" class="reading-item">
        <h3 class="reading-title">{{ item.title }}</h3>
        <p class="reading-copy">{{ item.text }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>
