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
}

export interface TagStub {
  id: number
  label: string
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
