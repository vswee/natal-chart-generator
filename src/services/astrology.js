import SwissEph from 'swisseph-wasm'
import tzLookup from 'tz-lookup'
import { buildAspects } from '../utils/aspects'
import { buildAspectPatterns } from '../utils/aspect-patterns'
import { buildDignityReport, buildDispositorReport, getChartRuler } from '../utils/dignities'
import { getDegreeInSign, getSignFromLongitude, normaliseDegrees } from '../utils/zodiac'
import { buildFocusAreas, buildMetrics } from '../utils/scoring'
import {
  buildGenericAspectInterpretation,
  buildGenericPlacementInterpretation,
  summarizeInterpretation
} from '../utils/interpretation-builder'
import {
  placementInterpretations,
  aspectInterpretations,
  summaryInterpretations
} from '../data/interpretations'

const HOUSE_SYSTEMS = {
  placidus: 'P',
  koch: 'K',
  'whole-sign': 'W'
}

const BODY_DEFS = [
  { body: 'sun', key: 'SE_SUN' },
  { body: 'moon', key: 'SE_MOON' },
  { body: 'mercury', key: 'SE_MERCURY' },
  { body: 'venus', key: 'SE_VENUS' },
  { body: 'mars', key: 'SE_MARS' },
  { body: 'jupiter', key: 'SE_JUPITER' },
  { body: 'saturn', key: 'SE_SATURN' },
  { body: 'uranus', key: 'SE_URANUS' },
  { body: 'neptune', key: 'SE_NEPTUNE' },
  { body: 'pluto', key: 'SE_PLUTO' }
]

const EXTRA_BODY_DEFS = [
  { body: 'northNode', key: 'SE_MEAN_NODE', label: 'North Node' },
  { body: 'chiron', key: 'SE_CHIRON', label: 'Chiron' },
  { body: 'lilith', key: 'SE_MEAN_APOG', label: 'Lilith' },
  { body: 'ceres', key: 'SE_CERES', label: 'Ceres' },
  { body: 'pallas', key: 'SE_PALLAS', label: 'Pallas' },
  { body: 'juno', key: 'SE_JUNO', label: 'Juno' },
  { body: 'vesta', key: 'SE_VESTA', label: 'Vesta' }
]

let swePromise

async function getSwissEph() {
  if (!swePromise) {
    swePromise = (async () => {
      const swe = new SwissEph()
      await swe.initSwissEph()
      return swe
    })()
  }
  return swePromise
}

function parseDateTimeInput(date, time) {
  if (!date || !time) {
    throw new Error('Please enter a birth date and exact time.')
  }

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute, second = '0'] = time.split(':')

  return {
    year,
    month,
    day,
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second)
  }
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const parts = formatter.formatToParts(date)
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )

  const utcTime = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  )

  return (utcTime - date.getTime()) / 60000
}

function zonedTimeToUtc(components, timeZone) {
  const utcGuess = Date.UTC(
    components.year,
    components.month - 1,
    components.day,
    components.hour,
    components.minute,
    components.second
  )

  let offset = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone)
  let adjusted = utcGuess - offset * 60 * 1000
  const nextOffset = getTimeZoneOffsetMinutes(new Date(adjusted), timeZone)

  if (nextOffset !== offset) {
    adjusted = utcGuess - nextOffset * 60 * 1000
    offset = nextOffset
  }

  return {
    date: new Date(adjusted),
    offsetMinutes: offset
  }
}

function resolveTimeZone(lat, lon) {
  try {
    return tzLookup(lat, lon)
  } catch (error) {
    throw new Error('Unable to resolve a time zone for this location.')
  }
}

function assertTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
  } catch (error) {
    throw new Error('Invalid time zone. Use an IANA name like America/New_York.')
  }
}

function resolveTimeZoneWithOverride(lat, lon, override) {
  if (override && override.trim()) {
    const cleaned = override.trim()
    assertTimeZone(cleaned)
    return cleaned
  }
  return resolveTimeZone(lat, lon)
}

function resolveTimeZoneFromMeta(meta) {
  if (meta?.timeZoneOverride) {
    return resolveTimeZoneWithOverride(meta.lat, meta.lon, meta.timeZoneOverride)
  }
  if (meta?.timeZone) {
    assertTimeZone(meta.timeZone)
    return meta.timeZone
  }
  return resolveTimeZone(meta.lat, meta.lon)
}

