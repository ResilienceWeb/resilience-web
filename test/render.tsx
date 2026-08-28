import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { TooltipProvider } from '@components/ui/tooltip'
import { AppContext } from '@store/AppContext'

/**
 * The web an admin screen is currently working on. In the app this comes from
 * `StoreProvider`, which remembers the choice in local storage; the components
 * only ever read it through `useAppContext`.
 */
export interface SelectedWeb {
  slug?: string
  id?: number
}

/**
 * Renders a component the way the app does, so tests can drive it as a user.
 *
 * Provides the things these components need from their surroundings and
 * nothing else:
 *  - React Query, so data-fetching hooks are real (see `test/msw` for the
 *    responses they get)
 *  - nuqs, so components that keep state in the URL work; pass `searchParams`
 *    to start the test on a particular URL state
 *  - the selected web, which every admin screen reads to know what it is
 *    looking at; pass `selectedWeb` to put a test inside one
 *  - the tooltip provider, which the app mounts once at the root
 *
 * Retries are off, otherwise a deliberately-failing request takes three
 * attempts before the component shows its error state.
 */
export function renderPage(
  ui: ReactElement,
  {
    searchParams = {},
    selectedWeb = {},
    ...options
  }: Omit<RenderOptions, 'wrapper'> & {
    searchParams?: Record<string, string>
    selectedWeb?: SelectedWeb
  } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const appContext = {
    selectedWebSlug: selectedWeb.slug,
    selectedWebId: selectedWeb.id,
    setSelectedWebSlug: () => {},
  }

  const Providers = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContext value={appContext}>{children}</AppContext>
        </TooltipProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  }
}
