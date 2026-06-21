import { SIGN_INFO } from './zodiac'
import aquariusGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/aquarius.svg?raw'
import ariesGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/aries.svg?raw'
import ascendantGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/ascendant.svg?raw'
import cancerGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/cancer.svg?raw'
import capricornGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/capricorn-2.svg?raw'
import geminiGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/gemini.svg?raw'
import leoGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/leo.svg?raw'
import libraGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/libra.svg?raw'
import moonGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/moon.svg?raw'
import piscesGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/pisces.svg?raw'
import sagittariusGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/sagittarius.svg?raw'
import scorpioGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/scorpio.svg?raw'
import taurusGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/taurus.svg?raw'
import virgoGlyph from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/virgo.svg?raw'

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

const ELEMENT_PALETTES = {
  fire: ['#211018', '#7c2d12', '#f97316', '#fed7aa', '#fff7ed'],
  earth: ['#101914', '#24513e', '#84a98c', '#d8f3dc', '#f7fee7'],
  air: ['#101828', '#1d4ed8', '#7dd3fc', '#dbeafe', '#f8fbff'],
  water: ['#0b1220', '#164e63', '#2dd4bf', '#ccfbf1', '#f0fdfa']
}

const SIGN_GLYPHS = {
  aries: ariesGlyph,
  taurus: taurusGlyph,
  gemini: geminiGlyph,
  cancer: cancerGlyph,
  leo: leoGlyph,
  virgo: virgoGlyph,
  libra: libraGlyph,
  scorpio: scorpioGlyph,
  sagittarius: sagittariusGlyph,
  capricorn: capricornGlyph,
  aquarius: aquariusGlyph,
  pisces: piscesGlyph
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

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function extractSvgViewBox(svgText) {
  const match = String(svgText || '').match(/viewBox="([^"]+)"/i)
  return match?.[1] || '0 0 100 100'
}

function extractSvgInner(svgText) {
  const source = String(svgText || '')
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')

  const match = source.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i)
  return match?.[1] || ''
}

function prepareGlyphMarkup(svgText) {
  return extractSvgInner(svgText)
    .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
}

function buildGlyphUse(svgText, { x, y, size, color = '#ffffff', opacity = 1, filter = '' }) {
  if (!svgText) return ''

  const viewBox = extractSvgViewBox(svgText)
  const inner = prepareGlyphMarkup(svgText)
  const filterAttribute = filter ? ` filter="${escapeAttribute(filter)}"` : ''

  return `
    <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeAttribute(viewBox)}" color="${escapeAttribute(color)}" opacity="${opacity}"${filterAttribute} aria-hidden="true">
      ${inner}
    </svg>
  `
}

function getPalette(seed, primaryElement) {
  const selected = ELEMENT_PALETTES[primaryElement] || ELEMENT_PALETTES.air
  const shift = seed % selected.length
  return selected.map((_, index) => selected[(index + shift) % selected.length])
}

function starField(seed) {
  return Array.from({ length: 24 }, (_, index) => {
    const starSeed = hashString(`${seed}|star|${index}`)
    const x = 12 + (starSeed % 136)
    const y = 12 + ((starSeed >> 8) % 136)
    const radius = 0.45 + ((starSeed >> 16) % 10) / 10
    const opacity = 0.22 + ((starSeed >> 24) % 55) / 100

    return `<circle cx="${x}" cy="${y}" r="${radius.toFixed(2)}" fill="#fff" opacity="${opacity.toFixed(2)}" />`
  }).join('')
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
  const palette = getPalette(seed, primaryElement)
  const rotation = (seed % 360 + 360) % 360
  const oppositeRotation = (rotation + 180) % 360
  const nickname = buildProfileNickname(chart)
  const avatarLabel = `${nickname} profile image`

  const mainGlyph = SIGN_GLYPHS[sun?.sign] || SIGN_GLYPHS[moon?.sign] || SIGN_GLYPHS[asc?.sign] || null
  const moonSignGlyph = SIGN_GLYPHS[moon?.sign] || moonGlyph
  const ascSignGlyph = SIGN_GLYPHS[asc?.sign] || ascendantGlyph

  const monogram = nickname
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  
  const mainGlyphMarkup = mainGlyph
  ? buildGlyphUse(mainGlyph, {
    x: 48,
    y: 46,
    size: 64,
    color: '#ffffff',
    opacity: 0.98,
    filter: 'url(#symbolGlow)'
  })
  : `<text x="80" y="99" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="66" font-weight="700" fill="#ffffff" filter="url(#symbolGlow)">✦</text>`

const moonGlyphMarkup = buildGlyphUse(moonSignGlyph, {
  x: 116,
  y: 37,
  size: 16,
  color: '#e0f2fe',
  opacity: 1
})

const ascGlyphMarkup = buildGlyphUse(ascSignGlyph, {
  x: 34,
  y: 111,
  size: 16,
  color: '#f8fafc',
  opacity: 1
})

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${escapeAttribute(avatarLabel)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation} 80 80)">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="45%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>

        <radialGradient id="aura" cx="32%" cy="18%" r="82%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.92" />
          <stop offset="34%" stop-color="${palette[3]}" stop-opacity="0.26" />
          <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="core" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
          <stop offset="74%" stop-color="#ffffff" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
        </radialGradient>

        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity="0.34" />
        </filter>

        <filter id="symbolGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.42" />
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity="0.30" />
        </filter>
      </defs>

      <rect width="160" height="160" rx="40" fill="url(#bg)" />
      <rect width="160" height="160" rx="40" fill="url(#aura)" />

      <path d="M-18 126 C22 86 40 148 82 108 C116 74 130 34 180 62" fill="none" stroke="#ffffff" stroke-width="28" opacity="0.055" />
      <path d="M-10 38 C32 22 55 42 82 28 C112 12 142 18 176 0" fill="none" stroke="#ffffff" stroke-width="18" opacity="0.06" />

      ${starField(seed)}

      <g transform="rotate(${oppositeRotation} 80 80)" opacity="0.64">
        <circle cx="80" cy="80" r="66" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.24" stroke-dasharray="2 7" />
        <circle cx="80" cy="80" r="52" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.26" />
        <circle cx="80" cy="80" r="38" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.18" />
      </g>

      <g filter="url(#softShadow)">
        <circle cx="80" cy="80" r="48" fill="url(#core)" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.48" />
        <circle cx="80" cy="80" r="39" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.22" />
      </g>

      ${mainGlyphMarkup}

      <text x="80" y="125" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="17" font-weight="700" letter-spacing="0.08em" fill="#ffffff" opacity="0.86">
        ${escapeText(monogram)}
      </text>

      <g opacity="0.94">
        <circle cx="37" cy="42" r="14" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.34" />
        <text x="37" y="48" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#fff7d6">☉</text>
      </g>

      <g opacity="0.84">
        <circle cx="124" cy="45" r="13" fill="#ffffff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.30" />
        ${moonGlyphMarkup}
      </g>

      <g opacity="0.78">
        <circle cx="42" cy="119" r="12" fill="#ffffff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.26" />
        ${ascGlyphMarkup}
      </g>

      <rect x="1" y="1" width="158" height="158" rx="39" fill="none" stroke="#ffffff" stroke-opacity="0.28" />
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
