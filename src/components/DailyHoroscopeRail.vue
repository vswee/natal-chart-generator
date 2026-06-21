<template>
  <section class="panel daily-horoscope-rail">
    <div class="panel-inner daily-horoscope-rail-inner">
      <div class="daily-horoscope-header">
        <div>
          <h2 class="section-title">Daily horoscope</h2>
          <p class="section-copy">Yesterday, today and tomorrow, tuned to your chart.</p>
        </div>

        <div class="daily-horoscope-meta">
          <span class="daily-horoscope-meta-label">Refreshed</span>
          <span class="daily-horoscope-meta-value">{{ refreshedLabel }}</span>
        </div>
      </div>

      <div class="daily-horoscope-tabs" role="tablist" aria-label="Daily horoscope days">
        <button
          v-for="card in cards"
          :key="card.key"
          type="button"
          class="daily-horoscope-tab"
          :class="{ 'is-active': activeKey === card.key }"
          :aria-selected="activeKey === card.key"
          :tabindex="activeKey === card.key ? 0 : -1"
          @click="activeKey = card.key"
        >
          <span class="daily-horoscope-tab-label">{{ card.dayLabel }}</span>
          <span class="daily-horoscope-tab-date">{{ card.dateLabel }}</span>
        </button>
      </div>

      <div class="daily-horoscope-cards">
        <article
          v-for="card in cards"
          :key="card.key"
          class="daily-horoscope-card"
          :class="{ 'is-active': activeKey === card.key }"
        >
          <div class="daily-horoscope-card-head">
            <div>
              <p class="daily-horoscope-day">{{ card.dayLabel }}</p>
              <h3 class="daily-horoscope-title">{{ card.headline }}</h3>
            </div>
            <p class="daily-horoscope-date">{{ card.dateLabel }}</p>
          </div>

          <p class="daily-horoscope-copy">{{ card.copy }}</p>

          <div class="daily-horoscope-footer">
            <span class="daily-horoscope-chip">{{ card.moonLabel }}</span>
            <span v-if="card.retrogradeLabel" class="daily-horoscope-chip">{{ card.retrogradeLabel }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  refreshedAt: {
    type: String,
    default: ''
  }
})

const activeKey = ref('today')

watch(
  () => props.cards,
  (cards) => {
    const current = Array.isArray(cards) ? cards : []
    if (!current.some((card) => card.key === activeKey.value)) {
      activeKey.value = current.find((card) => card.key === 'today')?.key || current[0]?.key || 'today'
    }
  },
  { immediate: true, deep: true }
)

const refreshedLabel = computed(() => {
  if (!props.refreshedAt) return 'Just now'

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(props.refreshedAt))
  } catch (error) {
    return 'Just now'
  }
})
</script>
