import { webData } from '@/test/fixtures/web'
import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Network from './Network'

// The graph draws on a canvas, which jsdom does not implement.
vi.mock('react-force-graph-2d', () => ({ default: () => <canvas /> }))

describe('Network', () => {
  // iPhone Safari has no element fullscreen API, and neither does jsdom.
  it('keeps the graph working when the browser cannot go fullscreen', async () => {
    const { user } = renderPage(
      <Network
        data={webData([{ title: 'Sustainable Food', category: 'Food' }])}
        selectedId={null}
        setSelectedId={() => {}}
        webId={1}
      />,
    )

    await user.click(
      await screen.findByRole('button', { name: 'Enter Fullscreen' }),
    )

    expect(
      screen.getByRole('button', { name: 'Enter Fullscreen' }),
    ).toBeInTheDocument()
  })
})
