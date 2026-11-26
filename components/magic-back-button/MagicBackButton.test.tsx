import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageTracker } from '@helpers/page-tracker/PageTracker'
import { MagicBackButton } from './MagicBackButton'

describe('MagicBackButton', () => {
  it('goes to the back link after returning to a history entry with no state', async () => {
    const { user } = renderPage(
      <>
        <PageTracker />
        <MagicBackButton backLink="/home">Back</MagicBackButton>
      </>,
    )

    act(() => history.pushState({}, '', '/listing'))
    // A same-page #anchor link creates an entry whose state is null.
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })

    await waitFor(async () => {
      router.push.mockClear()
      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(router.push).toHaveBeenCalledWith('/home')
    })
    expect(router.back).not.toHaveBeenCalled()
  })
})
