/**
 * @module compatibility-targets
 * Defines preset target profiles used for calculating compatible partner theoretical charts.
 */

export const COMPATIBILITY_TARGET_PROFILES = {
  romanticChemistry: {
    key: 'romanticChemistry',
    label: 'Romantic Chemistry',
    description: 'Prioritises attraction, romantic warmth and emotional pull.',
    weights: {
      sex: 0.3,
      romance: 0.35,
      friendship: 0.15,
      compatibility: 0.2
    }
  },

  emotionalSafety: {
    key: 'emotionalSafety',
    label: 'Emotional Safety',
    description: 'Prioritises steadiness, emotional ease and lower volatility.',
    weights: {
      sex: 0.1,
      romance: 0.25,
      friendship: 0.3,
      compatibility: 0.35
    }
  },

  longTermPartner: {
    key: 'longTermPartner',
    label: 'Long-Term Partner',
    description: 'Prioritises overall compatibility, friendship and romantic steadiness.',
    weights: {
      sex: 0.15,
      romance: 0.25,
      friendship: 0.25,
      compatibility: 0.35
    }
  },

  highIntensity: {
    key: 'highIntensity',
    label: 'High Intensity',
    description: 'Prioritises chemistry, magnetism and a stronger emotional charge.',
    weights: {
      sex: 0.45,
      romance: 0.25,
      friendship: 0.05,
      compatibility: 0.25
    }
  },

  balancedMatch: {
    key: 'balancedMatch',
    label: 'Balanced Match',
    description: 'Weights all relationship categories evenly.',
    weights: {
      sex: 0.25,
      romance: 0.25,
      friendship: 0.25,
      compatibility: 0.25
    }
  }
}
/**
 * Retrieves a compatibility target profile by key. Defaults to 'balancedMatch'.
 * @param {string} key The key of the desired profile.
 * @returns {object} The compatibility target profile object.
 */
export function getCompatibilityTargetProfile(key) {
  return COMPATIBILITY_TARGET_PROFILES[key] || COMPATIBILITY_TARGET_PROFILES.balancedMatch
}

/**
 * Returns all available compatibility target profiles.
 * @returns {Array<object>} An array of profile objects.
 */
export function listCompatibilityTargetProfiles() {
  return Object.values(COMPATIBILITY_TARGET_PROFILES)
}

