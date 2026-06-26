import ariesSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/aries.svg?raw'
import taurusSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/taurus.svg?raw'
import geminiSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/gemini.svg?raw'
import cancerSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/cancer.svg?raw'
import leoSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/leo.svg?raw'
import virgoSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/virgo.svg?raw'
import libraSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/libra.svg?raw'
import scorpioSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/scorpio.svg?raw'
import sagittariusSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/sagittarius.svg?raw'
import capricornSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/capricorn-2.svg?raw'
import aquariusSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/aquarius.svg?raw'
import piscesSign from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/pisces.svg?raw'
import sunBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/sun.svg?raw'
import moonBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/moon.svg?raw'
import mercuryBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/mercury.svg?raw'
import venusBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/venus.svg?raw'
import marsBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/mars.svg?raw'
import jupiterBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/jupiter.svg?raw'
import saturnBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/saturn.svg?raw'
import uranusBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/uranus-1.svg?raw'
import neptuneBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/neptune.svg?raw'
import plutoBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/pluto-1.svg?raw'
import ascendantBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/ascendant.svg?raw'
import mediumCoeliBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/medium-coeli.svg?raw'
import northNodeBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/north-node.svg?raw'
import southNodeBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/south-node.svg?raw'
import chironBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/chiron.svg?raw'
import lilithBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/lilith.svg?raw'
import retrogradeBody from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/retrograde.svg?raw'
import newMoonPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/new-moon.svg?raw'
import waxingCrescentPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/waxing-crescent.svg?raw'
import firstQuarterPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/first-quarter.svg?raw'
import waxingGibbousPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/waxing-gibbous.svg?raw'
import fullMoonPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/full-moon.svg?raw'
import waningGibbousPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/waning-gibbous.svg?raw'
import lastQuarterPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/last-quarter.svg?raw'
import waningCrescentPhase from '../assets/font/ZodiacFontFREE-All/svgs/sans-regular/waning-crescent.svg?raw'

const SVG_VIEWBOX = '0 0 512 512'

const SIGN_SVGS = {
  aries: ariesSign,
  taurus: taurusSign,
  gemini: geminiSign,
  cancer: cancerSign,
  leo: leoSign,
  virgo: virgoSign,
  libra: libraSign,
  scorpio: scorpioSign,
  sagittarius: sagittariusSign,
  capricorn: capricornSign,
  aquarius: aquariusSign,
  pisces: piscesSign
}

const BODY_SVGS = {
  sun: sunBody,
  moon: moonBody,
  mercury: mercuryBody,
  venus: venusBody,
  mars: marsBody,
  jupiter: jupiterBody,
  saturn: saturnBody,
  uranus: uranusBody,
  neptune: neptuneBody,
  pluto: plutoBody,
  asc: ascendantBody,
  mc: mediumCoeliBody,
  northNode: northNodeBody,
  southNode: southNodeBody,
  chiron: chironBody,
  lilith: lilithBody,
  retrograde: retrogradeBody
}

const PHASE_SVGS = {
  'new-moon': newMoonPhase,
  'waxing-crescent': waxingCrescentPhase,
  'first-quarter': firstQuarterPhase,
  'waxing-gibbous': waxingGibbousPhase,
  'full-moon': fullMoonPhase,
  'waning-gibbous': waningGibbousPhase,
  'last-quarter': lastQuarterPhase,
  'waning-crescent': waningCrescentPhase
}

function getSvgSource(kind, name) {
  if (kind === 'sign') return SIGN_SVGS[name] || ''
  if (kind === 'phase') return PHASE_SVGS[name] || ''
  return BODY_SVGS[name] || ''
}

function stripOuterSvg(svg) {
  const match = String(svg || '').match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
  return match ? match[1].trim() : ''
}

function getWholeSvg(kind, name, color = 'currentColor') {
  const svg = getSvgSource(kind, name)
  if (!svg) return ''
  return svg.replace(/currentColor/g, color)
}

export function getGlyphInnerSvg(kind, name) {
  return stripOuterSvg(getSvgSource(kind, name))
}

export function getGlyphMarkup(kind, name, color = 'currentColor') {
  return getGlyphInnerSvg(kind, name)
    ? getWholeSvg(kind, name, color)
    : ''
}

export function getGlyphDataUrl(kind, name, color = 'currentColor') {
  const svg = getWholeSvg(kind, name, color)
  return svg ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` : ''
}

export function hasGlyph(kind, name) {
  return !!getSvgSource(kind, name)
}

export function loadGlyphImage(kind, name, color = 'currentColor') {
  return new Promise((resolve, reject) => {
    const src = getGlyphDataUrl(kind, name, color)
    if (!src) {
      resolve(null)
      return
    }

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Unable to load glyph: ${kind}:${name}`))
    image.src = src
  })
}

export const GLYPH_VIEWBOX = SVG_VIEWBOX
