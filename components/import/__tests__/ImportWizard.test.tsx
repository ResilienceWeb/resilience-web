import { recordRequests } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ImportWizard } from '../ImportWizard'

/**
 * The four-step wizard a web editor uses to bring a spreadsheet of groups into
 * their web: upload, map the columns onto listing fields, review what will be
 * created, import.
 *
 * The wizard is a gate as much as a form — the point of the middle two steps is
 * that nothing reaches the database until the columns make sense and every row
 * validates. So most of what is tested here is what it refuses to do.
 */

function csv(...lines: string[]) {
  return new File([lines.join('\n')], 'groups.csv', { type: 'text/csv' })
}

const TWO_GOOD_ROWS = csv(
  'Name,Description,Category,Website',
  'Bike Kitchen,Volunteers help you fix your own bicycle,Transport,https://bikekitchen.org',
  'Repair Cafe,Bring something broken and mend it,Community,https://repaircafe.org',
)

function renderWizard() {
  const rendered = renderPage(<ImportWizard webSlug="bristol" webId={3} />, {
    selectedWeb: { slug: 'bristol', id: 3 },
  })

  /**
   * The upload zone is a drop target with a transparent file input stretched
   * over it, so there is nothing else to hand the file to.
   */
  const fileInput = () =>
    rendered.container.querySelector<HTMLInputElement>('input[type="file"]')

  const dropZone = () => fileInput().parentElement

  return { ...rendered, fileInput, dropZone }
}

const next = (user: ReturnType<typeof renderPage>['user']) =>
  user.click(screen.getByRole('button', { name: /next/i }))

/** Uploads a file and waits for the wizard to be ready to move on. */
async function upload(
  { user, fileInput }: ReturnType<typeof renderWizard>,
  file: File,
) {
  await user.upload(fileInput(), file)
  await screen.findByText(file.name)
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled(),
  )
}

/** The row of the mapping table for one CSV column. */
const mappingFor = (header: string) =>
  screen.getByRole('row', { name: new RegExp(`^${header}\\b`) })

describe('the CSV import wizard', () => {
  it('will not move past the first step until a file is chosen', () => {
    renderWizard()

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('names the chosen file back to the editor', async () => {
    const wizard = renderWizard()

    await upload(wizard, TWO_GOOD_ROWS)

    expect(screen.getByText('groups.csv')).toBeInTheDocument()
  })

  it('takes a file dropped onto the upload zone', async () => {
    const { dropZone } = renderWizard()

    fireEvent.drop(dropZone(), {
      dataTransfer: { files: [TWO_GOOD_ROWS] },
    })

    expect(await screen.findByText('groups.csv')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next/i })).toBeEnabled(),
    )
  })

  it('ignores a dropped file that is not a CSV', () => {
    const { dropZone } = renderWizard()

    fireEvent.drop(dropZone(), {
      dataTransfer: {
        files: [new File(['nope'], 'groups.txt', { type: 'text/plain' })],
      },
    })

    expect(screen.queryByText('groups.txt')).toBeNull()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})

describe('mapping the columns', () => {
  it('recognises the columns it can and shows what they hold', async () => {
    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)

    expect(
      await screen.findByRole('columnheader', { name: 'Maps to' }),
    ).toBeInTheDocument()
    expect(mappingFor('Name')).toHaveTextContent('Name (required)')
    expect(mappingFor('Website')).toHaveTextContent('Website')
    // The first rows are shown alongside, so the editor can check the guess.
    expect(mappingFor('Name')).toHaveTextContent('Bike Kitchen')
  })

  it('blocks the import while a required field is unmapped', async () => {
    const wizard = renderWizard()
    await upload(
      wizard,
      csv(
        'Name,Blurb,Category',
        'Bike Kitchen,Volunteers help you fix your own bicycle,Transport',
      ),
    )
    await next(wizard.user)

    expect(
      await screen.findByText(/required fields not mapped/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('lets the editor map an unrecognised column by hand', async () => {
    const wizard = renderWizard()
    await upload(
      wizard,
      csv(
        'Name,Blurb,Category',
        'Bike Kitchen,Volunteers help you fix your own bicycle,Transport',
      ),
    )
    await next(wizard.user)

    await wizard.user.click(within(mappingFor('Blurb')).getByRole('combobox'))
    await wizard.user.click(
      await screen.findByRole('option', { name: 'Description' }),
    )

    expect(screen.queryByText(/required fields not mapped/i)).toBeNull()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next/i })).toBeEnabled(),
    )
  })

  it('lets the editor drop a column they do not want imported', async () => {
    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)

    await wizard.user.click(within(mappingFor('Website')).getByRole('combobox'))
    await wizard.user.click(
      await screen.findByRole('option', { name: /don't import/i }),
    )

    expect(mappingFor('Website')).toHaveTextContent("(Don't import)")
  })
})

describe('reviewing before importing', () => {
  it('says every row is good and previews what would be created', async () => {
    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)
    await next(wizard.user)

    expect(await screen.findByText(/all rows valid/i)).toBeInTheDocument()
    expect(screen.getByText('Bike Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Repair Cafe')).toBeInTheDocument()
  })

  it('refuses to import while a row is invalid, and says which', async () => {
    const wizard = renderWizard()
    await upload(
      wizard,
      csv(
        'Name,Description,Category,Email',
        'Bike Kitchen,Volunteers help you fix your own bicycle,Transport,hello@bikekitchen.org',
        'Repair Cafe,,Community,nope',
      ),
    )
    await next(wizard.user)
    await next(wizard.user)

    expect(
      await screen.findByText(/validation errors found/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start import/i })).toBeDisabled()

    await wizard.user.click(
      screen.getByRole('button', { name: /show error details/i }),
    )

    expect(await screen.findByText(/Row 2:/)).toBeInTheDocument()
    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    // The valid row is not held up as a problem.
    expect(screen.queryByText(/Row 1:/)).toBeNull()
  })
})

