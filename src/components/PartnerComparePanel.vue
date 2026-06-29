<template>
  <section class="panel compare-panel">
    <div class="panel-inner">
      <div class="compare-header">
        <div>
          <h2 class="section-title">Compare partners</h2>
          <p class="section-copy">A quick side-by-side view of each partner chart.</p>
        </div>
        <div class="compare-actions">
          <button class="button" type="button" @click="emit('add')">Add partner chart</button>
          <button class="subtle-button reverse-generate-button" type="button" :disabled="idealMatchLoading"
            @click="emit('see-ideal-match')">
            <span v-if="idealMatchLoading" class="button-spinner" aria-hidden="true"></span>
            <span>{{ idealMatchLoading ? 'Generating ideal match...' : 'See ideal match' }}</span>
          </button>
        </div>
      </div>
<p v-if="idealMatchProgress" class="section-copy">
  Searching theoretical match windows: {{ idealMatchProgress.percent }}%
</p>

<p v-if="idealMatchError" class="form-error">
  {{ idealMatchError }}
</p>
      <div v-if="!partners.length" class="compare-empty">
        <p>No partner charts yet. Add one to compare.</p>
      </div>

      <div v-else class="compare-grid">
        <article v-for="partner in partners" :key="partner.id" class="compare-card"
          :class="{ 'is-active': partners.length > 1 && partner.id === activeId }">
          <div class="compare-card-head">
            <div>
              <p class="compare-label">
                <span>{{ partner.generatedSummary ? `Nickname: ${partner.label}` : partner.label }}</span>
                <span
                  v-if="partner.generatedSummary"
                  class="info-toggle partner-nickname-info"
                  role="img"
                  tabindex="0"
                  aria-label="Generated partner nickname"
                  :title="generatedNicknameHelp"
                >
                  info
                </span>
              </p>
              <p class="compare-meta">
                {{ partner.report?.chartB?.date || '—' }}
                {{ partner.report?.chartB?.time || '' }}
              </p>
              <p v-if="partner.generatedSummary" class="compare-meta">
  Generated theoretical {{ partner.generatedSummary.targetProfile.label }} · {{ partner.generatedSummary.score }}/100
</p>
            </div>
            <div class="compare-actions">
              <button class="subtle-button" type="button" :disabled="partner.id === activeId"
                @click="emit('select', partner.id)">
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
          <p v-else class="compare-empty">No comparison available.</p>
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
  },
  idealMatchLoading: {
    type: Boolean,
    default: false
  },
  idealMatchError: {
    type: String,
    default: ''
  },
  idealMatchProgress: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add', 'see-ideal-match', 'select', 'remove'])

const generatedNicknameHelp = 'This nickname is generated from the partner chart using the same Sun, Moon and Ascendant nickname logic as your profile.'
</script>
