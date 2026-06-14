import { normaliseDegrees, toTitleCase, SIGNS, SIGN_INFO } from './zodiac'

export const CHART_GIF_SIZE = 640
export const CHART_GIF_RENDER_SCALE = 2
export const CHART_GIF_FPS = 12
export const CHART_GIF_DURATION_MS = 3000

const TAU = Math.PI * 2
const CHART_GIF_LAYOUT_SCALE = 0.82
const CHART_GIF_INTRO_SCALE = 1.12

const BODY_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  asc: 'ASC',
  mc: 'MC'
}

const SIGN_GLYPHS = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓'
}

const ELEMENT_COLORS = {
  fire: '#d37a69',
  earth: '#83b48d',
  air: '#7d9ed9',
  water: '#72b3b0'
}

const ASPECT_COLORS = {
  conjunction: '#5d6270',
  trine: '#4f948b',
  sextile: '#6e89cb',
  square: '#c26e66',
  opposition: '#c18a63'
}

const PLACEMENT_LABELS = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  asc: 'Ascendant',
  mc: 'Midheaven'
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeOutCubic(value) {
  const t = clamp(value)
  return 1 - (1 - t) ** 3
}

function easeInOutCubic(value) {
  const t = clamp(value)
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
}

function getChartGifZoom(progress) {
  const settle = easeInOutCubic(clamp((progress - 0.06) / 0.62))
  return lerp(CHART_GIF_INTRO_SCALE, 1, settle)
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

function mulberry32(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function parseHexColor(hex) {
  const normalized = String(hex || '#000000').replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized.padEnd(6, '0').slice(0, 6)
  const value = Number.parseInt(expanded, 16) || 0
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  }
}

function mixHexColor(from, to, t) {
  const a = parseHexColor(from)
  const b = parseHexColor(to)
  const ratio = clamp(t)
  const r = Math.round(lerp(a.r, b.r, ratio))
  const g = Math.round(lerp(a.g, b.g, ratio))
  const bValue = Math.round(lerp(a.b, b.b, ratio))
  return `rgb(${r}, ${g}, ${bValue})`
}

function rgbaFromHex(hex, alpha = 1) {
  const { r, g, b } = parseHexColor(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function normaliseCusps(cusps) {
  const raw = Array.isArray(cusps) || ArrayBuffer.isView(cusps)
    ? Array.from(cusps)
    : []

  if (raw.length >= 13) return raw.slice(1)
  if (raw.length === 12) return raw
  return Array.from({ length: 12 }, (_, index) => index * 30)
}

function getRotation(placements) {
  const asc = placements.find((placement) => placement.body === 'asc')
  return asc ? asc.longitude + 90 : 0
}

function angleForLongitude(longitude, rotation) {
  return normaliseDegrees(longitude - rotation)
}

function polarToPoint(angle, radius, center) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians)
  }
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  })

  if (line) lines.push(line)

  const visibleLines = lines.slice(0, maxLines)
  visibleLines.forEach((entry, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? '...' : ''
    ctx.fillText(`${entry}${suffix}`, x, y + index * lineHeight)
  })

  return visibleLines.length * lineHeight
}

function drawRingSegment(ctx, center, startAngle, endAngle, outerRadius, innerRadius) {
  const normalizedStart = normaliseDegrees(startAngle)
  let normalizedEnd = normaliseDegrees(endAngle)
  if (normalizedEnd <= normalizedStart) normalizedEnd += 360

  const startRadians = ((normalizedStart - 90) * Math.PI) / 180
  const endRadians = ((normalizedEnd - 90) * Math.PI) / 180

  ctx.beginPath()
  ctx.arc(center.x, center.y, outerRadius, startRadians, endRadians, false)
  ctx.arc(center.x, center.y, innerRadius, endRadians, startRadians, true)
  ctx.closePath()
}

