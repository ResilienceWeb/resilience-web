import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'

/**
 * Renders a component the way the app does, so tests can drive it as a user.
 *
 * Provides the two things these components need from their surroundings and
 * nothing else:
 *  - React Query, so data-fetching hooks are real (see `test/msw` for the
 *    responses they get)
 *  - nuqs, so components that keep state in the URL work; pass `searchParams`
 *    to start the test on a particular URL state
 *
 * Retries are off, otherwise a deliberately-failing request takes three
 * attempts before the component shows its error state.
 */
export function renderPage(
  ui: ReactElement,
  {
    searchParams = {},
    ...options
  }: Omit<RenderOptions, 'wrapper'> & {
    searchParams?: Record<string, string>
  } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const Providers = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  }
}
