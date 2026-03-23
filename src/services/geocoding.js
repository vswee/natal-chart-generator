const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

export async function geocodeAddress(address) {
  if (!address || !address.trim()) {
    throw new Error('Please enter a birthplace or address.')
  }

  const url = new URL(NOMINATIM_BASE)
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Location lookup failed.')
  }

  const results = await response.json()

  if (!Array.isArray(results) || !results.length) {
    throw new Error('No matching location was found.')
  }

  const first = results[0]

  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    label: first.display_name
  }
}
