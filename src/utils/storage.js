const STORAGE_KEY = 'flat18:natal-chart-profile-v1'
const SHARE_PARAM_KEY = 'profile'

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

function bytesToBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return window.btoa(binary)
}

function base64ToBytes(value) {
  const binary = window.atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function encodeSharedProfilePayload(payload) {
  if (!payload || typeof payload !== 'object') return ''

  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function decodeSharedProfilePayload(token) {
  if (!token || typeof token !== 'string') return null

  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = base64ToBytes(padded)
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    console.warn('Unable to decode shared profile payload.', error)
    return null
  }
}

export function extractSharedProfileTokenFromUrl(url = window.location.href) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.searchParams.get(SHARE_PARAM_KEY) || ''
  } catch (error) {
    return ''
  }
}

export function buildSharedProfileUrl(payload, baseUrl = window.location.href) {
  const token = encodeSharedProfilePayload(payload)
  if (!token) return ''

  const parsedUrl = new URL(baseUrl)
  parsedUrl.searchParams.set(SHARE_PARAM_KEY, token)
  return parsedUrl.toString()
}
