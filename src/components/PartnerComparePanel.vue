<template>
  <section class="panel compare-panel">
    <div class="panel-inner">
      <div class="compare-header">
        <div>
          <h2 class="section-title">Compare partners</h2>
          <p class="section-copy">Side-by-side scoring for each partner chart.</p>
        </div>
        <button class="button" type="button" @click="emit('add')">Add partner chart</button>
      </div>

      <div v-if="!partners.length" class="compare-empty">
        <p>No partner charts yet. Add one to see comparisons.</p>
      </div>

      <div v-else class="compare-grid">
        <article
          v-for="partner in partners"
          :key="partner.id"
          class="compare-card"
          :class="{ 'is-active': partner.id === activeId }"
        >
          <div class="compare-card-head">
            <div>
              <p class="compare-label">{{ partner.label }}</p>
              <p class="compare-meta">
                {{ partner.report?.chartB?.date || '—' }}
                {{ partner.report?.chartB?.time || '' }}
              </p>
            </div>
            <div class="compare-actions">
              <button
                class="subtle-button"
                type="button"
                :disabled="partner.id === activeId"
                @click="emit('select', partner.id)"
              >
                {{ partner.id === activeId ? 'Viewing' : 'View details' }}
              </button>
              <button class="subtle-button" type="button" @click="emit('remove', partner.id)">
                Remove
              </button>
            </div>
          </div>

          <div v-if="partner.report" class="compare-scores">
            <div v-for="item in partner.report.categories" :key="item.key" class="compare-score">
              <span class="compare-score-label">{{ item.label }}</span>
              <div class="compare-score-track">
                <span class="compare-score-fill" :style="{ width: item.score + '%' }"></span>
              </div>
              <span class="compare-score-value">{{ item.score }}</span>
            </div>
          </div>
          <p v-else class="compare-empty">No report available.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  partners: {
    type: Array,
    required: true
  },
  activeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['add', 'select', 'remove'])
</script>