describe('running the import', () => {
  const summaryOf = (rows: number) => ({
    success: true,
    summary: {
      totalRows: rows,
      successCount: rows,
      errorCount: 0,
      skipCount: 0,
      batches: [],
      completedAt: '2026-03-09T12:00:00.000Z',
    },
  })

  it('sends the mapped rows to the web being imported into', async () => {
    const imported = recordRequests(summaryOf(2))
    server.use(http.post('/api/listings/import', imported.resolver))

    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)
    await next(wizard.user)
    await wizard.user.click(
      await screen.findByRole('button', { name: /start import/i }),
    )

    await waitFor(() => expect(imported.calls).toHaveLength(1))
    expect(imported.calls[0].url.searchParams.get('web')).toBe('bristol')
    expect(imported.calls[0].body).toMatchObject({
      webId: 3,
      columnMapping: {
        Name: 'name',
        Description: 'description',
        Category: 'category',
        Website: 'website',
      },
    })
    expect(imported.calls[0].body.rows).toHaveLength(2)
  })

  it('reports the outcome once it is done', async () => {
    const imported = recordRequests(summaryOf(2))
    server.use(http.post('/api/listings/import', imported.resolver))

    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)
    await next(wizard.user)
    await wizard.user.click(
      await screen.findByRole('button', { name: /start import/i }),
    )

    expect(
      await screen.findByRole('heading', {
        name: /import completed successfully/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /view listings/i }),
    ).toBeInTheDocument()
  })

  it('leaves the editor on the review step when the import fails', async () => {
    server.use(
      http.post('/api/listings/import', () =>
        HttpResponse.json({ error: 'Something went wrong' }, { status: 500 }),
      ),
    )

    const wizard = renderWizard()
    await upload(wizard, TWO_GOOD_ROWS)
    await next(wizard.user)
    await next(wizard.user)
    await wizard.user.click(
      await screen.findByRole('button', { name: /start import/i }),
    )

    expect(
      await screen.findByRole('button', { name: /start import/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /import completed/i }),
    ).toBeNull()
  })
})
