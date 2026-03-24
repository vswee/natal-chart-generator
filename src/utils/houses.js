export const HOUSE_MEANINGS = {
  1: {
    title: '1st House: Self and Identity',
    name: 'Self and Identity',
    icon: 'person',
    body:
      'Focuses on appearance, identity, personal style, and how you initiate new experiences.'
  },
  2: {
    title: '2nd House: Money and Values',
    name: 'Money and Values',
    icon: 'savings',
    body:
      'Covers income, possessions, personal resources, and what you value or prioritize.'
  },
  3: {
    title: '3rd House: Communication',
    name: 'Communication',
    icon: 'chat_bubble',
    body:
      'Highlights learning, communication style, siblings, short trips, and daily curiosity.'
  },
  4: {
    title: '4th House: Home and Roots',
    name: 'Home and Roots',
    icon: 'home',
    body:
      'Relates to home life, family, ancestry, inner security, and foundations.'
  },
  5: {
    title: '5th House: Creativity and Romance',
    name: 'Creativity and Romance',
    icon: 'favorite',
    body:
      'Touches on creativity, joy, self-expression, romance, and children.'
  },
  6: {
    title: '6th House: Health and Routines',
    name: 'Health and Routines',
    icon: 'health_and_safety',
    body:
      'Covers wellbeing, habits, daily work, service, and practical maintenance.'
  },
  7: {
    title: '7th House: Partnerships',
    name: 'Partnerships',
    icon: 'handshake',
    body:
      'Represents committed relationships, collaboration, and one-to-one dynamics.'
  },
  8: {
    title: '8th House: Intimacy and Sharing',
    name: 'Intimacy and Sharing',
    icon: 'link',
    body:
      'Concerns shared resources, intimacy, transformation, and deep emotional ties.'
  },
  9: {
    title: '9th House: Beliefs and Expansion',
    name: 'Beliefs and Expansion',
    icon: 'public',
    body:
      'Relates to higher learning, travel, philosophy, and worldview.'
  },
  10: {
    title: '10th House: Career and Public Life',
    name: 'Career and Public Life',
    icon: 'work',
    body:
      'Covers vocation, ambition, reputation, and how you are seen publicly.'
  },
  11: {
    title: '11th House: Community and Friends',
    name: 'Community and Friends',
    icon: 'groups',
    body:
      'Highlights friendships, networks, long-term goals, and social causes.'
  },
  12: {
    title: '12th House: Inner World and Closure',
    name: 'Inner World and Closure',
    icon: 'self_improvement',
    body:
      'Relates to rest, reflection, subconscious patterns, and endings or healing.'
  }
}

export function getHouseMeaning(house) {
  return HOUSE_MEANINGS[Number(house)] || null
}

export function getHouseOrdinal(house) {
  const number = Number(house)
  if (!Number.isFinite(number)) {
    return { number: house, suffix: '' }
  }

  const mod100 = number % 100
  const mod10 = number % 10
  let suffix = 'th'

  if (mod100 < 11 || mod100 > 13) {
    if (mod10 === 1) suffix = 'st'
    else if (mod10 === 2) suffix = 'nd'
    else if (mod10 === 3) suffix = 'rd'
  }

  return { number, suffix }
}

export function formatHouseTitle(house) {
  const meaning = getHouseMeaning(house)
  const ordinal = getHouseOrdinal(house)
  const prefix = `${ordinal.number}${ordinal.suffix} House`
  if (!meaning) return prefix
  const name = meaning.name || meaning.title
  return name ? `${prefix}: ${name}` : prefix
}
