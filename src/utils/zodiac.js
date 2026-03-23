export const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces'
]

export const ELEMENTS = ['fire', 'earth', 'air', 'water']
export const MODES = ['cardinal', 'fixed', 'mutable']

export const SIGN_INFO = {
  aries: { element: 'fire', mode: 'cardinal' },
  taurus: { element: 'earth', mode: 'fixed' },
  gemini: { element: 'air', mode: 'mutable' },
  cancer: { element: 'water', mode: 'cardinal' },
  leo: { element: 'fire', mode: 'fixed' },
  virgo: { element: 'earth', mode: 'mutable' },
  libra: { element: 'air', mode: 'cardinal' },
  scorpio: { element: 'water', mode: 'fixed' },
  sagittarius: { element: 'fire', mode: 'mutable' },
  capricorn: { element: 'earth', mode: 'cardinal' },
  aquarius: { element: 'air', mode: 'fixed' },
  pisces: { element: 'water', mode: 'mutable' }
}

export function normaliseDegrees(value) {
  let result = value % 360
  if (result < 0) result += 360
  return result
}

export function getSignFromLongitude(longitude) {
  const normalised = normaliseDegrees(longitude)
  const index = Math.floor(normalised / 30)
  return SIGNS[index]
}

export function getDegreeInSign(longitude) {
  return normaliseDegrees(longitude) % 30
}

export function formatDegree(value) {
  return `${value.toFixed(1)}°`
}

export function toTitleCase(value) {
  return value
    .split(/\s|-/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
