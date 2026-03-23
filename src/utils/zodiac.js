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