function drawStarField(ctx, scene, progress) {
  const shimmer = 0.75 + Math.sin(progress * TAU * 2.1) * 0.08

  scene.stars.forEach((star) => {
    ctx.save()
    ctx.globalAlpha = star.alpha * shimmer
    ctx.fillStyle = star.color
    ctx.shadowBlur = star.blur
    ctx.shadowColor = star.color
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, TAU)
    ctx.fill()
    ctx.restore()
  })
}

function drawBackground(ctx, scene, progress, flatten) {
  const size = scene.size
  const skyBlend = easeInOutCubic(clamp((progress - 0.06) / 0.9))
  const topLeft = mixHexColor('#0a1020', '#fcfaf4', skyBlend)
  const bottomRight = mixHexColor('#121a31', '#e9f0f6', skyBlend)
  const centerGlow = mixHexColor('#18274d', '#f3efe8', skyBlend)
  const accentGlow = mixHexColor('#5b74d5', '#d9e4f3', skyBlend)

  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, topLeft)
  gradient.addColorStop(0.45, mixHexColor('#101a31', '#eef2f8', skyBlend))
  gradient.addColorStop(1, bottomRight)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const glowA = ctx.createRadialGradient(size * 0.18, size * 0.16, 0, size * 0.18, size * 0.16, size * 0.54)
  glowA.addColorStop(0, rgbaFromHex(centerGlow, 0.36 * (1 - flatten) + 0.12))
  glowA.addColorStop(0.35, rgbaFromHex(accentGlow, 0.18 * (1 - flatten) + 0.05))
  glowA.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, size, size)

  const glowB = ctx.createRadialGradient(size * 0.82, size * 0.84, 0, size * 0.82, size * 0.84, size * 0.46)
  glowB.addColorStop(0, rgbaFromHex('#c67c72', 0.18 * (1 - flatten) + 0.03))
  glowB.addColorStop(0.45, rgbaFromHex('#ffffff', 0.08 * (1 - flatten) + 0.03))
  glowB.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, size, size)
}

function drawTitleBlock(ctx, scene, progress, flatten) {
  const { size, titleX, titleTop, titleWidth, scale } = scene
  const titleBlend = easeInOutCubic(clamp((progress - 0.08) / 0.45))
  const textColor = mixHexColor('#f8f3ea', '#132033', titleBlend)
  const accentColor = mixHexColor('#efe7da', '#4f5f76', titleBlend)
  const lineColor = mixHexColor('#d7cfbf', '#b2bdca', titleBlend)

  ctx.save()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = accentColor
  ctx.font = `${Math.round(12 * scale)}px Manrope, Arial, sans-serif`
  ctx.fillText('NATAL CHART', titleX, titleTop)

  ctx.fillStyle = textColor
  ctx.font = `700 ${Math.round(28 * scale)}px "Cormorant Garamond", Georgia, serif`
  drawWrappedText(ctx, scene.titleCopy, titleX, titleTop + Math.round(18 * scale), titleWidth, Math.round(28 * scale), 2)

  ctx.fillStyle = mixHexColor('#d0c8bb', '#5d6b7c', titleBlend)
  ctx.font = `${Math.round(12.5 * scale)}px Manrope, Arial, sans-serif`
  drawWrappedText(ctx, scene.subtitleCopy, titleX, titleTop + Math.round(86 * scale), titleWidth * 0.85, Math.round(16 * scale), 2)

  ctx.strokeStyle = rgbaFromHex(lineColor, 0.65)
  ctx.lineWidth = Math.max(1, 1.5 * scale)
  ctx.beginPath()
  ctx.moveTo(titleX, titleTop + Math.round(128 * scale))
  ctx.lineTo(titleX + Math.round(114 * scale), titleTop + Math.round(128 * scale))
  ctx.stroke()
  ctx.restore()
}

