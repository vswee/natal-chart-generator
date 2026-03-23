export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

export function buildMetrics(placements, aspects) {
  let emotionalIntensity = 35
  let harmony = 50
  let relationshipFocus = 30

  placements.forEach((placement) => {
    if (placement.body === 'moon') emotionalIntensity += 12
    if (placement.sign === 'scorpio' || placement.sign === 'cancer' || placement.sign === 'pisces') {
      emotionalIntensity += 8
    }
    if (placement.body === 'venus' || placement.house === 7) {
      relationshipFocus += 10
    }
    if (placement.body === 'asc' && placement.sign === 'taurus') {
      harmony += 6
    }
  })

  aspects.forEach((aspect) => {
    if (aspect.type === 'trine' || aspect.type === 'sextile') harmony += 7
    if (aspect.type === 'square' || aspect.type === 'opposition') harmony -= 8
    if (
      (aspect.bodyA === 'moon' || aspect.bodyB === 'moon') &&
      (aspect.type === 'square' || aspect.type === 'opposition' || aspect.type === 'conjunction')
    ) {
      emotionalIntensity += 10
    }
    if (
      aspect.bodyA === 'venus' ||
      aspect.bodyB === 'venus' ||
      aspect.bodyA === 'mars' ||
      aspect.bodyB === 'mars'
    ) {
      relationshipFocus += 5
    }
  })

  return {
    emotionalIntensity: clamp(emotionalIntensity),
    harmony: clamp(harmony),
    relationshipFocus: clamp(relationshipFocus)
  }
}

function addSignal(map, label, weight) {
  if (!label) return
  const current = map.get(label) || 0
  map.set(label, current + weight)
}

function summarizeFocus(key, score) {
  if (key === 'relationship') {
    if (score >= 70) return 'Partnership themes carry more weight than average.'
    if (score >= 55) return 'Relationship energy is present but shared with other priorities.'
    return 'Relationship focus is lighter, with attention pulled to other areas.'
  }

  if (key === 'work') {
    if (score >= 70) return 'Career and vocation themes are pronounced here.'
    if (score >= 55) return 'Work themes are steady without dominating the chart.'
    return 'Work focus is subtler, with emphasis elsewhere.'
  }

  if (score >= 70) return 'Life direction and self-definition feel strongly emphasised.'
  if (score >= 55) return 'Life direction is steady and balanced across themes.'
  return 'Life direction indicators are quieter and more distributed.'
}

function summarizeFocusLong(key, score) {
  if (key === 'relationship') {
    if (score >= 70) {
      return 'Partnership, attachment and close one-to-one dynamics are strongly emphasised. The chart is more likely to process key lessons through intimacy, trust, attraction and emotional exchange.'
    }
    if (score >= 55) {
      return 'Relationship themes are clearly present, though they share space with other priorities. Close bonds, mutual support and interpersonal balance matter, but they are not the only focus.'
    }
    return 'Relationship energy is present in a lighter way. Personal focus is more likely to fall on other areas before partnership becomes the main organising theme.'
  }

  if (key === 'work') {
    if (score >= 70) {
      return 'Career, responsibility and practical direction are strongly emphasised. The chart is more likely to channel effort into structure, output, reputation and long-term progress.'
    }
    if (score >= 55) {
      return 'Work themes are steady and clearly relevant without dominating the whole chart. Productivity, skill-building and purpose matter, alongside other concerns.'
    }
    return 'Work focus is present but less dominant. Motivation may be spread more evenly across personal, emotional or relational priorities.'
  }

  if (score >= 70) {
    return 'Life direction and self-definition are strongly emphasised. The chart places more weight on identity, personal path, meaning and the overall shape of one’s development.'
  }
  if (score >= 55) {
    return 'Life direction is present in a steady, balanced way. Personal growth, identity and longer-term meaning are relevant, without crowding out other themes.'
  }
  return 'Life direction is quieter and more distributed across the chart. Emphasis is more likely to be shared between circumstance, relationships and day-to-day concerns.'
}

