import { vi } from 'vitest'

/**
 * Stands in for Next's router in component tests.
 *
 * Components read the current route through `next/navigation` (`useParams`,
 * `usePathname`, `useRouter`). jsdom has no router, so `test/setup/components.ts`
 * mocks that module to read from here. Tests that care about the route call
 * `setRoute()`; tests that navigate can assert on `router.push`.
 *
 * This is the one place the component suite knows it is running on Next. If the
 * app ever moves framework, this file is what gets rewritten — not the tests.
 */

export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

export const route = {
  params: {} as Record<string, string>,
  pathname: '/',
}

export function setRoute({
  params,
  pathname,
}: {
  params?: Record<string, string>
  pathname?: string
}) {
  if (params) route.params = params
  if (pathname) route.pathname = pathname
}

export function resetRoute() {
  route.params = {}
  route.pathname = '/'
  Object.values(router).forEach((fn) => fn.mockClear())
}
