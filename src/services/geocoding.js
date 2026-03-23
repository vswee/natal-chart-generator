const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

export async function searchLocations(query, limit = 5) {
  if (!query || !query.trim()) return []

  const url = new URL(NOMINATIM_BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', String(limit))

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Location lookup failed.')
  }

  const results = await response.json()

  if (!Array.isArray(results)) {
    throw new Error('Location lookup failed.')
  }

  return results.map((item) => ({
    lat: Number(item.lat),
    lon: Number(item.lon),
    label: item.display_name
  }))
}

export async function geocodeAddress(address) {
  if (!address || !address.trim()) {
    throw new Error('Please enter a birthplace or address.')
  }

  const results = await searchLocations(address, 1)

  if (!results.length) {
    throw new Error('No matching location was found.')
  }

  return results[0]
}
