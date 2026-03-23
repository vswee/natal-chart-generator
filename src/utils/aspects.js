import { normaliseDegrees } from './zodiac'

const ASPECT_DEFS = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'sextile', angle: 60, orb: 5 },
  { type: 'square', angle: 90, orb: 6 },
  { type: 'trine', angle: 120, orb: 6 },
  { type: 'opposition', angle: 180, orb: 8 }
]

export function getAngularDistance(a, b) {
  const diff = Math.abs(normaliseDegrees(a) - normaliseDegrees(b))
  return diff > 180 ? 360 - diff : diff
}

export function buildAspects(placements) {
  const result = []

  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const first = placements[i]
      const second = placements[j]
      const distance = getAngularDistance(first.longitude, second.longitude)

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(distance - def.angle)
        if (orb <= def.orb) {
          result.push({
            bodyA: first.body,
            bodyB: second.body,
            type: def.type,
            angle: def.angle,
            orb: Number(orb.toFixed(2))
          })
          break
        }
      }
    }
  }

  return result
}

export function buildCrossAspects(placementsA, placementsB, allowedBodies = null) {
  const result = []
  const allowedSet = allowedBodies ? new Set(allowedBodies) : null

  for (const first of placementsA) {
    if (allowedSet && !allowedSet.has(first.body)) continue
    for (const second of placementsB) {
      if (allowedSet && !allowedSet.has(second.body)) continue

      const distance = getAngularDistance(first.longitude, second.longitude)

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(distance - def.angle)
        if (orb <= def.orb) {
          result.push({
            bodyA: first.body,
            bodyB: second.body,
            type: def.type,
            angle: def.angle,
            orb: Number(orb.toFixed(2))
          })
          break
        }
      }
    }
  }

  return result
}