function drawPlanetMarker(ctx, point, radius, symbol, color, alpha, scale) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 18 * scale
  ctx.shadowColor = rgbaFromHex(color, 0.34)
  const gradient = ctx.createRadialGradient(
    point.x - radius * 0.32,
    point.y - radius * 0.32,
    radius * 0.1,
    point.x,
    point.y,
    radius
  )
  gradient.addColorStop(0, rgbaFromHex('#ffffff', 0.95))
  gradient.addColorStop(0.22, rgbaFromHex(color, 0.98))
  gradient.addColorStop(1, rgbaFromHex('#1d2433', 0.96))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius, 0, TAU)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.strokeStyle = rgbaFromHex('#ffffff', 0.28)
  ctx.lineWidth = Math.max(1, 1.15 * scale)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  const symbolScale = symbol.length > 2 ? 0.72 : 1
  ctx.font = `700 ${Math.max(10, Math.round(radius * 1.05 * symbolScale))}px Manrope, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(symbol, point.x, point.y + 0.5)
  ctx.restore()
}

function drawShell(ctx, scene, progress, flatten) {
  const { center, chartScale } = scene
  const scale = chartScale
  const shellAlpha = 1 - easeInOutCubic(clamp((progress - 0.25) / 0.6)) * 0.9
  const tilt = lerp(0.66, 0.94, flatten)
  const spin = lerp(-0.34, -0.02, flatten) + Math.sin(progress * TAU * 0.35) * (1 - flatten) * 0.06
  const orbitPulse = Math.sin(progress * TAU * 1.5) * (1 - flatten)
  const zoom = getChartGifZoom(progress)

  ctx.save()
  ctx.translate(center.x, center.y + (1 - flatten) * 14 * scale)
  ctx.scale(zoom, zoom)
  ctx.rotate(spin)
  ctx.scale(1, tilt)

  ctx.globalAlpha = shellAlpha

  const shellBaseRadius = scene.signOuterRadius + 46 * scale
  const shellRings = [
    shellBaseRadius,
    scene.placementRadius + 38 * scale,
    scene.aspectRadius + 26 * scale
  ]

  shellRings.forEach((radius, index) => {
    ctx.beginPath()
    ctx.ellipse(0, 0, radius, radius * (0.78 - index * 0.09), 0, 0, TAU)
    ctx.strokeStyle = rgbaFromHex('#e9eff8', 0.22 - index * 0.04 + (1 - flatten) * 0.06)
    ctx.lineWidth = Math.max(1, 2 * scale - index * 0.2 * scale)
    ctx.stroke()
  })

  ctx.beginPath()
  ctx.ellipse(0, 0, shellBaseRadius * 0.9, shellBaseRadius * 0.56, 0, 0, TAU)
  ctx.fillStyle = rgbaFromHex('#ffffff', 0.06 + (1 - flatten) * 0.06)
  ctx.fill()

  const sweepAngle = normaliseDegrees(progress * 320 + 34)
  const sweepPoint = polarToPoint(sweepAngle, shellBaseRadius, { x: 0, y: 0 })
  ctx.save()
  ctx.translate(sweepPoint.x, sweepPoint.y)
  ctx.shadowBlur = 24 * scale
  ctx.shadowColor = rgbaFromHex('#ffffff', 0.48)
  ctx.fillStyle = rgbaFromHex('#ffffff', 0.78)
  ctx.beginPath()
  ctx.arc(0, 0, 6 * scale, 0, TAU)
  ctx.fill()
  ctx.restore()

  scene.placementPoints.forEach((placement, index) => {
    const wobble = Math.sin(progress * TAU * 1.2 + index * 0.8)
    const lead = (1 - flatten) * (14 + index * 0.75)
    const travelAngle = placement.angle + wobble * (1 - flatten) * 10 + lead * (1 - flatten)
    const travelRadius = scene.placementRadius + (1 - flatten) * (34 + (index % 3) * 8) * scale
    const orbitPoint = polarToPoint(travelAngle, travelRadius, { x: 0, y: 0 })
    const depth = 0.68 + (1 - flatten) * 0.24 + Math.sin((travelAngle + index * 18) * Math.PI / 180) * 0.05
    const radius = (placement.body === 'sun' || placement.body === 'moon' || placement.body === 'asc')
      ? 11 * scale
      : 9 * scale

    drawPlanetMarker(
      ctx,
      orbitPoint,
      radius * depth,
      placement.symbol,
      placement.color,
      shellAlpha * (0.9 - index * 0.02),
      scale
    )
  })

  ctx.restore()
  return orbitPulse
}

function drawWheel(ctx, scene, progress, flatten) {
  const { center, chartScale } = scene
  const scale = chartScale
  const wheelAlpha = easeInOutCubic(clamp((progress - 0.22) / 0.6))
  const labelAlpha = clamp((progress - 0.35) / 0.45)
  const zoom = getChartGifZoom(progress)

  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.scale(zoom, zoom)
  ctx.globalAlpha = wheelAlpha

  ctx.save()
  ctx.shadowBlur = 28 * scale
  ctx.shadowColor = rgbaFromHex('#ffffff', 0.22)
  ctx.fillStyle = rgbaFromHex('#ffffff', 0.38)
  ctx.beginPath()
  ctx.arc(0, 0, scene.signOuterRadius + 8 * scale, 0, TAU)
  ctx.fill()
  ctx.restore()

  scene.signSegments.forEach((segment) => {
    drawRingSegment(ctx, { x: 0, y: 0 }, segment.startAngle, segment.endAngle, scene.signBandOuterRadius, scene.signOuterRadius)
    ctx.fillStyle = rgbaFromHex(ELEMENT_COLORS[segment.element], 0.88)
    ctx.fill()
  })

  ctx.fillStyle = rgbaFromHex('#ffffff', 0.7)
  ctx.beginPath()
  ctx.arc(0, 0, scene.signOuterRadius, 0, TAU)
  ctx.strokeStyle = rgbaFromHex('#4f445f', 0.34)
  ctx.lineWidth = Math.max(1, 1.4 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, scene.signInnerRadius, 0, TAU)
  ctx.strokeStyle = rgbaFromHex('#655578', 0.16)
  ctx.lineWidth = Math.max(1, 1.2 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, scene.innerRingRadius, 0, TAU)
  ctx.strokeStyle = rgbaFromHex('#655578', 0.18)
  ctx.lineWidth = Math.max(1, 1.1 * scale)
  ctx.setLineDash([4 * scale, 6 * scale])
  ctx.stroke()
  ctx.setLineDash([])

  scene.signBoundaries.forEach((boundary) => {
    ctx.strokeStyle = rgbaFromHex('#574a67', 0.18)
    ctx.lineWidth = Math.max(1, 1 * scale)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(boundary.end.x - center.x, boundary.end.y - center.y)
    ctx.stroke()
  })

  scene.houseLines.forEach((house) => {
    ctx.strokeStyle = house.isAxis
      ? rgbaFromHex('#3e334f', 0.44)
      : rgbaFromHex('#655578', 0.18)
    ctx.lineWidth = house.isAxis ? Math.max(1.2, 1.5 * scale) : Math.max(1, 1.1 * scale)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(house.point.x - center.x, house.point.y - center.y)
    ctx.stroke()
  })

  scene.aspectLines.forEach((aspect) => {
    const style = ASPECT_COLORS[aspect.type] || ASPECT_COLORS.conjunction
    ctx.strokeStyle = rgbaFromHex(style, 0.62 * wheelAlpha)
    ctx.lineWidth = Math.max(1, 1.08 * scale)
    ctx.beginPath()
    ctx.moveTo(aspect.from.x - center.x, aspect.from.y - center.y)
    ctx.lineTo(aspect.to.x - center.x, aspect.to.y - center.y)
    ctx.stroke()
  })

  scene.signGlyphs.forEach((sign) => {
    ctx.fillStyle = rgbaFromHex('#322941', 0.92 * labelAlpha + 0.08)
    ctx.font = `700 ${Math.round(16 * scale)}px "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols 2", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(SIGN_GLYPHS[sign.sign] || sign.sign.slice(0, 2), sign.point.x - center.x, sign.point.y - center.y)
  })

  scene.houseLabels.forEach((house) => {
    ctx.fillStyle = rgbaFromHex('#5e5770', 0.9 * labelAlpha + 0.08)
    ctx.font = `${Math.round(10 * scale)}px Manrope, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(house.index), house.point.x - center.x, house.point.y - center.y)
  })

  scene.placementPoints.forEach((placement) => {
    const point = placement.point
    ctx.save()
    ctx.globalAlpha = wheelAlpha
    ctx.shadowBlur = 12 * scale
    ctx.shadowColor = rgbaFromHex(placement.color, 0.32)
    ctx.fillStyle = rgbaFromHex('#ffffff', 0.88)
    ctx.beginPath()
    ctx.arc(point.x - center.x, point.y - center.y, placement.body === 'sun' || placement.body === 'moon' || placement.body === 'asc' ? 11 * scale : 9 * scale, 0, TAU)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = rgbaFromHex('#132033', 0.96 * labelAlpha + 0.04)
    const placementSymbolScale = placement.symbol.length > 2 ? 0.78 : 1
    ctx.font = `700 ${Math.round((placement.body === 'sun' || placement.body === 'moon' || placement.body === 'asc' ? 13 : 12) * scale * placementSymbolScale)}px "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols 2", Manrope, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(placement.symbol, point.x - center.x, point.y - center.y + 0.4)

    ctx.fillStyle = rgbaFromHex('#5c6475', 0.84 * labelAlpha + 0.08)
    ctx.font = `${Math.round(10 * scale)}px Manrope, Arial, sans-serif`
    ctx.fillText(placement.degreeLabel, placement.degreePoint.x - center.x, placement.degreePoint.y - center.y)
  })

  const sweepAngle = normaliseDegrees(progress * 320 + 34)
  const sweepPoint = polarToPoint(sweepAngle, scene.signOuterRadius + 10 * scale, { x: center.x, y: center.y })
  ctx.save()
  ctx.shadowBlur = 20 * scale
  ctx.shadowColor = rgbaFromHex('#ffffff', 0.54)
  ctx.strokeStyle = rgbaFromHex('#ffffff', 0.86 * wheelAlpha)
  ctx.lineWidth = Math.max(1.5, 2.2 * scale)
  ctx.beginPath()
  ctx.arc(0, 0, scene.signOuterRadius + 10 * scale, ((sweepAngle - 10 - 90) * Math.PI) / 180, ((sweepAngle + 10 - 90) * Math.PI) / 180)
  ctx.stroke()
  ctx.fillStyle = rgbaFromHex('#ffffff', 0.92)
  ctx.beginPath()
  ctx.arc(sweepPoint.x - center.x, sweepPoint.y - center.y, 5 * scale, 0, TAU)
  ctx.fill()
  ctx.restore()

  ctx.globalAlpha = 1
  ctx.fillStyle = rgbaFromHex('#ffffff', 0.9 * labelAlpha + 0.06)
  ctx.beginPath()
  ctx.arc(0, 0, scene.innerRingRadius * 0.36, 0, TAU)
  ctx.fill()

  ctx.restore()
}

