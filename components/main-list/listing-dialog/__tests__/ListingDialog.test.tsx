import { setRoute } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ListingDialog from '../ListingDialog.tsx'

const item = {
  label: 'Food Hub',
  slug: 'food-hub',
  description: '',
  category: { label: 'Food', color: '#b0e3c1', icon: 'default' },
  tags: [],
}

function renderDialog(alsoListedIn?: AlsoListedIn[]) {
  setRoute({ params: { subdomain: 'bristol' } })
  renderPage(
    <ListingDialog
      isOpen
      item={{ ...item, alsoListedIn }}
      onClose={() => {}}
    />,
  )
  return screen.getByRole('dialog', { name: /food hub/i })
}

describe('the listing dialog', () => {
  it('links to the listing in the other webs it is part of', () => {
    const dialog = renderDialog([
      { slug: 'hub-in-bath', web: { slug: 'bath', title: 'Bath' } },
    ])

    expect(within(dialog).getByText(/also on/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Bath' })).toHaveAttribute(
      'href',
      expect.stringMatching(/bath\..*\/hub-in-bath$/),
    )
  })

  it('says nothing about other webs when it is only in this one', () => {
    const dialog = renderDialog()

    expect(within(dialog).queryByText(/also on/i)).toBeNull()
  })
})
