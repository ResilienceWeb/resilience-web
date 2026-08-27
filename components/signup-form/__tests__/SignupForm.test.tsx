import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignupForm from '../index.ts'

/**
 * The form is only fetched once it is about to scroll into view, so what a
 * visitor first meets in the footer is a stand-in. These drive the other
 * trigger — someone who reaches it before it scrolls into view — because that
 * is where typing could be dropped.
 */
describe('the newsletter signup form', () => {
  it('takes every keystroke typed while it is still loading', async () => {
    const { user } = renderPage(<SignupForm />)

    await user.type(
      await screen.findByPlaceholderText('Your email address'),
      'me@example.com',
    )

    expect(screen.getByPlaceholderText('Your email address')).toHaveValue(
      'me@example.com',
    )
  })

  it('keeps what was typed when the real form takes over', async () => {
    const { user } = renderPage(<SignupForm />)

    await user.type(
      await screen.findByPlaceholderText('Your email address'),
      'me@example.com',
    )
    await user.tab()

    // The real form is in place now — it carries the reCAPTCHA notice, which
    // the stand-in does not — and it still holds what was typed.
    expect(
      await screen.findByText(/protected by reCAPTCHA/i),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Your email address')).toHaveValue(
        'me@example.com',
      ),
    )
  })

  it('offers a submit button throughout', async () => {
    renderPage(<SignupForm />)

    expect(
      await screen.findByRole('button', { name: /submit/i }),
    ).toBeInTheDocument()
  })
})
