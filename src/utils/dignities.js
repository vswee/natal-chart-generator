import { SIGNS } from './zodiac'

export const SIGN_RULERS = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'pluto',
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'uranus',
  pisces: 'neptune'
}

export const EXALTATIONS = {
  aries: 'sun',
  taurus: 'moon',
  cancer: 'jupiter',
  virgo: 'mercury',
  libra: 'saturn',
  capricorn: 'mars',
  pisces: 'venus'
}

const MAJOR_BODIES = [
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

function oppositeSign(sign) {
  const index = SIGNS.indexOf(sign)
  if (index < 0) return null
  return SIGNS[(index + 6) % 12]
}

export function getDignity(body, sign) {
  if (!body || !sign) return 'neutral'
  if (SIGN_RULERS[sign] === body) return 'domicile'
  const opposite = oppositeSign(sign)
  if (opposite && SIGN_RULERS[opposite] === body) return 'detriment'
  if (EXALTATIONS[sign] === body) return 'exaltation'
  if (opposite && EXALTATIONS[opposite] === body) return 'fall'
  return 'neutral'
}

export function buildDignityReport(placements) {
  const list = Array.isArray(placements) ? placements : []
  return list
    .filter((placement) => MAJOR_BODIES.includes(placement.body))
    .map((placement) => ({
      body: placement.body,
      sign: placement.sign,
      house: placement.house,
      dignity: getDignity(placement.body, placement.sign),
      ruler: SIGN_RULERS[placement.sign] || null
    }))
}

export function buildDispositorReport(placements) {
  const list = Array.isArray(placements) ? placements : []
  const map = new Map(list.map((placement) => [placement.body, placement]))

  return list
    .filter((placement) => MAJOR_BODIES.includes(placement.body))
    .map((placement) => {
      const ruler = SIGN_RULERS[placement.sign]
      const rulerPlacement = ruler ? map.get(ruler) : null
      return {
        body: placement.body,
        ruler,
        rulerPlacement
      }
    })
}

export function getChartRuler(placements) {
  const list = Array.isArray(placements) ? placements : []
  const asc = list.find((placement) => placement.body === 'asc')
  if (!asc) return null
  const ruler = SIGN_RULERS[asc.sign]
  if (!ruler) return null
  const placement = list.find((item) => item.body === ruler) || null
  return {
    ascSign: asc.sign,
    ruler,
    placement
  }
}
