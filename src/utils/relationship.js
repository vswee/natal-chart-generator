import { buildCrossAspects } from './aspects'
import { clamp } from './scoring'

const BODY_LABELS = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  asc: 'Ascendant',
  mc: 'Midheaven'
}

const TYPE_LABELS = {
  conjunction: 'conjunct',
  sextile: 'sextile',
  square: 'square',
  trine: 'trine',
  opposition: 'oppose'
}

const CATEGORY_DEFS = [
  {
    key: 'sex',
    label: 'Sex',
    base: 45,
    pairs: [
      ['venus', 'mars'],
      ['venus', 'pluto'],
      ['mars', 'pluto'],
      ['moon', 'mars']
    ],
    weights: {
      conjunction: 10,
      trine: 7,
      sextile: 6,
      square: 4,
      opposition: 3
    }
  },
  {
    key: 'friendship',
    label: 'Friendship',
    base: 50,
    pairs: [
      ['mercury', 'mercury'],
      ['mercury', 'sun'],
      ['mercury', 'moon'],
      ['jupiter', 'sun'],
      ['jupiter', 'moon']
    ],
    weights: {
      conjunction: 7,
      trine: 6,
      sextile: 5,
      square: -3,
      opposition: -2
    }
  },
  {
    key: 'romance',
    label: 'Romance',
    base: 48,
    pairs: [
      ['venus', 'moon'],
      ['venus', 'sun'],
      ['sun', 'moon'],
      ['venus', 'venus']
    ],
    weights: {
      conjunction: 8,
      trine: 7,
      sextile: 6,
      square: -4,
      opposition: -3
    }
  },
  {
    key: 'compatibility',
    label: 'Compatibility',
    base: 50,
    pairs: 'all',
    weights: {
      conjunction: 6,
      trine: 6,
      sextile: 5,
      square: -5,
      opposition: -4
    }
  }
]

const ALLOWED_BODIES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'pluto',
  'asc'
]

function labelBody(body) {
  return BODY_LABELS[body] || body
}

function labelType(type) {
  return TYPE_LABELS[type] || type
}

function matchesPair(aspect, pair) {
  if (pair === 'all') return true
  return (
    (aspect.bodyA === pair[0] && aspect.bodyB === pair[1]) ||
    (aspect.bodyA === pair[1] && aspect.bodyB === pair[0])
  )
}

function summarizeCategory(key, score) {
  if (key === 'sex') {
    if (score >= 70) return 'Strong physical chemistry.'
    if (score >= 55) return 'Attraction is there, but balanced.'
    return 'Physical chemistry is lighter here.'
  }

  if (key === 'friendship') {
    if (score >= 70) return 'Easy rapport and shared interests.'
    if (score >= 55) return 'A steady friendship tone.'
    return 'Friendship may take a bit more effort.'
  }

  if (key === 'romance') {
    if (score >= 70) return 'Romance feels warm and present.'
    if (score >= 55) return 'Romance is there, but balanced.'
    return 'Romance is quieter here.'
  }

  if (score >= 70) return 'Overall compatibility feels strong.'
  if (score >= 55) return 'Overall compatibility is fairly balanced.'
  return 'Overall compatibility is more mixed.'
}

function summarizeCategoryLong(key, score) {
  if (key === 'sex') {
    if (score >= 70) {
      return 'Physical attraction and chemistry are strong here. There is likely to be clear desire, magnetism and a noticeable pull between you.'
    }
    if (score >= 55) {
      return 'Attraction is clearly present, though it shares space with other parts of the relationship. Physical interest is there without taking over everything.'
    }
    return 'Physical chemistry is lighter here. Attraction may depend more on timing, mood or emotional connection than on instant intensity.'
  }

  if (key === 'friendship') {
    if (score >= 70) {
      return 'Communication, shared interests and mutual understanding are strong here. The connection is likely to feel easy, engaging and mentally in step.'
    }
    if (score >= 55) {
      return 'Friendship is steady and supportive without being the main theme. There is enough common ground to build on, alongside other priorities.'
    }
    return 'Friendship is possible, but it may take more time, intention or shared experience to build.'
  }

  if (key === 'romance') {
    if (score >= 70) {
      return 'Romance is strong here, with warmth, affection and emotional closeness playing a clear part in the connection.'
    }
    if (score >= 55) {
      return 'Romance is present in a balanced way. It adds to the connection without defining all of it.'
    }
    return 'Romance is quieter here. The connection may lean more towards practical, mental or situational dynamics than open affection.'
  }

  if (score >= 70) {
    return 'Overall compatibility is strong, with more supportive dynamics than conflicting ones. The connection is likely to feel workable.'
  }
  if (score >= 55) {
    return 'Overall compatibility is balanced, with both supportive and challenging dynamics. The connection can work, though it may need some adjustment.'
  }
  return 'Overall compatibility is more mixed, with noticeable tension or differences. It may need more effort to keep steady.'
}

function buildHighlights(aspects, weights) {
  const weighted = aspects
    .map((aspect) => ({
      aspect,
      weight: weights[aspect.type] ?? 0,
      absWeight: Math.abs(weights[aspect.type] ?? 0)
    }))
    .filter((item) => item.absWeight > 0)

  if (weighted.length === 0) {
    return ['No tight cross-aspects stand out.']
  }

  return weighted
    .sort((a, b) => a.aspect.orb - b.aspect.orb || b.absWeight - a.absWeight)
    .slice(0, 3)
    .map(({ aspect }) => {
      const left = labelBody(aspect.bodyA)
      const right = labelBody(aspect.bodyB)
      const type = labelType(aspect.type)
      return `${left} ${type} ${right} (orb ${aspect.orb.toFixed(2)} deg)`
    })
}

function scoreCategory(key, aspects, weights, base) {
  let total = base

  aspects.forEach((aspect) => {
    const delta = weights[aspect.type]
    if (delta !== undefined) {
      total += delta
      if (key === 'compatibility' && (aspect.bodyA === 'saturn' || aspect.bodyB === 'saturn')) {
        if (aspect.type === 'trine' || aspect.type === 'sextile' || aspect.type === 'conjunction') {
          total += 2
        } else if (aspect.type === 'square' || aspect.type === 'opposition') {
          total -= 3
        }
      }
    }
  })

  return clamp(Math.round(total))
}

export function buildRelationshipReport(chartA, chartB, options = {}) {
  if (!chartA || !chartB) return null

  const aspects = buildCrossAspects(chartA.placements, chartB.placements, ALLOWED_BODIES)

  const categories = CATEGORY_DEFS.map((def) => {
    const relevant = def.pairs === 'all'
      ? aspects
      : aspects.filter((aspect) => def.pairs.some((pair) => matchesPair(aspect, pair)))

    const score = scoreCategory(def.key, relevant, def.weights, def.base)

    return {
      key: def.key,
      label: def.label,
      score,
      summary: summarizeCategory(def.key, score),
      summaryLong: summarizeCategoryLong(def.key, score),
      highlights: buildHighlights(relevant, def.weights)
    }
  })

  const labelA = options.labelA || chartA.meta?.label || 'Chart A'
  const labelB = options.labelB || chartB.meta?.label || 'Chart B'

  return {
    chartA: {
      label: labelA,
      date: chartA.meta?.date,
      time: chartA.meta?.time,
      address: chartA.meta?.address
    },
    chartB: {
      label: labelB,
      date: chartB.meta?.date,
      time: chartB.meta?.time,
      address: chartB.meta?.address
    },
    categories
  }
}
