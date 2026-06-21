import { SIGN_INFO, toTitleCase } from './zodiac'
import { getGlyphDataUrl } from './astro-glyphs'

const ELEMENT_COLORS = {
  fire: ['#d46a59', '#f3b15d', '#f9e1b2'],
  earth: ['#73946f', '#b4c98f', '#e7edd3'],
  air: ['#6f8fc6', '#a8c2f1', '#e3ebff'],
  water: ['#4d9ea5', '#86c4c8', '#dff6f7']
}

const ADJECTIVES = {
  fire: ['Solar', 'Ember', 'Radiant', 'Scarlet'],
  earth: ['Verdant', 'Rooted', 'Stone', 'Terra'],
  air: ['Aerial', 'Swift', 'Lucid', 'Breeze'],
  water: ['Lunar', 'Tidal', 'Velvet', 'Current']
}

const NOUNS = {
  aries: ['Spark', 'Trailblazer', 'Comet', 'Ram'],
  taurus: ['Anchor', 'Bloom', 'Muse', 'Bull'],
  gemini: ['Signal', 'Twin', 'Oracle', 'Wisp'],
  cancer: ['Harbor', 'Shell', 'Caretaker', 'Crab'],
  leo: ['Crown', 'Lion', 'Beacon', 'Heart'],
  virgo: ['Compass', 'Curator', 'Sage', 'Healer'],
  libra: ['Mirror', 'Balancer', 'Scales', 'Bridge'],
  scorpio: ['Cipher', 'Shadow', 'Phoenix', 'Scorpion'],
  sagittarius: ['Archer', 'Voyager', 'Quest', 'Arrow'],
  capricorn: ['Summit', 'Goat', 'Keeper', 'Pillar'],
  aquarius: ['Wave', 'Seeker', 'Current', 'Star'],
  pisces: ['Dreamer', 'Tide', 'Song', 'Fathom']
}

function hashString(value) {
  let hash = 2166136261
  const input = String(value || '')

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function pickFrom(list, seed) {
  if (!Array.isArray(list) || !list.length) return ''
  return list[Math.abs(seed) % list.length]
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getPlacement(chart, body) {
  return chart?.placements?.find?.((placement) => placement.body === body) || null
}

function getChartSeed(chart) {
  const sun = getPlacement(chart, 'sun')
  const moon = getPlacement(chart, 'moon')
  const asc = getPlacement(chart, 'asc')
  const meta = chart?.meta || {}

  return hashString([
    meta.date || '',
    meta.time || '',
    meta.lat ?? '',
    meta.lon ?? '',
    sun?.sign || '',
    moon?.sign || '',
    asc?.sign || '',
    sun?.degreeInSign ?? '',
    moon?.degreeInSign ?? '',
    asc?.degreeInSign ?? ''
  ].join('|'))
}

export function buildProfileNickname(chart) {
  const sun = getPlacement(chart, 'sun')
  const moon = getPlacement(chart, 'moon')
  const asc = getPlacement(chart, 'asc')
  const seed = getChartSeed(chart)
  const primaryElement = SIGN_INFO[sun?.sign]?.element || SIGN_INFO[moon?.sign]?.element || 'air'
  const adjectivePool = ADJECTIVES[primaryElement] || ADJECTIVES.air
  const nounPool = NOUNS[moon?.sign] || NOUNS[asc?.sign] || NOUNS[sun?.sign] || NOUNS.gemini

  return `${pickFrom(adjectivePool, seed)} ${pickFrom(nounPool, seed >> 3)}`
}

export function buildProfileAvatar(chart) {
  const sun = getPlacement(chart, 'sun')
  const moon = getPlacement(chart, 'moon')
  const asc = getPlacement(chart, 'asc')
  const seed = getChartSeed(chart)
  const primaryElement = SIGN_INFO[sun?.sign]?.element || 'air'
  const secondaryElement = SIGN_INFO[moon?.sign]?.element || 'water'
  const tertiaryElement = SIGN_INFO[asc?.sign]?.element || 'fire'
  const colors = [
    ...(ELEMENT_COLORS[primaryElement] || ELEMENT_COLORS.air),
    ...(ELEMENT_COLORS[secondaryElement] || ELEMENT_COLORS.water),
    ...(ELEMENT_COLORS[tertiaryElement] || ELEMENT_COLORS.fire)
  ]
  const rotation = (seed % 360 + 360) % 360
  const glyphA = getGlyphDataUrl('body', 'sun', '#ffffff')
  const glyphB = getGlyphDataUrl('body', 'moon', '#ffffff')
  const glyphC = getGlyphDataUrl('body', 'asc', '#ffffff')
  const nickname = buildProfileNickname(chart)
  const avatarLabel = `${nickname} profile image`

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${avatarLabel}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation} 80 80)">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="55%" stop-color="${colors[2]}" />
          <stop offset="100%" stop-color="${colors[5]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88" />
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.14" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#bg)" />
      <circle cx="80" cy="80" r="56" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.42)" stroke-width="2" />
      <circle cx="80" cy="80" r="36" fill="rgba(255,255,255,0.16)" stroke="rgba(15,23,42,0.18)" stroke-width="1.5" />
      <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-dasharray="3 8" />
      <circle cx="80" cy="80" r="74" fill="url(#glow)" opacity="0.8" />
      <image href="${escapeAttribute(glyphA)}" x="40" y="34" width="22" height="22" />
      <image href="${escapeAttribute(glyphB)}" x="94" y="30" width="20" height="20" />
      <image href="${escapeAttribute(glyphC)}" x="48" y="104" width="20" height="20" />
      <text x="80" y="94" text-anchor="middle" font-size="34" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" fill="#fff">
        ${toTitleCase(primaryElement)}
      </text>
    </svg>
  `.trim()

  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    label: avatarLabel
  }
}

export function buildProfileIdentity(chart) {
  const nickname = buildProfileNickname(chart)
  const avatar = buildProfileAvatar(chart)
  return {
    nickname,
    avatarSrc: avatar.src,
    avatarLabel: avatar.label
  }
}
