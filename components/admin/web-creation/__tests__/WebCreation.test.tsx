import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WebCreation from '../WebCreation.tsx'

/**
 * People land here after signing up, including some who only want to add
 * their own group. A web covers a whole place, so the page has to say so and
 * point anyone with a single group to the web for their area instead.
 */

describe('creating a web', () => {
  it('asks for the place the web covers', () => {
    renderPage(<WebCreation />)

    expect(screen.getByLabelText('Place name')).toBeInTheDocument()
  })

  it('points someone adding a single group to an existing web', () => {
    renderPage(<WebCreation />)

    expect(
      screen.getByRole('link', { name: "Find your area's web" }),
    ).toHaveAttribute('href', '/#web-cards')
  })
})