function getUtcDateFromMeta(meta) {
  if (!meta) {
    throw new Error('Chart metadata is required to resolve UTC time.')
  }
  const components = parseDateTimeInput(meta.date, meta.time)
  const timeZone = resolveTimeZoneFromMeta(meta)
  const { date: utcDate } = zonedTimeToUtc(components, timeZone)
  return utcDate
}

function midpointLongitude(a, b) {
  const radA = (a * Math.PI) / 180
  const radB = (b * Math.PI) / 180
  const x = Math.cos(radA) + Math.cos(radB)
  const y = Math.sin(radA) + Math.sin(radB)
  if (Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6) {
    return normaliseDegrees(a + 90)
  }
  const angle = (Math.atan2(y, x) * 180) / Math.PI
  return normaliseDegrees(angle)
}

function buildNatalHouseCusps(swe, meta) {
  if (!meta) {
    throw new Error('Natal metadata is required to compute house cusps.')
  }
  const components = parseDateTimeInput(meta.date, meta.time)
  const timeZone = resolveTimeZoneFromMeta(meta)
  const { date: utcDate } = zonedTimeToUtc(components, timeZone)

  const jd = swe.julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600
  )

  const systemCode = HOUSE_SYSTEMS[meta.houseSystem] || HOUSE_SYSTEMS.placidus
  const { cusps } = swe.houses(jd, meta.lat, meta.lon, systemCode)
  return normaliseCusps(cusps)
}

function buildPlacement({ body, longitude, house, retrograde }) {
  const normalised = normaliseDegrees(longitude)

  return {
    body,
    longitude: normalised,
    sign: getSignFromLongitude(normalised),
    degreeInSign: Number(getDegreeInSign(normalised).toFixed(2)),
    house,
    retrograde
  }
}

function buildExtraPoints({ swe, jd, cusps, ascLongitude, sunPlacement, moonPlacement }) {
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED
  const extra = EXTRA_BODY_DEFS.map((def) => {
    const result = swe.calc_ut(jd, swe[def.key], flags)
    const longitude = result[0]
    const retrograde = result[3] < 0
    const house = cusps.length >= 13 ? houseFromCusps(longitude, cusps) : null
    return {
      ...buildPlacement({ body: def.body, longitude, house, retrograde }),
      label: def.label
    }
  })

  const northNode = extra.find((item) => item.body === 'northNode')
  if (northNode) {
    const southLongitude = normaliseDegrees(northNode.longitude + 180)
    const southHouse = cusps.length >= 13 ? houseFromCusps(southLongitude, cusps) : null
    extra.push({
      ...buildPlacement({ body: 'southNode', longitude: southLongitude, house: southHouse, retrograde: northNode.retrograde }),
      label: 'South Node'
    })
  }

  if (ascLongitude !== null && sunPlacement && moonPlacement) {
    const isDayChart = sunPlacement.house ? sunPlacement.house >= 7 : false
    const fortuneLongitude = normaliseDegrees(
      isDayChart
        ? ascLongitude + moonPlacement.longitude - sunPlacement.longitude
        : ascLongitude + sunPlacement.longitude - moonPlacement.longitude
    )
    const fortuneHouse = cusps.length >= 13 ? houseFromCusps(fortuneLongitude, cusps) : null
    extra.push({
      ...buildPlacement({ body: 'partOfFortune', longitude: fortuneLongitude, house: fortuneHouse, retrograde: false }),
      label: 'Part of Fortune'
    })
  }

  return extra
}

function normaliseCusps(cusps) {
  return cusps.map((cusp, index) => (index === 0 ? cusp : normaliseDegrees(cusp)))
}

function houseFromCusps(longitude, cusps) {
  const position = normaliseDegrees(longitude)

  for (let house = 1; house <= 12; house += 1) {
    const start = cusps[house]
    const end = cusps[house === 12 ? 1 : house + 1]
    const span = normaliseDegrees(end - start)
    const offset = normaliseDegrees(position - start)

    if (span === 0 || offset < span) {
      return house
    }
  }

  return 1
}

function normalizeInterpretation(payload) {
  if (!payload) return null
  const summary = payload.summary || summarizeInterpretation(payload.text)
  const text = payload.text || payload.summary || ''
  return {
    title: payload.title,
    summary,
    text
  }
}

