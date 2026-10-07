import { buildCrossAspects } from './aspects'
import { toTitleCase } from './zodiac'

const TRANSIT_DRIVES = {
  sun: 'a desire for self-expression',
  moon: 'strong feelings',
  mercury: 'quick thoughts and words',
  venus: 'a desire for closeness',
  mars: 'an urge to act',
  jupiter: 'the pull toward growth',
  saturn: 'a need to be practical',
  uranus: 'a desire for change',
  neptune: 'your imagination and ideals',
  pluto: 'a need to get to the heart of things'
}

const TRANSIT_AREAS = {
  sun: 'your confidence and sense of direction',
  moon: 'your feelings',
  mercury: 'your thoughts and conversations',
  venus: 'your relationships and values',
  mars: 'your motivation and actions',
  jupiter: 'your outlook and openness to growth',
  saturn: 'your commitments and boundaries',
  uranus: 'your independence and appetite for change',
  neptune: 'your imagination and ideals',
  pluto: 'power and deep change'
}

const NATAL_FOCUS = {
  sun: 'your confidence and sense of direction',
  moon: 'your need for emotional security',
  mercury: 'clear thinking and communication',
  venus: 'connection and what you value',
  mars: 'how you use your energy',
  jupiter: 'your willingness to grow',
  saturn: 'your responsibilities and limits',
  uranus: 'your need for independence',
  neptune: 'your ideals and intuition',
  pluto: 'deep changes and personal power',
  asc: 'how you present yourself and begin things',
  mc: 'your ambitions and public direction'
}

const SIGN_TONES = {
  aries: 'direct, energetic',
  taurus: 'steady, comfort-seeking',
  gemini: 'curious, quick-moving',
  cancer: 'protective, sensitive',
  leo: 'warm, expressive',
  virgo: 'practical, detail-focused',
  libra: 'cooperative, relationship-minded',
  scorpio: 'intense, perceptive',
  sagittarius: 'open, adventurous',
  capricorn: 'grounded, goal-focused',
  aquarius: 'independent, unconventional',
  pisces: 'intuitive, imaginative'
}

const ASPECT_GUIDANCE = {
  conjunction: (drive, focus) => `can bring ${focus} to the foreground, energized by ${drive}. Notice where you want to direct the extra attention.`,
  sextile: (drive, focus) => `can open an opportunity to use ${drive} in support of ${focus}. A small step can help put it to work.`,
  square: (drive, focus) => `can create tension between ${drive} and ${focus}. Pause and look for a response that respects both.`,
  trine: (drive, focus) => `can help ${drive} support ${focus}. Use the easier flow to make one practical move.`,
  opposition: (drive, focus) => `can make it hard to balance ${drive} with ${focus}. Give both a hearing before responding.`
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

const TRANSIT_BODIES = Object.keys(TRANSIT_DRIVES)
const TRANSIT_PRIORITY = { moon: 0, mercury: 1, venus: 2, mars: 3, sun: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9 }
const NATAL_PRIORITY = { moon: 0, sun: 1, asc: 2, mercury: 3, venus: 4, mars: 5, mc: 6, jupiter: 7, saturn: 8, uranus: 9, neptune: 10, pluto: 11 }

function placementMap(placements) {
  return new Map((Array.isArray(placements) ? placements : []).map((placement) => [placement.body, placement]))
}

function describeTransitGroup(aspects, transitMap, natalMap) {
  const transit = transitMap.get(aspects[0]?.bodyA)
  if (!transit) return ''

  const transitName = toTitleCase(transit.body)
  const article = ['sun', 'moon'].includes(transit.body) ? 'The ' : ''
  const signText = transit.sign ? ` in ${toTitleCase(transit.sign)}` : ''
  const signTone = SIGN_TONES[transit.sign] || 'distinctive'
  const toneArticle = /^[aeiou]/i.test(signTone) ? 'an' : 'a'
  const houseText = Number.isInteger(Number(transit.house)) && Number(transit.house) >= 1 && Number(transit.house) <= 12
    ? `, especially around ${houseFocus(Number(transit.house))}`
    : ''
  const transitArea = TRANSIT_AREAS[transit.body] || 'your priorities'
  const introduction = `${article}${transitName}${signText} brings ${toneArticle} ${signTone} quality to ${transitArea}${houseText}.`
  const impactSentences = aspects.map((aspect) => {
    const natal = natalMap.get(aspect.bodyB)
    if (!natal) return ''

    const natalName = toTitleCase(aspect.bodyB)
    const drive = TRANSIT_DRIVES[aspect.bodyA] || 'a shift in priorities'
    const focus = NATAL_FOCUS[aspect.bodyB] || 'your personal priorities'
    const guidance = ASPECT_GUIDANCE[aspect.type]?.(drive, focus) || `Notice how this transit affects ${focus}.`
    const aspectArticle = aspect.type === 'opposition' ? 'An' : 'A'
    return `${aspectArticle} ${aspect.type} to your natal ${natalName} ${guidance}`
  }).filter(Boolean)

  return [introduction, ...impactSentences].join(' ')
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
  const natalTargets = natalPlacements.filter((placement) => Object.hasOwn(NATAL_FOCUS, placement.body))
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

  const groups = new Map()
  for (const aspect of selected) {
    const group = groups.get(aspect.bodyA) || []
    group.push(aspect)
    groups.set(aspect.bodyA, group)
  }

  return [...groups.values()].map((aspects) => describeTransitGroup(aspects, transitMap, natalMap)).filter(Boolean)
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
