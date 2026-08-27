import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GetInTouchButton from '../GetInTouchButton.tsx'

/** The dialog is fetched on demand, so opening it has to survive the wait. */
describe('the help & feedback button', () => {
  it('opens the contact form when clicked', async () => {
    const { user } = renderPage(<GetInTouchButton />)

    await user.click(screen.getByRole('button', { name: /help & feedback/i }))

    expect(await screen.findByLabelText(/message/i)).toBeInTheDocument()
  })

  it('does not render the contact form until it is asked for', () => {
    renderPage(<GetInTouchButton />)

    expect(screen.queryByLabelText(/message/i)).toBeNull()
  })
})
