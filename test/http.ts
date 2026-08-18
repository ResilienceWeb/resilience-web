import { NextRequest } from 'next/server'

type RequestOptions = Omit<RequestInit, 'body'> & {
  /** A plain object is JSON-encoded; a FormData is passed through as-is. */
  body?: unknown
}

/** Builds the `NextRequest` a route handler expects, with an absolute URL. */
export function request(path: string, init: RequestOptions = {}): NextRequest {
  const url = new URL(path, 'http://localhost:4000')
  const { body, headers, ...rest } = init

  if (body === undefined) {
    return new NextRequest(url, { ...rest, headers })
  }

  const isFormData = body instanceof FormData

  return new NextRequest(url, {
    ...rest,
    body: isFormData ? body : JSON.stringify(body),
    headers: {
      ...(isFormData ? {} : { 'content-type': 'application/json' }),
      ...(headers as Record<string, string> | undefined),
    },
  })
}

/** Route handlers with a dynamic segment receive params as a promise. */
export function params<T extends Record<string, string>>(value: T) {
  return { params: Promise.resolve(value) }
}
