/**
 * @module reverse-compatibility
 * Handles the search for theoretically compatible partner birth data based on defined profiles.
 */

import { calculateNatalChart, calculateCompositeChart } from './astrology'
import { buildRelationshipReport } from '../utils/relationship'
import { getCompatibilityTargetProfile } from '../utils/compatibility-targets'

const MAX_CANDIDATES = 10000
const DEFAULT_TIME_STEP_MINUTES = 360
const DEFAULT_MAX_RESULTS = 20
const DEFAULT_TARGET_PROFILE_KEY = 'balancedMatch'
const DEFAULT_MIN_AGE_YEARS = 18

function clampTimeStepMinutes(value) {
  const numeric = Number(value || DEFAULT_TIME_STEP_MINUTES)
  if (!Number.isFinite(numeric)) return DEFAULT_TIME_STEP_MINUTES
  return Math.max(60, Math.round(numeric))
}

function normaliseDateInput(value, fallbackTime) {
  if (!value) return null
  if (value instanceof Date) return value
  return new Date(`${value}T${fallbackTime}`)
}

function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLatestBirthDateForMinimumAge(minAgeYears, referenceDate = new Date()) {
  const latest = new Date(referenceDate)
  latest.setHours(0, 0, 0, 0)
  latest.setFullYear(latest.getFullYear() - minAgeYears)
  return formatDateInput(latest)
}

function clampSearchEndDateForAge(endDate, minAgeYears, referenceDate) {
  if (!minAgeYears) return endDate
  const latestBirthDate = getLatestBirthDateForMinimumAge(minAgeYears, referenceDate)
  return String(endDate) < latestBirthDate ? endDate : latestBirthDate
}

function buildCandidateDateTimes(startDate, endDate, timeStepMinutes) {
  const start = normaliseDateInput(startDate, '00:00:00')
  const end = normaliseDateInput(endDate, '23:59:59')

  if (!start || Number.isNaN(start.getTime())) {
    throw new Error('A valid start date is required for ideal match generation.')
  }

  if (!end || Number.isNaN(end.getTime())) {
    throw new Error('A valid end date is required for ideal match generation.')
  }

  if (end.getTime() < start.getTime()) {
    throw new Error('The ideal match search end date must be after the start date.')
  }

  const stepMs = timeStepMinutes * 60 * 1000
  const candidates = []

  for (let time = start.getTime(); time <= end.getTime(); time += stepMs) {
    const date = new Date(time)

    candidates.push({
      date: date.toISOString().slice(0, 10),
      time: date.toISOString().slice(11, 16)
    })
  }

  return candidates
}

function scoreRelationshipAgainstProfile(report, profile) {
  if (!report?.categories?.length) return 0

  const categoryMap = new Map(
    report.categories.map((category) => [category.key, category])
  )

  let score = 0
  let totalWeight = 0

  Object.entries(profile.weights || {}).forEach(([key, weight]) => {
    const category = categoryMap.get(key)
    if (!category) return

    score += category.score * weight
    totalWeight += weight
  })

  if (!totalWeight) return 0
  return Math.round(score / totalWeight)
}

function buildCandidateSummary(report) {
  const categories = Array.isArray(report?.categories) ? report.categories : []
  const highlights = []
  const cautions = []

  categories
    .filter((category) => category.score >= 70)
    .sort((a, b) => b.score - a.score)
    .forEach((category) => {
      if (category.summary) highlights.push(category.summary)

      if (Array.isArray(category.highlights)) {
        highlights.push(...category.highlights.slice(0, 2))
      }
    })

  categories
    .filter((category) => category.score < 55)
    .sort((a, b) => a.score - b.score)
    .forEach((category) => {
      if (category.summary) cautions.push(category.summary)
    })

  return {
    highlights: [...new Set(highlights)].slice(0, 5),
    cautions: [...new Set(cautions)].slice(0, 3)
  }
}

function buildResultId(candidate, index) {
  return `ideal-partner-${candidate.date}-${candidate.time}-${index}`
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
}

function normaliseCoordinateKey(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value || '').trim()
  return numeric.toFixed(6)
}

export function buildIdealMatchCandidateKey(candidate = {}, context = {}) {
  const meta = candidate.meta || {}
  const location = context.candidateLocation || context.location || {}
  const date = candidate.date || meta.date || ''
  const time = candidate.time || meta.time || ''
  const lat = candidate.lat ?? meta.lat ?? location.lat ?? ''
  const lon = candidate.lon ?? meta.lon ?? location.lon ?? ''
  const houseSystem = candidate.houseSystem || meta.houseSystem || context.houseSystem || location.houseSystem || ''
  const timeZoneOverride = candidate.timeZoneOverride || meta.timeZoneOverride || context.timeZoneOverride || location.timeZoneOverride || ''

  return [
    date,
    time,
    normaliseCoordinateKey(lat),
    normaliseCoordinateKey(lon),
    houseSystem,
    timeZoneOverride
  ]
    .map((part) => String(part).trim().toLowerCase())
    .join('|')
}

