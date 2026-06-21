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
  fire: ['#1f0a0d', '#651a1d', '#b63a1f', '#f08a2b', '#ffe09c'],
  earth: ['#171007', '#4f3514', '#9c6b24', '#d6a53d', '#fff0bd'],
  air: ['#10192c', '#273b68', '#7b6bb2', '#dfa43a', '#fff1c0'],
  water: ['#0b1522', '#134766', '#1a7b87', '#d49a32', '#fff2c8']
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

function starField(seed, palette) {
  const starPalette = [palette?.[4] || '#ffffff', palette?.[3] || '#dff7ff', '#ffffff']

  return Array.from({ length: 24 }, (_, index) => {
    const starSeed = hashString(`${seed}|star|${index}`)
    const x = 12 + (starSeed % 136)
    const y = 12 + ((starSeed >> 8) % 136)
    const radius = 0.45 + ((starSeed >> 16) % 10) / 10
    const opacity = 0.22 + ((starSeed >> 24) % 55) / 100
    const fill = starPalette[index % starPalette.length]

    return `<circle cx="${x}" cy="${y}" r="${radius.toFixed(2)}" fill="${fill}" opacity="${opacity.toFixed(2)}" />`
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
  const primaryElement = SIGN_INFO[sun?.sign]?.element || SIGN_INFO[moon?.sign]?.element || SIGN_INFO[asc?.sign]?.element || 'air'
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
    color: '#e8fbff',
    opacity: 1
  })

  const ascGlyphMarkup = buildGlyphUse(ascSignGlyph, {
    x: 34,
    y: 111,
    size: 16,
    color: '#f4f7ff',
    opacity: 1
  })

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${escapeAttribute(avatarLabel)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation} 80 80)">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="34%" stop-color="${palette[1]}" />
          <stop offset="68%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[3]}" />
        </linearGradient>

        <radialGradient id="aura" cx="32%" cy="18%" r="84%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.96" />
          <stop offset="26%" stop-color="${palette[4]}" stop-opacity="0.32" />
          <stop offset="48%" stop-color="${palette[3]}" stop-opacity="0.42" />
          <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="core" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34" />
          <stop offset="58%" stop-color="#ffffff" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
        </radialGradient>

        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.88" />
          <stop offset="45%" stop-color="${palette[3]}" stop-opacity="0.24" />
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="orb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0.16" />
        </linearGradient>

        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity="0.34" />
        </filter>

        <filter id="symbolGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${palette[4]}" flood-opacity="0.48" />
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity="0.28" />
        </filter>
      </defs>

      <rect width="160" height="160" rx="40" fill="url(#bg)" />
      <rect width="160" height="160" rx="40" fill="url(#aura)" />
      <rect x="13" y="13" width="134" height="134" rx="30" fill="none" stroke="#fff3cf" stroke-opacity="0.16" />

      <path d="M-18 126 C22 86 40 148 82 108 C116 74 130 34 180 62" fill="none" stroke="#fff1c2" stroke-width="28" opacity="0.075" />
      <path d="M-10 38 C32 22 55 42 82 28 C112 12 142 18 176 0" fill="none" stroke="#ffd98a" stroke-width="18" opacity="0.08" />
      <path d="M18 28 C40 8 61 10 80 28 C99 46 120 48 142 26" fill="none" stroke="${palette[4]}" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.36" />
      <path d="M22 134 C53 114 105 112 138 136" fill="none" stroke="#fff4d2" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.2" />

      ${starField(seed, palette)}

      <g transform="rotate(${oppositeRotation} 80 80)" opacity="0.64">
        <circle cx="80" cy="80" r="66" fill="none" stroke="#fff5d2" stroke-width="1" stroke-opacity="0.24" stroke-dasharray="2 7" />
        <circle cx="80" cy="80" r="52" fill="none" stroke="url(#orb)" stroke-width="1.5" stroke-opacity="0.42" />
        <circle cx="80" cy="80" r="38" fill="none" stroke="#fff8ea" stroke-width="1" stroke-opacity="0.16" />
      </g>

      <g filter="url(#softShadow)">
        <circle cx="80" cy="80" r="50" fill="url(#halo)" opacity="0.72" />
        <circle cx="80" cy="80" r="47" fill="url(#core)" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.48" />
        <circle cx="80" cy="80" r="39" fill="none" stroke="#fff6df" stroke-width="1" stroke-opacity="0.24" />
      </g>

      ${mainGlyphMarkup}

      <g transform="translate(80 122)">
        <rect x="-18" y="-10" width="36" height="20" rx="10" fill="#fff3cf" fill-opacity="0.16" stroke="#fff7df" stroke-opacity="0.24" />
        <text x="0" y="5" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="17" font-weight="700" letter-spacing="0.08em" fill="#ffffff" opacity="0.92">
          ${escapeText(monogram)}
        </text>
      </g>

      <g opacity="0.94">
        <circle cx="37" cy="42" r="14" fill="#fff3cf" fill-opacity="0.18" stroke="#fff7df" stroke-opacity="0.28" />
        <text x="37" y="48" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#ffffff">☉</text>
      </g>

      <g opacity="0.84">
        <circle cx="124" cy="45" r="13" fill="#fff3cf" fill-opacity="0.14" stroke="#fff7df" stroke-opacity="0.24" />
        ${moonGlyphMarkup}
      </g>

      <g opacity="0.78">
        <circle cx="42" cy="119" r="12" fill="#fff3cf" fill-opacity="0.14" stroke="#fff7df" stroke-opacity="0.22" />
        ${ascGlyphMarkup}
      </g>

      <rect x="1" y="1" width="158" height="158" rx="39" fill="none" stroke="#fff8e5" stroke-opacity="0.3" />
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
