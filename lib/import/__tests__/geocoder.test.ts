import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  geocodeAddress,
  geocodeAddresses,
  isValidGeocodingResult,
  formatGeocodingError,
} from '../geocoder'
import type { GeocodingResult } from '../types'

// Mock fetch globally
global.fetch = vi.fn()

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return error for empty address', async () => {
    const result = await geocodeAddress('')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address is empty')
    expect(result.latitude).toBe(0)
    expect(result.longitude).toBe(0)
  })

  it('should return error for whitespace-only address', async () => {
    const result = await geocodeAddress('   ')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address is empty')
  })

  it('should geocode valid UK address', async () => {
    const mockResponse = [
      {
        lat: '51.5074',
        lon: '-0.1278',
        display_name: '10 Downing Street, London, UK',
      },
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await geocodeAddress('10 Downing Street, London')

    expect(result.success).toBe(true)
    expect(result.latitude).toBe(51.5074)
    expect(result.longitude).toBe(-0.1278)
    expect(result.description).toBe('10 Downing Street, London, UK')
  })

  it('should handle address not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)

    const result = await geocodeAddress('Nonexistent Place XYZ123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address not found')
    expect(result.description).toBe('Nonexistent Place XYZ123')
  })

  it('should handle API error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)

    const result = await geocodeAddress('Test Address')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Nominatim API error')
  })

  it('should handle network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network timeout'))

    const result = await geocodeAddress('Test Address')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network timeout')
  })

  it('should handle non-Error exception', async () => {
    vi.mocked(fetch).mockRejectedValueOnce('String error')

    const result = await geocodeAddress('Test Address')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Geocoding failed')
  })

  it('should include proper headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([{ lat: '51.5', lon: '-0.1', display_name: 'Test' }]),
    } as Response)

    await geocodeAddress('Test Address')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('nominatim.openstreetmap.org'),
      expect.objectContaining({
        headers: {
          'User-Agent': 'ResilienceWeb/1.0',
        },
      }),
    )
  })

  it('should include country code parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([{ lat: '51.5', lon: '-0.1', display_name: 'Test' }]),
    } as Response)

    await geocodeAddress('Test Address')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('countrycodes=gb'),
      expect.any(Object),
    )
  })

  it('should handle special characters in address', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { lat: '51.5', lon: '-0.1', display_name: 'Test & Co.' },
        ]),
    } as Response)

    const result = await geocodeAddress('123 Test & Co. Street, London')

    expect(result.success).toBe(true)
  })

  it('should handle very long address', async () => {
    const longAddress = 'A'.repeat(1000)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)

    const result = await geocodeAddress(longAddress)

    expect(result.success).toBe(false)
  })

  it('should handle malformed JSON response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    } as Response)

    const result = await geocodeAddress('Test Address')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid JSON')
  })

  it('should handle null response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response)

    const result = await geocodeAddress('Test Address')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address not found')
  })

  it('should use fallback description when display_name missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ lat: '51.5', lon: '-0.1' }]),
    } as Response)

    const result = await geocodeAddress('Original Address')

    expect(result.success).toBe(true)
    expect(result.description).toBe('Original Address')
  })

  it('should parse numeric strings to floats', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { lat: '51.507351', lon: '-0.127758', display_name: 'Test' },
        ]),
    } as Response)

    const result = await geocodeAddress('Test')

    expect(result.latitude).toBeCloseTo(51.507351)
    expect(result.longitude).toBeCloseTo(-0.127758)
  })
})

describe('geocodeAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should geocode multiple addresses', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { lat: '51.5', lon: '-0.1', display_name: 'Address 1' },
          ]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { lat: '52.5', lon: '-1.1', display_name: 'Address 2' },
          ]),
      } as Response)

    const results = await geocodeAddresses(['Address 1', 'Address 2'])

    expect(results).toHaveLength(2)
    expect(results[0].latitude).toBe(51.5)
    expect(results[1].latitude).toBe(52.5)
  })

  it('should handle empty array', async () => {
    const results = await geocodeAddresses([])

    expect(results).toHaveLength(0)
  })

  it('should continue processing after individual failures', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { lat: '51.5', lon: '-0.1', display_name: 'Success' },
          ]),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { lat: '52.5', lon: '-1.1', display_name: 'Success 2' },
          ]),
      } as Response)

    const results = await geocodeAddresses(['Addr 1', 'Addr 2', 'Addr 3'])

    expect(results).toHaveLength(3)
    expect(results[0].success).toBe(true)
    expect(results[1].success).toBe(false)
    expect(results[2].success).toBe(true)
  })
})

