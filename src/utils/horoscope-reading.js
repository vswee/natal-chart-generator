import { buildCrossAspects } from './aspects'
import { toTitleCase } from './zodiac'

const PLANET_THEMES = {
  sun: 'identity and confidence',
  moon: 'feelings and emotional needs',
  mercury: 'thinking and communication',
  venus: 'connection, pleasure, and values',
  mars: 'drive and action',
  jupiter: 'growth and possibility',
  saturn: 'responsibility and boundaries',
  uranus: 'freedom and change',
  neptune: 'imagination and ideals',
  pluto: 'power and deep change',
  asc: 'your outward style and first steps',
  mc: 'ambition and public direction'
}

const TRANSIT_EFFECTS = {
  sun: 'brings attention to',
  moon: 'stirs',
  mercury: 'gets you thinking and talking about',
  venus: 'draws you toward',
  mars: 'adds energy to',
  jupiter: 'opens up',
  saturn: 'asks you to take a steadier approach to',
  uranus: 'shakes up',
  neptune: 'softens the edges around',
  pluto: 'intensifies'
}

const ASPECT_GUIDANCE = {
  conjunction: (transitTheme, natalTheme) => `${transitTheme} and ${natalTheme} combine, making this area especially noticeable.`,
  sextile: (transitTheme, natalTheme) => `There is an opening between ${transitTheme} and ${natalTheme}; a small initiative may help you use it.`,
  square: (transitTheme, natalTheme) => `${transitTheme} and ${natalTheme} may pull against each other, so a pause before reacting can help.`,
  trine: (transitTheme, natalTheme) => `${transitTheme} and ${natalTheme} tend to work together easily, so progress may feel more natural.`,
  opposition: (transitTheme, natalTheme) => `${transitTheme} and ${natalTheme} can pull your attention in different directions; finding a middle ground helps.`
}

const DAILY_MOON_CUES = {
  aries: 'quick decisions and a need to act',
  taurus: 'comfort, patience, and practical priorities',
  gemini: 'conversation, curiosity, and changing plans',
  cancer: 'belonging, care, and emotional security',
  leo: 'creative expression and being seen',
  virgo: 'useful routines and getting the details right',
  libra: 'cooperation, fairness, and connection',
  scorpio: 'honesty, trust, and emotional depth',
  sagittarius: 'fresh perspective and room to explore',
  capricorn: 'clear goals and steady progress',
  aquarius: 'independence, ideas, and community',
  pisces: 'rest, imagination, and sensitivity'
}

const TRANSIT_BODIES = Object.keys(TRANSIT_EFFECTS)
const TRANSIT_PRIORITY = { moon: 0, mercury: 1, venus: 2, mars: 3, sun: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9 }
const NATAL_PRIORITY = { moon: 0, sun: 1, asc: 2, mercury: 3, venus: 4, mars: 5, mc: 6, jupiter: 7, saturn: 8, uranus: 9, neptune: 10, pluto: 11 }

function placementMap(placements) {
  return new Map((Array.isArray(placements) ? placements : []).map((placement) => [placement.body, placement]))
}

function describeAspect(aspect, transitMap, natalMap) {
  const transit = transitMap.get(aspect.bodyA)
  const natal = natalMap.get(aspect.bodyB)
  if (!transit || !natal) return ''

  const transitName = toTitleCase(aspect.bodyA)
  const natalName = toTitleCase(aspect.bodyB)
  const transitTheme = PLANET_THEMES[aspect.bodyA] || 'change and attention'
  const natalTheme = PLANET_THEMES[aspect.bodyB] || 'personal priorities'
  const effect = TRANSIT_EFFECTS[aspect.bodyA] || 'brings attention to'
  const signText = transit.sign ? ` in ${toTitleCase(transit.sign)}` : ''
  const houseText = Number.isInteger(Number(transit.house)) && Number(transit.house) >= 1 && Number(transit.house) <= 12
    ? `, especially around ${houseFocus(Number(transit.house))}`
    : ''
  const aspectName = aspect.type === 'conjunction' ? 'A conjunction' : `A ${aspect.type}`

  const guidance = ASPECT_GUIDANCE[aspect.type]?.(transitTheme, natalTheme) || 'Notice how these two themes affect each other.'
  return `${transitName}${signText} (${transitTheme}) ${effect} your natal ${natalName} (${natalTheme})${houseText}. ${aspectName}: ${guidance}`
}

function houseFocus(house) {
  const focuses = {
    1: 'self-expression and fresh starts',
    2: 'money and personal values',
    3: 'conversations and everyday learning',
    4: 'home, family, and inner security',
    5: 'creativity, romance, and enjoyment',
    6: 'daily work and routines',
    7: 'partnerships and collaboration',
    8: 'shared resources and deeper bonds',
    9: 'learning, travel, and beliefs',
    10: 'career and public direction',
    11: 'friends, community, and future plans',
    12: 'rest, reflection, and closure'
  }
  return focuses[house]
}

function getTransitAspects(chart, transits) {
  const natalPlacements = Array.isArray(chart?.placements) ? chart.placements : []
  const transitPlacements = (Array.isArray(transits?.placements) ? transits.placements : [])
    .filter((placement) => TRANSIT_BODIES.includes(placement.body))
  const natalTargets = natalPlacements.filter((placement) => Object.hasOwn(PLANET_THEMES, placement.body))
  const transitMap = placementMap(transitPlacements)
  const natalMap = placementMap(natalTargets)
  const aspects = buildCrossAspects(transitPlacements, natalTargets)
    .filter((aspect) => aspect.orb <= 5)
    .sort((a, b) => {
      const priorityA = (TRANSIT_PRIORITY[a.bodyA] ?? 10) + (NATAL_PRIORITY[a.bodyB] ?? 12)
      const priorityB = (TRANSIT_PRIORITY[b.bodyA] ?? 10) + (NATAL_PRIORITY[b.bodyB] ?? 12)
      return priorityA - priorityB || a.orb - b.orb
    })

  const selected = []
  const usedTargets = new Set()
  for (const aspect of aspects) {
    if (usedTargets.has(aspect.bodyB)) continue
    selected.push(aspect)
    usedTargets.add(aspect.bodyB)
    if (selected.length === 2) break
  }

  return selected.map((aspect) => describeAspect(aspect, transitMap, natalMap)).filter(Boolean)
}

export function buildHoroscopeReading(chart, transits) {
  const transitAspects = getTransitAspects(chart, transits)
  if (transitAspects.length) return transitAspects.join(' ')

  const moonSign = transits?.moon?.sign
  const moonCue = DAILY_MOON_CUES[moonSign]
  const natalMoon = placementMap(chart?.placements).get('moon')
  if (moonCue && natalMoon?.sign) {
    return `The Moon in ${toTitleCase(moonSign)} brings focus to ${moonCue}. With your natal Moon in ${toTitleCase(natalMoon.sign)}, notice which familiar comforts help you respond thoughtfully rather than automatically.`
  }
  if (moonCue) {
    return `The Moon in ${toTitleCase(moonSign)} brings focus to ${moonCue}. Give yourself room to notice what feels supportive before committing to a plan.`
  }
  return 'Use today to notice which parts of your chart feel most active, and choose one practical step that supports what matters to you.'
}