function buildInterpretationBlocks(placements, aspects, metrics) {
  const blocks = []
  const placementPriority = [
    'sun',
    'moon',
    'asc',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'mc'
  ]

  const placementByBody = new Map(placements.map((placement) => [placement.body, placement]))

  placementPriority.forEach((body) => {
    const placement = placementByBody.get(body)
    if (!placement) return
    const key = `${placement.body}:${placement.sign}`
    const match = placementInterpretations[key]
    const base = match
      ? normalizeInterpretation(match)
      : buildGenericPlacementInterpretation(placement)

    if (base) {
      blocks.push({
        id: key,
        title: base.title,
        summary: base.summary,
        text: base.text
      })
    }
  })

  const aspectBlocks = [...aspects]
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 5)
    .map((aspect) => {
      const key = `${aspect.bodyA}:${aspect.type}:${aspect.bodyB}`
      const reverseKey = `${aspect.bodyB}:${aspect.type}:${aspect.bodyA}`
      const match = aspectInterpretations[key] || aspectInterpretations[reverseKey]
      const base = match
        ? normalizeInterpretation(match)
        : buildGenericAspectInterpretation(aspect)

      if (!base) return null
      return {
        id: key,
        title: base.title,
        summary: base.summary,
        text: base.text
      }
    })
    .filter(Boolean)

  blocks.push(...aspectBlocks)

  if (metrics.emotionalIntensity >= 65) {
    const text = summaryInterpretations.highEmotionalIntensity
    blocks.push({
      id: 'summary-emotional-intensity',
      title: 'Emotional intensity',
      summary: summarizeInterpretation(text),
      text
    })
  }

  if (metrics.harmony >= 60) {
    const text = summaryInterpretations.highHarmony
    blocks.push({
      id: 'summary-harmony',
      title: 'Internal flow',
      summary: summarizeInterpretation(text),
      text
    })
  }

  if (metrics.relationshipFocus >= 55) {
    const text = summaryInterpretations.highRelationshipFocus
    blocks.push({
      id: 'summary-relationship',
      title: 'Relationship focus',
      summary: summarizeInterpretation(text),
      text
    })
  }

  return blocks.slice(0, 14)
}

export async function calculateNatalChart({ date, time, address, lat, lon, houseSystem, timeZoneOverride }) {
  if (lat === undefined || lon === undefined) {
    throw new Error('Latitude and longitude are required to calculate a chart.')
  }

  const swe = await getSwissEph()
  const components = parseDateTimeInput(date, time)
  const timeZone = resolveTimeZoneWithOverride(lat, lon, timeZoneOverride)
  const { date: utcDate, offsetMinutes } = zonedTimeToUtc(components, timeZone)

  const jd = swe.julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600
  )

  const systemCode = HOUSE_SYSTEMS[houseSystem] || HOUSE_SYSTEMS.placidus
  const { cusps, ascmc } = swe.houses(jd, lat, lon, systemCode)
  const normalisedCusps = normaliseCusps(cusps)

  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED
  const placements = BODY_DEFS.map(({ body, key }) => {
    const result = swe.calc_ut(jd, swe[key], flags)
    const longitude = result[0]
    const retrograde = result[3] < 0

    return buildPlacement({
      body,
      longitude,
      house: houseFromCusps(longitude, normalisedCusps),
      retrograde
    })
  })

  const ascLongitude = normaliseDegrees(ascmc[swe.SE_ASC])
  const mcLongitude = normaliseDegrees(ascmc[swe.SE_MC])

  placements.push(
    buildPlacement({
      body: 'asc',
      longitude: ascLongitude,
      house: null,
      retrograde: false
    }),
    buildPlacement({
      body: 'mc',
      longitude: mcLongitude,
      house: null,
      retrograde: false
    })
  )

  const sunPlacement = placements.find((placement) => placement.body === 'sun')
  const moonPlacement = placements.find((placement) => placement.body === 'moon')
  const extraPoints = buildExtraPoints({
    swe,
    jd,
    cusps: normalisedCusps,
    ascLongitude,
    sunPlacement,
    moonPlacement
  })

  const aspects = buildAspects(placements.filter((item) => item.body !== 'mc'))
  const metrics = buildMetrics(placements, aspects)
  const focusAreas = buildFocusAreas(placements, aspects)
  const interpretations = buildInterpretationBlocks(placements, aspects, metrics)
  const dignities = buildDignityReport(placements)
  const dispositors = buildDispositorReport(placements)
  const chartRuler = getChartRuler(placements)
  const aspectPatterns = buildAspectPatterns(placements)

  return {
    meta: {
      date,
      time,
      address,
      lat,
      lon,
      timeZone,
      utcOffsetMinutes: offsetMinutes,
      houseSystem: houseSystem || 'placidus',
      timeZoneOverride: timeZoneOverride ? timeZoneOverride.trim() : ''
    },
    houseCusps: normalisedCusps,
    placements,
    extraPoints,
    aspects,
    metrics,
    focusAreas,
    dignities,
    dispositors,
    chartRuler,
    aspectPatterns,
    interpretations
  }
}

