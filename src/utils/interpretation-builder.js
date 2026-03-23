import { toTitleCase } from './zodiac'

const BODY_PROFILES = {
  sun: {
    label: 'Sun',
    themes: 'identity and vitality',
    focus: 'purpose, confidence, and direction'
  },
  moon: {
    label: 'Moon',
    themes: 'emotional needs and instincts',
    focus: 'inner security, mood, and care'
  },
  mercury: {
    label: 'Mercury',
    themes: 'thinking and communication',
    focus: 'learning, logic, and expression'
  },
  venus: {
    label: 'Venus',
    themes: 'affection and values',
    focus: 'attraction, taste, and harmony'
  },
  mars: {
    label: 'Mars',
    themes: 'drive and assertiveness',
    focus: 'action, desire, and momentum'
  },
  jupiter: {
    label: 'Jupiter',
    themes: 'growth and belief',
    focus: 'optimism, expansion, and meaning'
  },
  saturn: {
    label: 'Saturn',
    themes: 'structure and discipline',
    focus: 'responsibility, boundaries, and endurance'
  },
  uranus: {
    label: 'Uranus',
    themes: 'change and originality',
    focus: 'freedom, disruption, and innovation'
  },
  neptune: {
    label: 'Neptune',
    themes: 'imagination and ideals',
    focus: 'dreams, sensitivity, and faith'
  },
  pluto: {
    label: 'Pluto',
    themes: 'power and transformation',
    focus: 'depth, intensity, and renewal'
  },
  asc: {
    label: 'Ascendant',
    themes: 'first impressions and approach',
    focus: 'how you meet the world and move through it'
  },
  mc: {
    label: 'Midheaven',
    themes: 'career direction and public role',
    focus: 'reputation, ambition, and long-term path'
  }
}

const SIGN_PROFILES = {
  aries: { adjectives: 'bold, direct, initiating', focus: 'action, independence, and momentum' },
  taurus: { adjectives: 'steady, sensual, grounded', focus: 'stability, comfort, and tangible results' },
  gemini: { adjectives: 'curious, quick, adaptable', focus: 'ideas, conversation, and flexibility' },
  cancer: { adjectives: 'protective, intuitive, nurturing', focus: 'emotional security and belonging' },
  leo: { adjectives: 'expressive, warm, confident', focus: 'creativity, visibility, and pride' },
  virgo: { adjectives: 'precise, practical, discerning', focus: 'craft, improvement, and service' },
  libra: { adjectives: 'harmonizing, fair, relational', focus: 'balance, beauty, and cooperation' },
  scorpio: { adjectives: 'intense, private, transformative', focus: 'depth, loyalty, and emotional truth' },
  sagittarius: { adjectives: 'expansive, candid, adventurous', focus: 'growth, travel, and meaning' },
  capricorn: { adjectives: 'disciplined, strategic, grounded', focus: 'structure, goals, and responsibility' },
  aquarius: { adjectives: 'innovative, independent, future-minded', focus: 'originality, community, and ideas' },
  pisces: { adjectives: 'sensitive, imaginative, receptive', focus: 'compassion, intuition, and flow' }
}

const ASPECT_PROFILES = {
  conjunction: {
    label: 'conjunct',
    tone: 'merges and intensifies',
    detail: 'blending two drives into one focal point'
  },
  sextile: {
    label: 'sextile',
    tone: 'supports and cooperates',
    detail: 'creating openings that reward initiative'
  },
  square: {
    label: 'square',
    tone: 'pressures and challenges',
    detail: 'pushing growth through friction and effort'
  },
  trine: {
    label: 'trine',
    tone: 'flows and reinforces',
    detail: 'making strengths feel natural and accessible'
  },
  opposition: {
    label: 'oppose',
    tone: 'polarizes and balances',
    detail: 'asking for perspective and integration'
  }
}

export function summarizeInterpretation(text, maxLength = 140) {
  if (!text) return ''
  const trimmed = text.trim()
  const match = trimmed.match(/^[^.!?]+[.!?]/)
  const sentence = match ? match[0] : trimmed
  if (sentence.length <= maxLength) return sentence
  return `${sentence.slice(0, maxLength).trim()}...`
}

function bodyProfile(body) {
  return BODY_PROFILES[body] || {
    label: toTitleCase(body),
    themes: 'core themes',
    focus: 'expression and priorities'
  }
}

function signProfile(sign) {
  return SIGN_PROFILES[sign] || {
    adjectives: 'distinctive',
    focus: 'expression and tone'
  }
}

export function buildGenericPlacementInterpretation(placement) {
  const body = bodyProfile(placement.body)
  const sign = signProfile(placement.sign)
  const signLabel = toTitleCase(placement.sign)
  const title = `${body.label} in ${signLabel}`
  const summary = `${body.label} in ${signLabel} emphasizes ${sign.adjectives} energy in ${body.themes}.`
  const text = `${summary} It often shows up through ${sign.focus}, shaping ${body.focus}.`
  return { title, summary, text }
}

export function buildGenericAspectInterpretation(aspect) {
  const bodyA = bodyProfile(aspect.bodyA)
  const bodyB = bodyProfile(aspect.bodyB)
  const aspectProfile = ASPECT_PROFILES[aspect.type] || {
    label: aspect.type,
    tone: 'connects',
    detail: 'linking two parts of the chart together'
  }
  const title = `${bodyA.label} ${aspectProfile.label} ${bodyB.label}`
  const summary = `${title} links ${bodyA.themes} with ${bodyB.themes} in a way that ${aspectProfile.tone}.`
  const text = `${summary} This aspect can highlight ${aspectProfile.detail} between ${bodyA.focus} and ${bodyB.focus}.`
  return { title, summary, text }
}
