import { getAngularDistance } from './aspects'

const PATTERN_BODIES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto'
]

const ORBS = {
  trine: 6,
  square: 6,
  opposition: 8,
  sextile: 4,
  quincunx: 3
}

function within(angle, target, orb) {
  return Math.abs(angle - target) <= orb
}

function labelBody(body) {
  const labels = {
    sun: 'Sun',
    moon: 'Moon',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto'
  }
  return labels[body] || body
}

function buildKey(type, bodies, apex) {
  const sorted = bodies.map((body) => body.body).sort().join('-')
  return `${type}:${sorted}:${apex || ''}`
}

export function buildAspectPatterns(placements) {
  const list = Array.isArray(placements)
    ? placements.filter((placement) => PATTERN_BODIES.includes(placement.body))
    : []

  const patterns = []
  const seen = new Set()

  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      for (let k = j + 1; k < list.length; k += 1) {
        const a = list[i]
        const b = list[j]
        const c = list[k]

        const ab = getAngularDistance(a.longitude, b.longitude)
        const ac = getAngularDistance(a.longitude, c.longitude)
        const bc = getAngularDistance(b.longitude, c.longitude)

        if (
          within(ab, 120, ORBS.trine) &&
          within(ac, 120, ORBS.trine) &&
          within(bc, 120, ORBS.trine)
        ) {
          const key = buildKey('grand-trine', [a, b, c])
          if (!seen.has(key)) {
            seen.add(key)
            patterns.push({
              type: 'grand-trine',
              title: 'Grand Trine',
              bodies: [a.body, b.body, c.body],
              description: 'Three planets in mutual trines, creating an easy flow of energy.'
            })
          }
        }

        const pairs = [
          { first: a, second: b, third: c, dist: ab, distThirdA: ac, distThirdB: bc },
          { first: a, second: c, third: b, dist: ac, distThirdA: ab, distThirdB: bc },
          { first: b, second: c, third: a, dist: bc, distThirdA: ab, distThirdB: ac }
        ]

        pairs.forEach((pair) => {
          if (within(pair.dist, 180, ORBS.opposition)) {
            if (
              within(pair.distThirdA, 90, ORBS.square) &&
              within(pair.distThirdB, 90, ORBS.square)
            ) {
              const key = buildKey('t-square', [pair.first, pair.second, pair.third], pair.third.body)
              if (!seen.has(key)) {
                seen.add(key)
                patterns.push({
                  type: 't-square',
                  title: 'T-Square',
                  bodies: [pair.first.body, pair.second.body, pair.third.body],
                  apex: pair.third.body,
                  description: 'An opposition with a third planet squaring both, creating dynamic tension.'
                })
              }
            }
          }

          if (within(pair.dist, 60, ORBS.sextile)) {
            if (
              within(pair.distThirdA, 150, ORBS.quincunx) &&
              within(pair.distThirdB, 150, ORBS.quincunx)
            ) {
              const key = buildKey('yod', [pair.first, pair.second, pair.third], pair.third.body)
              if (!seen.has(key)) {
                seen.add(key)
                patterns.push({
                  type: 'yod',
                  title: 'Yod',
                  bodies: [pair.first.body, pair.second.body, pair.third.body],
                  apex: pair.third.body,
                  description: 'Two planets sextile, both quincunx to an apex planet, highlighting adjustment.'
                })
              }
            }
          }
        })
      }
    }
  }

  return patterns
    .map((pattern) => ({
      ...pattern,
      bodiesLabel: pattern.bodies.map(labelBody).join(' · '),
      apexLabel: pattern.apex ? labelBody(pattern.apex) : null
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
