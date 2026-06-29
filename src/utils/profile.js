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

const AVATAR_FOREGROUND = '#ffffff'
const MIN_AVATAR_TEXT_CONTRAST = 4.5

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

function parseHexColor(color) {
  const match = String(color || '').trim().match(/^#?([0-9a-f]{6})$/i)
  if (!match) return null

  const value = match[1]
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  }
}

function toLinearChannel(value) {
  const channel = value / 255
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function getRelativeLuminance(color) {
  const rgb = parseHexColor(color)
  if (!rgb) return 0

  return (0.2126 * toLinearChannel(rgb.r)) + (0.7152 * toLinearChannel(rgb.g)) + (0.0722 * toLinearChannel(rgb.b))
}

function getContrastRatio(colorA, colorB) {
  const luminanceA = getRelativeLuminance(colorA)
  const luminanceB = getRelativeLuminance(colorB)
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)

  return (lighter + 0.05) / (darker + 0.05)
}

function isReadableOnWhite(color) {
  return getContrastRatio(color, AVATAR_FOREGROUND) >= MIN_AVATAR_TEXT_CONTRAST
}

function chooseAvatarBackground(palette) {
  const readableColor = palette.find(isReadableOnWhite)
  if (readableColor) return readableColor

  return '#111827'
}

function chooseAvatarAccent(palette, background) {
  const readableColor = palette.find((color) => color !== background && isReadableOnWhite(color))
  if (readableColor) return readableColor

  return background === '#111827' ? '#1f2937' : '#111827'
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
        x: 38,
        y: 33,
        size: 84,
        color: AVATAR_FOREGROUND,
        opacity: 1
      })
    : `<text x="80" y="102" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="78" font-weight="700" fill="${AVATAR_FOREGROUND}">✦</text>`

  const moonGlyphMarkup = buildGlyphUse(moonSignGlyph, {
    x: 115,
    y: 115,
    size: 20,
    color: AVATAR_FOREGROUND,
    opacity: 1
  })

  const ascGlyphMarkup = buildGlyphUse(ascSignGlyph, {
    x: 25,
    y: 115,
    size: 20,
    color: AVATAR_FOREGROUND,
    opacity: 1
  })
  
  const background = chooseAvatarBackground(palette)
  const foreground = AVATAR_FOREGROUND
  const accent = chooseAvatarAccent(palette, background)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${escapeAttribute(avatarLabel)}">
      <rect width="160" height="160" rx="24" fill="${background}" />
      <rect x="10" y="10" width="140" height="140" rx="16" fill="none" stroke="${foreground}" stroke-opacity="0.18" stroke-width="2" />

      <path d="M24 28H78" stroke="${foreground}" stroke-opacity="0.28" stroke-width="3" stroke-linecap="square" />
      <path d="M82 132H136" stroke="${foreground}" stroke-opacity="0.28" stroke-width="3" stroke-linecap="square" />

      <g opacity="0.98">
        ${mainGlyphMarkup}
      </g>

      <g>
        <rect x="18" y="18" width="30" height="30" rx="2" fill="${foreground}" fill-opacity="0.08" stroke="${foreground}" stroke-opacity="0.24" />
        <text x="33" y="39" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="${foreground}">☉</text>
      </g>

      <g>
        <rect x="112" y="112" width="30" height="30" rx="2" fill="${foreground}" fill-opacity="0.08" stroke="${foreground}" stroke-opacity="0.24" />
        ${moonGlyphMarkup}
      </g>

      <g>
        <rect x="18" y="112" width="30" height="30" rx="2" fill="${foreground}" fill-opacity="0.08" stroke="${foreground}" stroke-opacity="0.24" />
        ${ascGlyphMarkup}
      </g>

      <g>
        <rect x="57" y="119" width="46" height="24" rx="2" fill="${accent}" />
        <text x="80" y="136" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" letter-spacing="0.08em" fill="${foreground}">
          ${escapeText(monogram)}
        </text>
      </g>
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
