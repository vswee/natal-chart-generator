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
          <CoStarStyleChartWheel :embedded="true" :show-chrome="false" :decorative="true" :placements="chart.placements"
            :aspects="chart.aspects" :cusps="chart.houseCusps" />
        </div>

        <article class="daily-horoscope-card daily-horoscope-card--featured">
          <div class="daily-horoscope-card-head">
            <div>
              <p class="daily-horoscope-day">{{ featuredCard.dayLabel }}</p>
              <h3 class="daily-horoscope-title">{{ props.profileIdentity.nickname ? `Dear
                ${props.profileIdentity.nickname}, ` : ''}}{{ featuredCard.headline }}</h3>
            </div>
            <p class="daily-horoscope-date">{{ featuredCard.dateLabel }}</p>
          </div>

          <p class="daily-horoscope-copy">{{ featuredCard.copy }}</p>

          <div v-if="chipItems(featuredCard).length" class="daily-horoscope-footer">
            <span v-for="chip in chipItems(featuredCard)" :key="chip.key"
              :class="['daily-horoscope-chip', chip.type ? `daily-horoscope-chip--${chip.type}` : '']">
              <span v-if="chip.icon || chip.stateIcon" class="daily-horoscope-chip-icons" aria-hidden="true">
                <AstroGlyph v-if="chip.icon" class="daily-horoscope-chip-icon" :kind="chip.iconKind || 'body'"
                  :body="chip.icon" :size="chip.iconSize || 14" />
                <AstroGlyph v-if="chip.stateIcon" class="daily-horoscope-chip-icon daily-horoscope-chip-icon--state"
                  :kind="chip.stateIconKind || 'body'" :body="chip.stateIcon" :size="chip.stateIconSize || 11" />
              </span>
              <span class="daily-horoscope-chip-label">{{ chip.label }}</span>
            </span>
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
            <button class="subtle-button daily-horoscope-action" type="button" @click="emit('see-ideal-match')">
              See ideal match
            </button>
          </div>
        </article>
      </div>

      <div class="daily-horoscope-tabs" role="tablist" aria-label="Surrounding horoscope days">
        <button v-for="card in timelineCards" :key="card.key" type="button" class="daily-horoscope-tab"
          :class="{ 'is-active': activeKey === card.key }" :aria-selected="activeKey === card.key"
          :tabindex="activeKey === card.key ? 0 : -1" @click="activeKey = card.key">
          <span class="daily-horoscope-tab-label">{{ card.dayLabel }}</span>
          <span class="daily-horoscope-tab-date">{{ card.dateLabel }}</span>
        </button>
      </div>

      <div class="daily-horoscope-cards">
        <article v-for="card in timelineCards" :key="card.key" class="daily-horoscope-card"
          :class="{ 'is-active': activeKey === card.key }">
          <div class="daily-horoscope-card-head">
            <div>
              <p class="daily-horoscope-day">{{ card.dayLabel }}</p>
              <h3 class="daily-horoscope-title">{{ card.headline }}</h3>
            </div>
            <p class="daily-horoscope-date">{{ card.dateLabel }}</p>
          </div>

          <p class="daily-horoscope-copy">{{ card.copy }}</p>

          <div v-if="chipItems(card).length" class="daily-horoscope-footer">
            <span v-for="chip in chipItems(card)" :key="chip.key"
              :class="['daily-horoscope-chip', chip.type ? `daily-horoscope-chip--${chip.type}` : '']">
              <span v-if="chip.icon || chip.stateIcon" class="daily-horoscope-chip-icons" aria-hidden="true">
                <AstroGlyph v-if="chip.icon" class="daily-horoscope-chip-icon" :kind="chip.iconKind || 'body'"
                  :body="chip.icon" :size="chip.iconSize || 14" />
                <AstroGlyph v-if="chip.stateIcon" class="daily-horoscope-chip-icon daily-horoscope-chip-icon--state"
                  :kind="chip.stateIconKind || 'body'" :body="chip.stateIcon" :size="chip.stateIconSize || 11" />
              </span>
              <span class="daily-horoscope-chip-label">{{ chip.label }}</span>
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AstroGlyph from './AstroGlyph.vue'
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

const emit = defineEmits(['go-share', 'go-advanced', 'add-partner', 'see-ideal-match'])

const featuredCard = computed(() => props.cards.find((card) => card.key === 'today') || props.cards[0] || null)
const timelineCards = computed(() => props.cards.filter((card) => card.key !== 'today').slice(0, 3))

const activeKey = ref('yesterday')

function chipItems(card) {
  if (!card) return []

  if (Array.isArray(card.chips) && card.chips.length) {
    return card.chips.filter((chip) => chip?.label)
  }

  const fallbackChips = []
  if (card.moonLabel) {
    fallbackChips.push({
      key: `${card.key || 'card'}-moon`,
      type: 'moon',
      iconKind: 'body',
      icon: 'moon',
      label: card.moonLabel
    })
  }
  if (card.retrogradeLabel) {
    fallbackChips.push({
      key: `${card.key || 'card'}-retrograde`,
      type: 'retrograde',
      iconKind: 'body',
      icon: 'retrograde',
      label: card.retrogradeLabel
    })
  }

  return fallbackChips
}

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
