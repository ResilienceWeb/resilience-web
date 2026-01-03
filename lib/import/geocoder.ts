/**
 * Address geocoding utility for CSV import
 * Uses OpenStreetMap Nominatim API for geocoding addresses
 */

import type { GeocodingResult } from "./types";

/**
 * Nominatim geocoding API base URL
 */
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * Rate limiting delay between geocoding requests (milliseconds)
 * Nominatim requires a maximum of 1 request per second
 */
const RATE_LIMIT_DELAY = 1100;

/**
 * Last request timestamp for rate limiting
 */
let lastRequestTime = 0;

/**
 * Wait to respect rate limiting
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

/**
 * Geocode an address using Nominatim API
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    return {
      latitude: 0,
      longitude: 0,
      description: "",
      success: false,
      error: "Address is empty",
    };
  }

  try {
    // Respect rate limiting
    await waitForRateLimit();

    // Build query parameters
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      countrycodes: "gb", // Limit to UK (adjust as needed)
    });

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "ResilienceWeb/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        description: address,
        success: false,
        error: "Address not found",
      };
    }

    const result = results[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      description: result.display_name || address,
      success: true,
    };
  } catch (error) {
    return {
      latitude: 0,
      longitude: 0,
      description: address,
      success: false,
      error: error instanceof Error ? error.message : "Geocoding failed",
    };
  }
}

/**
 * Geocode multiple addresses in batch
 * Note: This will be slow due to rate limiting (1 req/sec)
 */
export async function geocodeAddresses(
  addresses: string[]
): Promise<GeocodingResult[]> {
  const results: GeocodingResult[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results.push(result);
  }

  return results;
}

/**
 * Check if geocoding result is valid
 */
export function isValidGeocodingResult(result: GeocodingResult): boolean {
  return (
    result.success &&
    result.latitude !== 0 &&
    result.longitude !== 0 &&
    isFinite(result.latitude) &&
    isFinite(result.longitude) &&
    Math.abs(result.latitude) <= 90 &&
    Math.abs(result.longitude) <= 180
  );
}

/**
 * Format geocoding error message for display
 */
export function formatGeocodingError(result: GeocodingResult): string {
  if (result.success) return "";
  return result.error || "Failed to geocode address";
}
