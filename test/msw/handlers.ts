import { http, HttpResponse } from 'msw'

/**
 * Default API responses for component tests.
 *
 * Stubbing at the network boundary rather than at the hook keeps the React
 * Query hooks, their caching and their error handling all real — the component
 * under test is wired up exactly as it is in the browser. It also means these
 * stubs describe the HTTP contract, so they stay valid if the server that
 * implements them is ever rewritten.
 *
 * Override per test with `server.use(...)`, or use the `stub*` helpers below.
 */

export interface CategoryStub {
  id: number
  label: string
  color?: string
  icon?: string
  _count?: { listings: number }
}

export interface TagStub {
  id: number
  label: string
  listings?: unknown[]
  _count?: { listings: number }
}

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json({ data: [] })),
  http.get('/api/tags', () => HttpResponse.json({ data: [] })),
]

/** Categories as `/api/categories?web=…` returns them. */
export function stubCategories(categories: CategoryStub[]) {
  return http.get('/api/categories', () =>
    HttpResponse.json({
      data: categories.map((c) => ({
        color: 'b0e3c1',
        icon: 'default',
        ...c,
      })),
    }),
  )
}

/** Tags as `/api/tags?web=…` returns them. */
export function stubTags(tags: TagStub[]) {
  return http.get('/api/tags', () => HttpResponse.json({ data: tags }))
}

/** Listings as `/api/listings?web=…` returns them. */
export function stubListings(listings: unknown[]) {
  return http.get('/api/listings', () => HttpResponse.json({ listings }))
}

/** A single web, as `/api/webs/:slug` returns it. */
export function stubWeb(web: { id?: number; title?: string; slug?: string }) {
  return http.get('/api/webs/:slug', ({ params }) =>
    HttpResponse.json({
      web: { id: 1, title: 'Bristol', slug: params.slug, ...web },
    }),
  )
}

/**
 * The answer to "may the signed-in user edit this web?", which the admin
 * screens ask before showing anything that changes it.
 */
export function stubCanEditWeb(canEdit: boolean) {
  return http.get('/api/web-access/check', () => HttpResponse.json({ canEdit }))
}

/** Pending edits for a listing, as `/api/listings/:slug/edit?web=…` returns them. */
export function stubListingEdits(listingEdits: unknown[]) {
  return http.get('/api/listings/:slug/edit', () =>
    HttpResponse.json({ listingEdits }),
  )
}

export interface RecordedRequest {
  url: URL
  /** JSON bodies as-is; form submissions as a plain object of their fields. */
  body: Record<string, unknown>
}

export interface RequestRecorder {
  /** Every matching request the component made, in the order it made them. */
  calls: RecordedRequest[]
  /** Pass to `http.post(path, recorder.resolver)`. */
  resolver: (info: { request: Request }) => Promise<Response>
}

/**
 * Stubs a request and remembers what was sent, so a test can assert on the
 * change a component asked the server to make:
 *
 *   const created = recordRequests({ listing: { slug: 'bike-kitchen' } })
 *   server.use(http.post('/api/listings', created.resolver))
 *   …
 *   await waitFor(() => expect(created.calls).toHaveLength(1))
 *   expect(created.calls[0].body).toMatchObject({ title: 'Bike Kitchen' })
 */
export function recordRequests(respondWith: unknown = {}): RequestRecorder {
  const calls: RecordedRequest[] = []

  return {
    calls,
    resolver: async ({ request }) => {
      calls.push({
        url: new URL(request.url),
        body: await readBody(request),
      })
      return HttpResponse.json(respondWith)
    },
  }
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>
  }

  if (contentType.includes('multipart/form-data')) {
    return Object.fromEntries(await request.formData())
  }

  return {}
}
