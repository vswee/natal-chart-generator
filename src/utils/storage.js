const STORAGE_KEY = 'flat18:natal-chart-profile-v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readStoredProfile() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch (error) {
    console.warn('Unable to read stored profile.', error)
    return null
  }
}

export function writeStoredProfile(payload) {
  if (!canUseStorage()) return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (error) {
    console.warn('Unable to write stored profile.', error)
    return false
  }
}

export function clearStoredProfile() {
  if (!canUseStorage()) return false

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Unable to clear stored profile.', error)
    return false
  }
}

