<template>
  <section class="panel daily-horoscope-rail">
    <div class="panel-inner daily-horoscope-rail-inner">
      <div class="daily-horoscope-header">
        <div>
          <h2 class="section-title">Daily horoscope</h2>
          <p class="section-copy">Today in focus, with the surrounding days kept close.</p>
        </div>

        <div class="daily-horoscope-meta">
          <span class="daily-horoscope-meta-label">Refreshed</span>
          <span class="daily-horoscope-meta-value">{{ refreshedLabel }}</span>
        </div>
      </div>

      <div v-if="featuredCard && chart" class="daily-horoscope-feature">
        <div class="daily-horoscope-chart" aria-hidden="true">
          <CoStarStyleChartWheel
            :embedded="true"
            :show-chrome="false"
            :decorative="true"
            :placements="chart.placements"
            :aspects="chart.aspects"
            :cusps="chart.houseCusps"
          />
        </div>

        <article class="daily-horoscope-card daily-horoscope-card--featured">
          <div class="daily-horoscope-card-head">
            <div>
              <p class="daily-horoscope-day">{{ featuredCard.dayLabel }}</p>
              <h3 class="daily-horoscope-title">{{ props.profileIdentity.nickname ? `Dear ${props.profileIdentity.nickname}, ` : ''}}{{ featuredCard.headline }}</h3>
            </div>
            <p class="daily-horoscope-date">{{ featuredCard.dateLabel }}</p>
          </div>

          <p class="daily-horoscope-copy">{{ featuredCard.copy }}</p>

          <div class="daily-horoscope-footer">
            <span class="daily-horoscope-chip">{{ featuredCard.moonLabel }}</span>
            <span v-if="featuredCard.retrogradeLabel" class="daily-horoscope-chip">{{ featuredCard.retrogradeLabel }}</span>
          </div>

          <div class="daily-horoscope-actions" aria-label="Daily horoscope actions">
            <button class="button daily-horoscope-action" type="button" @click="emit('go-share')">
              Share your chart
            </button>
            <button class="subtle-button daily-horoscope-action" type="button" @click="emit('go-advanced')">
              Advanced view
            </button>
            <button class="subtle-button daily-horoscope-action" type="button" @click="emit('add-partner')">
              Romance + compatibility
            </button>
          </div>
        </article>
      </div>

      <div class="daily-horoscope-tabs" role="tablist" aria-label="Surrounding horoscope days">
        <button
          v-for="card in timelineCards"
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
          v-for="card in timelineCards"
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
import CoStarStyleChartWheel from './CoStarStyleChartWheel.vue'

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  chart: {
    type: Object,
    default: null
  },
  profileIdentity: {
    type: Object,
    default: null
  },
  refreshedAt: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['go-share', 'go-advanced', 'add-partner'])

const featuredCard = computed(() => props.cards.find((card) => card.key === 'today') || props.cards[0] || null)
const timelineCards = computed(() => props.cards.filter((card) => card.key !== 'today').slice(0, 3))

const activeKey = ref('yesterday')

watch(
  timelineCards,
  (cards) => {
    if (!cards.some((card) => card.key === activeKey.value)) {
      activeKey.value = cards[0]?.key || ''
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