export function buildFocusAreas(placements, aspects) {
  const areas = {
    relationship: {
      key: 'relationship',
      label: 'Relationship',
      score: 30,
      signals: new Map()
    },
    work: {
      key: 'work',
      label: 'Work',
      score: 30,
      signals: new Map()
    },
    life: {
      key: 'life',
      label: 'Life',
      score: 30,
      signals: new Map()
    }
  }

  const addScore = (areaKey, value, signalLabel, signalWeight = value) => {
    areas[areaKey].score += value
    addSignal(areas[areaKey].signals, signalLabel, signalWeight)
  }

  placements.forEach((placement) => {
    switch (placement.body) {
      case 'venus':
        addScore('relationship', 14, 'Venus emphasis')
        break
      case 'moon':
        addScore('relationship', 8, 'Moon involvement', 6)
        addScore('life', 6, 'Moon tone', 4)
        break
      case 'mars':
        addScore('relationship', 6, 'Mars drive', 4)
        addScore('work', 8, 'Mars drive', 6)
        break
      case 'saturn':
        addScore('work', 12, 'Saturn structure')
        break
      case 'mercury':
        addScore('work', 6, 'Mercury skills', 4)
        break
      case 'jupiter':
        addScore('life', 8, 'Jupiter growth')
        addScore('work', 5, 'Jupiter growth', 4)
        break
      case 'sun':
        addScore('life', 14, 'Sun purpose')
        break
      case 'asc':
        addScore('life', 10, 'Ascendant tone', 8)
        break
      case 'mc':
        addScore('work', 12, 'Midheaven focus')
        break
      default:
        break
    }

    if (placement.house === 7) {
      addScore('relationship', 12, '7th house focus')
    }
    if (placement.house === 5) {
      addScore('relationship', 8, '5th house focus')
    }
    if (placement.house === 10) {
      addScore('work', 12, '10th house focus')
    }
    if (placement.house === 6) {
      addScore('work', 8, '6th house focus')
    }
    if (placement.house === 2) {
      addScore('work', 6, '2nd house focus')
    }
    if (placement.house === 1) {
      addScore('life', 10, '1st house focus')
    }
    if (placement.house === 4) {
      addScore('life', 8, '4th house roots')
    }
    if (placement.house === 9) {
      addScore('life', 7, '9th house meaning')
    }
  })

  const aspectHits = {
    relationship: 0,
    work: 0,
    life: 0
  }

  aspects.forEach((aspect) => {
    const bodies = [aspect.bodyA, aspect.bodyB]
    if (bodies.some((body) => ['venus', 'moon', 'mars'].includes(body))) {
      aspectHits.relationship += 1
    }
    if (bodies.some((body) => ['saturn', 'mars', 'mercury'].includes(body))) {
      aspectHits.work += 1
    }
    if (bodies.some((body) => ['sun', 'asc', 'jupiter'].includes(body))) {
      aspectHits.life += 1
    }
  })

  const cappedAspectScore = (count) => Math.min(count, 4) * 2

  if (aspectHits.relationship) {
    addScore('relationship', cappedAspectScore(aspectHits.relationship), 'Relationship aspects', 6)
  }
  if (aspectHits.work) {
    addScore('work', cappedAspectScore(aspectHits.work), 'Work aspects', 6)
  }
  if (aspectHits.life) {
    addScore('life', cappedAspectScore(aspectHits.life), 'Life-direction aspects', 6)
  }

  return Object.values(areas).map((area) => {
    const score = clamp(Math.round(area.score))
    const markers = Array.from(area.signals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label)

    if (markers.length === 0) {
      markers.push('Balanced chart mix')
    }

    return {
      key: area.key,
      label: area.label,
      score,
      summary: summarizeFocus(area.key, score),
      summaryLong: summarizeFocusLong(area.key, score),
      markers
    }
  })
}