describe('isValidGeocodingResult', () => {
  it('should validate successful result with valid coordinates', () => {
    const result: GeocodingResult = {
      latitude: 51.5074,
      longitude: -0.1278,
      description: 'London',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(true)
  })

  it('should reject failed result', () => {
    const result: GeocodingResult = {
      latitude: 51.5074,
      longitude: -0.1278,
      description: 'London',
      success: false,
      error: 'Error',
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject zero coordinates', () => {
    const result: GeocodingResult = {
      latitude: 0,
      longitude: 0,
      description: 'Gulf of Guinea',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject latitude = 0 but longitude != 0', () => {
    const result: GeocodingResult = {
      latitude: 0,
      longitude: -0.1278,
      description: 'Equator',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject longitude = 0 but latitude != 0', () => {
    const result: GeocodingResult = {
      latitude: 51.5074,
      longitude: 0,
      description: 'Prime Meridian',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject NaN coordinates', () => {
    const result: GeocodingResult = {
      latitude: NaN,
      longitude: -0.1278,
      description: 'Invalid',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject Infinity coordinates', () => {
    const result: GeocodingResult = {
      latitude: Infinity,
      longitude: -0.1278,
      description: 'Invalid',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject latitude > 90', () => {
    const result: GeocodingResult = {
      latitude: 91,
      longitude: 0,
      description: 'Beyond North Pole',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject latitude < -90', () => {
    const result: GeocodingResult = {
      latitude: -91,
      longitude: 0,
      description: 'Beyond South Pole',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject longitude > 180', () => {
    const result: GeocodingResult = {
      latitude: 51.5,
      longitude: 181,
      description: 'Beyond date line',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should reject longitude < -180', () => {
    const result: GeocodingResult = {
      latitude: 51.5,
      longitude: -181,
      description: 'Beyond date line',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(false)
  })

  it('should accept boundary values', () => {
    const northPole: GeocodingResult = {
      latitude: 90,
      longitude: 0.0001,
      description: 'North Pole',
      success: true,
    }

    const southPole: GeocodingResult = {
      latitude: -90,
      longitude: 0.0001,
      description: 'South Pole',
      success: true,
    }

    const dateLine: GeocodingResult = {
      latitude: 51.5,
      longitude: 180,
      description: 'Date Line',
      success: true,
    }

    expect(isValidGeocodingResult(northPole)).toBe(true)
    expect(isValidGeocodingResult(southPole)).toBe(true)
    expect(isValidGeocodingResult(dateLine)).toBe(true)
  })

  it('should accept negative coordinates (Southern/Western hemisphere)', () => {
    const result: GeocodingResult = {
      latitude: -33.8688,
      longitude: 151.2093,
      description: 'Sydney',
      success: true,
    }

    expect(isValidGeocodingResult(result)).toBe(true)
  })
})

describe('formatGeocodingError', () => {
  it('should return empty string for successful result', () => {
    const result: GeocodingResult = {
      latitude: 51.5,
      longitude: -0.1,
      description: 'London',
      success: true,
    }

    expect(formatGeocodingError(result)).toBe('')
  })

  it('should return error message for failed result', () => {
    const result: GeocodingResult = {
      latitude: 0,
      longitude: 0,
      description: '',
      success: false,
      error: 'Address not found',
    }

    expect(formatGeocodingError(result)).toBe('Address not found')
  })

  it('should return default message when error undefined', () => {
    const result: GeocodingResult = {
      latitude: 0,
      longitude: 0,
      description: '',
      success: false,
    }

    expect(formatGeocodingError(result)).toBe('Failed to geocode address')
  })
})