function buildExcludedCandidateKeySet(options) {
  const keys = new Set(options.excludeCandidateKeys || [])

  ;(options.excludeCandidates || []).forEach((candidate) => {
    const key = buildIdealMatchCandidateKey(candidate, {
      candidateLocation: options.candidateLocation,
      houseSystem: candidate?.houseSystem,
      timeZoneOverride: candidate?.timeZoneOverride
    })
    if (key) keys.add(key)
  })

  return keys
}

function assertSearchOptions({ baseChart, startDate, endDate, candidateLocation }) {
  if (!baseChart) {
    throw new Error('A base natal chart is required to generate an ideal match.')
  }

  if (!startDate || !endDate) {
    throw new Error('A start date and end date are required for ideal match generation.')
  }

  if (
    !candidateLocation ||
    candidateLocation.lat === undefined ||
    candidateLocation.lon === undefined
  ) {
    throw new Error('A candidate birth location with latitude and longitude is required.')
  }
}

export async function searchCompatiblePartnerBirthData(options = {}) {
  const {
    baseChart,
    startDate,
    endDate,
    candidateLocation,
    includeCompositeCharts = false,
    onProgress
  } = options

  assertSearchOptions({
    baseChart,
    startDate,
    endDate,
    candidateLocation
  })

  const timeStepMinutes = clampTimeStepMinutes(options.timeStepMinutes)
  const maxResults = Math.max(1, Number(options.maxResults || DEFAULT_MAX_RESULTS))
  const targetProfile = getCompatibilityTargetProfile(
    options.targetProfileKey || DEFAULT_TARGET_PROFILE_KEY
  )
  const minAgeYears = Math.max(0, Number(options.minAgeYears ?? DEFAULT_MIN_AGE_YEARS))
  const effectiveEndDate = clampSearchEndDateForAge(endDate, minAgeYears, options.referenceDate)
  const candidates = buildCandidateDateTimes(startDate, effectiveEndDate, timeStepMinutes)
  const excludedCandidateKeys = buildExcludedCandidateKeySet({
    ...options,
    candidateLocation
  })

  if (candidates.length > MAX_CANDIDATES) {
    throw new Error(
      'This ideal match search is too broad. Please use a shorter date range or a larger time step.'
    )
  }

  const scoredResults = []

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    const candidateAddress = candidateLocation.address || 'Theoretical match location'
    const houseSystem = candidateLocation.houseSystem || baseChart.meta?.houseSystem || 'placidus'
    const candidateKey = buildIdealMatchCandidateKey(candidate, {
      candidateLocation,
      houseSystem,
      timeZoneOverride: candidateLocation.timeZoneOverride || ''
    })

    if (excludedCandidateKeys.has(candidateKey)) {
      if (
        typeof onProgress === 'function' &&
        (index === candidates.length - 1 || index % 50 === 0)
      ) {
        onProgress({
          completed: index + 1,
          total: candidates.length,
          percent: Math.round(((index + 1) / candidates.length) * 100)
        })
      }
      continue
    }

    const chart = await calculateNatalChart({
      date: candidate.date,
      time: candidate.time,
      address: candidateAddress,
      lat: candidateLocation.lat,
      lon: candidateLocation.lon,
      houseSystem,
      timeZoneOverride: candidateLocation.timeZoneOverride || ''
    })

    const report = buildRelationshipReport(baseChart, chart, {
      labelA: baseChart.meta?.label || 'You',
      labelB: 'Ideal Match'
    })

    const score = scoreRelationshipAgainstProfile(report, targetProfile)
    const summary = buildCandidateSummary(report)

    scoredResults.push({
      id: buildResultId(candidate, index),
      score,
      candidate: {
        key: candidateKey,
        date: candidate.date,
        time: candidate.time,
        address: candidateAddress,
        lat: candidateLocation.lat,
        lon: candidateLocation.lon,
        houseSystem,
        timeZone: chart.meta?.timeZone || null
      },
      categories: report?.categories || [],
      relationshipReport: report,
      highlights: summary.highlights.length
        ? summary.highlights
        : ['No single category dominates, but the overall pattern is balanced.'],
      cautions: summary.cautions,
      chart
    })

    if (
      typeof onProgress === 'function' &&
      (index === candidates.length - 1 || index % 50 === 0)
    ) {
      onProgress({
        completed: index + 1,
        total: candidates.length,
        percent: Math.round(((index + 1) / candidates.length) * 100)
      })
    }
  }

  const results = scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  if (includeCompositeCharts) {
    for (const result of results) {
      result.compositeChart = await calculateCompositeChart(baseChart, result.chart)
    }
  }

  return {
    targetProfile: {
      key: targetProfile.key,
      label: targetProfile.label,
      description: targetProfile.description
    },
    searched: {
      startDate,
      endDate: effectiveEndDate,
      timeStepMinutes,
      candidateCount: candidates.length,
      excludedCandidateCount: excludedCandidateKeys.size,
      minAgeYears,
      location: candidateLocation
    },
    results
  }
}

export async function searchCompatiblePartnerBirthDataCoarseToFine() {
  throw new Error('Coarse-to-fine ideal match search is not implemented yet.')
}
