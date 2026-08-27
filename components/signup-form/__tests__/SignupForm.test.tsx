import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignupForm from '../index.ts'

/**
 * Anything shorter than an address is caught by the browser first — the input is
 * `type="email"`, so submission is blocked before the form's own rules run.
 * What is left for these to cover is the empty case, which is natively valid.
 */
describe('the newsletter signup form', () => {
  it('asks for an email address when submitted empty', async () => {
    const { user } = renderPage(<SignupForm />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(
      await screen.findByText('Please enter your email address.'),
    ).toBeInTheDocument()
  })

  it('stops complaining once an address is typed', async () => {
    const { user } = renderPage(<SignupForm />)

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(
      await screen.findByText('Please enter your email address.'),
    ).toBeInTheDocument()

    await user.type(
      screen.getByPlaceholderText('Your email address'),
      'me@example.com',
    )

    expect(screen.queryByText('Please enter your email address.')).toBeNull()
  })
})
