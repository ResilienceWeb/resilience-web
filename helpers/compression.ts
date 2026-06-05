import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate'

/**
 * Isomorphic gzip helpers for shipping large JSON payloads across the
 * server/client boundary.
 *
 * The data is gzip-compressed on the server, base64-encoded so it survives
 * React Server Component prop serialisation, and stays compressed across the
 * wire. The client decompresses it synchronously on render. Both `btoa`/`atob`
 * and fflate work in Node and the browser, so this module is safe to import
 * from server and client components alike.
 */

// Largest argument count we feed to String.fromCharCode at once. Converting the
// whole byte array in a single call risks a stack overflow on large payloads.
const CHUNK_SIZE = 0x8000

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE))
  }
  return btoa(binary)
}

function base64ToBytes(encoded: string): Uint8Array {
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Gzip-compresses a value and returns a base64 string safe to pass as a prop.
 */
export function compressJson(value: unknown): string {
  return bytesToBase64(gzipSync(strToU8(JSON.stringify(value))))
}

/**
 * Reverses {@link compressJson}, decompressing a base64 gzip string back into
 * its original value.
 */
export function decompressJson<T>(encoded: string): T {
  return JSON.parse(strFromU8(gunzipSync(base64ToBytes(encoded)))) as T
}