function lunarPhaseName(angle) {
  if (angle < 22.5 || angle >= 337.5) return 'New Moon'
  if (angle < 67.5) return 'Waxing Crescent'
  if (angle < 112.5) return 'First Quarter'
  if (angle < 157.5) return 'Waxing Gibbous'
  if (angle < 202.5) return 'Full Moon'
  if (angle < 247.5) return 'Waning Gibbous'
  if (angle < 292.5) return 'Last Quarter'
  return 'Waning Crescent'
}

export async function calculateCurrentTransits(natalChart) {
  if (!natalChart) {
    throw new Error('Natal chart data is required to calculate current transits.')
  }

  const swe = await getSwissEph()
  const now = new Date()
  const jd = swe.julday(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600
  )

  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED
  let rawCusps = Array.isArray(natalChart.houseCusps) ? natalChart.houseCusps : []
  if (rawCusps.length < 12) {
    try {
      rawCusps = buildNatalHouseCusps(swe, natalChart.meta)
    } catch (error) {
      console.warn(error)
      rawCusps = []
    }
  }
  const cusps = rawCusps.length === 12 ? [null, ...rawCusps] : rawCusps

  const placements = BODY_DEFS.map(({ body, key }) => {
    const result = swe.calc_ut(jd, swe[key], flags)
    const longitude = result[0]
    const retrograde = result[3] < 0
    const house = cusps.length >= 13 ? houseFromCusps(longitude, cusps) : null

    return buildPlacement({
      body,
      longitude,
      house,
      retrograde
    })
  })

  const sun = placements.find((placement) => placement.body === 'sun')
  const moon = placements.find((placement) => placement.body === 'moon')
  const phaseAngle = sun && moon ? normaliseDegrees(moon.longitude - sun.longitude) : 0
  const illumination = Math.round(((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100)

  return {
    generatedAt: now.toISOString(),
    placements,
    moon: moon
      ? {
          sign: moon.sign,
          phaseAngle,
          phaseName: lunarPhaseName(phaseAngle),
          illumination
        }
      : null,
    retrogrades: placements.filter((placement) => placement.retrograde)
  }
}

export async function calculateCompositeChart(chartA, chartB) {
  if (!chartA || !chartB) {
    throw new Error('Both charts are required to calculate a composite chart.')
  }

  const swe = await getSwissEph()
  const utcA = getUtcDateFromMeta(chartA.meta)
  const utcB = getUtcDateFromMeta(chartB.meta)
  const midDate = new Date((utcA.getTime() + utcB.getTime()) / 2)

  const jd = swe.julday(
    midDate.getUTCFullYear(),
    midDate.getUTCMonth() + 1,
    midDate.getUTCDate(),
    midDate.getUTCHours() + midDate.getUTCMinutes() / 60 + midDate.getUTCSeconds() / 3600
  )

  const avgLat = (chartA.meta.lat + chartB.meta.lat) / 2
  const avgLon = (chartA.meta.lon + chartB.meta.lon) / 2
  const systemCode = HOUSE_SYSTEMS[chartA.meta.houseSystem] || HOUSE_SYSTEMS.placidus
  const { cusps } = swe.houses(jd, avgLat, avgLon, systemCode)
  const normalisedCusps = normaliseCusps(cusps)

  const mapA = new Map(chartA.placements.map((placement) => [placement.body, placement]))
  const mapB = new Map(chartB.placements.map((placement) => [placement.body, placement]))
  const compositeBodies = [...BODY_DEFS.map((def) => def.body), 'asc', 'mc']

  const placements = compositeBodies
    .map((body) => {
      const first = mapA.get(body)
      const second = mapB.get(body)
      if (!first || !second) return null
      const longitude = midpointLongitude(first.longitude, second.longitude)
      const house = normalisedCusps.length >= 13 ? houseFromCusps(longitude, normalisedCusps) : null
      return buildPlacement({
        body,
        longitude,
        house,
        retrograde: false
      })
    })
    .filter(Boolean)

  const aspects = buildAspects(placements.filter((item) => item.body !== 'mc'))

  return {
    meta: {
      date: midDate.toISOString().slice(0, 10),
      time: midDate.toISOString().slice(11, 16),
      lat: avgLat,
      lon: avgLon,
      houseSystem: chartA.meta.houseSystem
    },
    houseCusps: normalisedCusps,
    placements,
    aspects
  }
}
