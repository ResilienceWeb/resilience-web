import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '../msw/server.ts'
import { resetRoute, route, router } from '../next-navigation.ts'

// Components read the current route from `next/navigation`, which has no
// implementation under jsdom. Backed by `test/next-navigation.ts` so a test can
// set the route or assert on navigation.
// Static image imports resolve to a URL string under Vite rather than Next's
// `{ src, width, height }` object, and `next/link` wants a router. Both render
// as the plain elements they become in the browser, which is also what a test
// driving the UI actually cares about.
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: Record<string, unknown>) => {
    // Strip the props that are Next's own and not valid DOM attributes.
    const {
      fill,
      priority,
      quality,
      placeholder,
      blurDataURL,
      loader,
      sizes,
      unoptimized,
      ...imgProps
    } = rest
    const resolved =
      typeof src === 'string' ? src : (src as { src?: string })?.src
    // eslint-disable-next-line @next/next/no-img-element -- this is the stub that replaces next/image
    return <img src={resolved} alt={alt as string} {...imgProps} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: Record<string, unknown>) => {
    const { prefetch, replace, scroll, shallow, ...anchorProps } = rest
    return (
      <a href={typeof href === 'string' ? href : String(href)} {...anchorProps}>
        {children as React.ReactNode}
      </a>
    )
  },
}))

vi.mock('next/navigation', () => ({
  useParams: () => route.params,
  usePathname: () => route.pathname,
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// `error` so a request the tests forgot to stub fails loudly instead of
// silently resolving to something unexpected.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetRoute()
})

afterAll(() => server.close())

/**
 * jsdom doesn't implement these, and Radix (which every shadcn/ui component is
 * built on) reaches for them during mount. Without the stubs, rendering almost
 * any dialog, select or popover throws.
 */
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

/* eslint-disable no-empty-function -- the observers only need to exist, not observe */
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    root = null
    rootMargin = ''
    thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}
/* eslint-enable no-empty-function */

/* eslint-disable @typescript-eslint/unbound-method -- assigning stubs onto the
   prototype is the point here; nothing is being detached and called. */
Element.prototype.scrollIntoView ??= vi.fn()
Element.prototype.hasPointerCapture ??= vi.fn(() => false)
Element.prototype.setPointerCapture ??= vi.fn()
Element.prototype.releasePointerCapture ??= vi.fn()
/* eslint-enable @typescript-eslint/unbound-method */