function drawFooter(ctx, scene, progress, flatten) {
  const { size, scale } = scene
  const footerBlend = easeInOutCubic(clamp((progress - 0.62) / 0.26))
  const footerAlpha = 0.84 * footerBlend

  ctx.save()
  ctx.fillStyle = rgbaFromHex('#0f172a', 0.78 * footerAlpha)
  ctx.font = `${Math.round(11.5 * scale)}px Manrope, Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(scene.footerCopy, size - Math.round(40 * scale), size - Math.round(28 * scale))
  ctx.restore()
}

export function createChartGifScene(chart, size = CHART_GIF_SIZE) {
  const placements = Array.isArray(chart?.placements) ? chart.placements : []
  const aspects = Array.isArray(chart?.aspects) ? chart.aspects : []
  const houseCusps = normaliseCusps(chart?.houseCusps)
  const center = {
    x: size / 2,
    y: size / 2
  }
  const scale = size / 360
  const chartScale = scale * CHART_GIF_LAYOUT_SCALE
  const rotation = getRotation(placements)
  const signOuterRadius = 162 * chartScale
  const signBandOuterRadius = signOuterRadius + 3 * chartScale
  const signInnerRadius = 138 * chartScale
  const innerRingRadius = 108 * chartScale
  const houseLineRadius = signInnerRadius
  const houseLabelRadius = 35 * chartScale
  const placementRadius = 126 * chartScale
  const placementDegreeRadius = 102 * chartScale
  const aspectRadius = 92 * chartScale
  const titleX = Math.round(size * 0.08)
  const titleTop = Math.round(size * 0.065)
  const titleWidth = Math.round(size * 0.78)
  const seed = hashString([
    chart?.meta?.date || '',
    chart?.meta?.time || '',
    chart?.meta?.address || '',
    placements.map((placement) => `${placement.body}:${placement.longitude.toFixed(2)}`).join('|')
  ].join('::'))
  const random = mulberry32(seed || 1)
  const stars = Array.from({ length: 40 }, () => {
    const angle = random() * TAU
    const distance = 0.06 + random() * 0.86
    const x = center.x + Math.cos(angle) * size * distance * (0.42 + random() * 0.52)
    const y = center.y + Math.sin(angle) * size * distance * (0.38 + random() * 0.48)
    const color = random() > 0.7 ? '#ffffff' : '#d9e1ef'
    return {
      x,
      y,
      radius: 0.8 + random() * 1.8,
      alpha: 0.06 + random() * 0.18,
      blur: 2 + random() * 5,
      color
    }
  })

  const placementLookup = new Map(placements.map((placement) => [placement.body, placement]))

  const signSegments = SIGNS.map((sign, index) => {
    const startAngle = angleForLongitude(index * 30, rotation)
    const endAngle = angleForLongitude((index + 1) * 30, rotation)
    const midAngle = angleForLongitude(index * 30 + 15, rotation)
    const info = SIGN_INFO[sign] || { element: 'air' }
    return {
      sign,
      element: info.element,
      startAngle,
      endAngle,
      midAngle
    }
  })

  const signBoundaries = SIGNS.map((sign, index) => {
    const angle = angleForLongitude(index * 30, rotation)
    return {
      index,
      sign,
      start: polarToPoint(angle, signOuterRadius, center),
      end: polarToPoint(angle, signInnerRadius, center)
    }
  })

  const signGlyphs = SIGNS.map((sign, index) => {
    const angle = angleForLongitude(index * 30 + 15, rotation)
    const info = SIGN_INFO[sign] || { element: 'air' }
    const point = polarToPoint(angle, (signOuterRadius + signInnerRadius) / 2, center)
    return {
      sign,
      element: info.element,
      point
    }
  })

  const houseLines = houseCusps.map((cusp, index) => {
    const angle = angleForLongitude(cusp, rotation)
    return {
      index: index + 1,
      isAxis: [1, 4, 7, 10].includes(index + 1),
      angle,
      point: polarToPoint(angle, houseLineRadius, center)
    }
  })

  const houseLabels = houseCusps.map((cusp, index) => {
    const next = houseCusps[(index + 1) % houseCusps.length]
    const span = normaliseDegrees(next - cusp)
    const midAngle = normaliseDegrees(cusp + span / 2)
    return {
      index: index + 1,
      point: polarToPoint(angleForLongitude(midAngle, rotation), houseLabelRadius, center)
    }
  })

  const placementPoints = placements.map((placement) => {
    const angle = angleForLongitude(placement.longitude, rotation)
    const signInfo = SIGN_INFO[placement.sign] || { element: 'air' }
    const color = ELEMENT_COLORS[signInfo.element] || '#7d9ed9'
    return {
      body: placement.body,
      symbol: BODY_SYMBOLS[placement.body] || toTitleCase(placement.body).slice(0, 2),
      label: PLACEMENT_LABELS[placement.body] || toTitleCase(placement.body),
      element: signInfo.element,
      color,
      longitude: placement.longitude,
      angle,
      point: polarToPoint(angle, placementRadius, center),
      degreePoint: polarToPoint(angle, placementDegreeRadius, center),
      degreeLabel: `${Math.floor(placement.degreeInSign)}°${String(Math.round((placement.degreeInSign % 1) * 60)).padStart(2, '0')}'${placement.retrograde ? ' R' : ''}`
    }
  })

  const aspectLines = aspects
    .map((aspect) => {
      const first = placementLookup.get(aspect.bodyA)
      const second = placementLookup.get(aspect.bodyB)
      if (!first || !second) return null

      const fromAngle = angleForLongitude(first.longitude, rotation)
      const toAngle = angleForLongitude(second.longitude, rotation)
      const bodyA = PLACEMENT_LABELS[aspect.bodyA] || toTitleCase(aspect.bodyA)
      const bodyB = PLACEMENT_LABELS[aspect.bodyB] || toTitleCase(aspect.bodyB)

      return {
        id: `${aspect.bodyA}-${aspect.type}-${aspect.bodyB}`,
        type: aspect.type,
        from: polarToPoint(fromAngle, aspectRadius, center),
        to: polarToPoint(toAngle, aspectRadius, center),
        title: `${bodyA} ${aspect.type} ${bodyB} (orb ${aspect.orb.toFixed(2)}°)`
      }
    })
    .filter(Boolean)

  const titleCopy = (() => {
    const sun = placementLookup.get('sun')
    const moon = placementLookup.get('moon')
    const asc = placementLookup.get('asc')
    const parts = []
    if (sun) parts.push(`${toTitleCase(sun.sign)} ☀️`)
    if (moon) parts.push(`${toTitleCase(moon.sign)} 🌙`)
    if (asc) parts.push(`${toTitleCase(asc.sign)} Rising`)
    return parts.length ? parts.join(' · ') : 'Natal chart'
  })()

  const subtitleCopy = ''

  return {
    chart,
    size,
    scale,
    chartScale,
    center,
    rotation,
    signOuterRadius,
    signBandOuterRadius,
    signInnerRadius,
    innerRingRadius,
    houseLineRadius,
    houseLabelRadius,
    placementRadius,
    placementDegreeRadius,
    aspectRadius,
    titleX,
    titleTop,
    titleWidth,
    titleCopy,
    subtitleCopy,
    footerCopy: 'Made with ❤️ by Natal Chart App',
    stars,
    signSegments,
    signBoundaries,
    signGlyphs,
    houseLines,
    houseLabels,
    placementPoints,
    aspectLines
  }
}

export function drawChartGifFrame(ctx, scene, progress) {
  const flatten = easeOutCubic(clamp((progress - 0.18) / 0.66))
  const wheelAlpha = easeInOutCubic(clamp((progress - 0.2) / 0.55))

  ctx.save()
  ctx.imageSmoothingEnabled = true
  drawBackground(ctx, scene, progress, flatten)
  drawStarField(ctx, scene, progress)
  drawTitleBlock(ctx, scene, progress, flatten)
  drawShell(ctx, scene, progress, flatten)
  drawWheel(ctx, scene, progress, flatten)
  drawFooter(ctx, scene, progress, flatten)
  ctx.restore()

  return wheelAlpha
}
