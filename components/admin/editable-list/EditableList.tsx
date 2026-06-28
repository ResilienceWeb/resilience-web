import { useCallback, useState, useMemo, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { getWebUrl, REMOTE_HOSTNAME } from '@helpers/config'
import { removeNonAlphaNumeric } from '@helpers/utils'
import DeleteConfirmationDialog from '@components/admin/delete-confirmation-dialog'
import { Button } from '@components/ui/button'
import { useAppContext } from '@store/hooks'
import { tour } from '../../../app/admin/tour'
import Table from './table/Table'
import TableActions from './table/TableActions'

const EditableList = ({ deleteListing, items }) => {
  const router = useRouter()
  const { selectedWebId, selectedWebSlug } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriesParam, setCategoriesParam] = useQueryState(
    'categories',
    parseAsArrayOf(parseAsString).withDefault([]),
  )
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const filteredItems = useMemo(() => {
    if (!items) return []

    let results = items.filter((item) =>
      removeNonAlphaNumeric(item.title)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )

    if (categoriesParam.length > 0) {
      results = results.filter((item) =>
        categoriesParam.includes(item.category.label),
      )
    }

    return results
      .sort((a, b) => a.title.localeCompare(b.title))
      .sort((a, b) => b.pending - a.pending)
      .sort((a, b) => b.edits.length - a.edits.length)
  }, [items, searchTerm, categoriesParam])

  const goToCreateListing = useCallback(() => {
    if (tour.isActive) {
      tour.moveNext()
    }
    router.push('/admin/new-listing')
  }, [router])

  const openRemoveDialog = useCallback(
    (slug) => {
      const target = items?.find((i: any) => i.slug === slug) ?? { slug }
      setItemToDelete(target)
    },
    [items],
  )
  const closeRemoveDialog = useCallback(() => {
    setItemToDelete(null)
  }, [])

  const handleRemove = useCallback(() => {
    if (!itemToDelete) return
    deleteListing({
      slug: itemToDelete.slug,
      webId: selectedWebId,
    })
    closeRemoveDialog()
  }, [closeRemoveDialog, deleteListing, itemToDelete, selectedWebId])

  const isShared = (itemToDelete?.sharedWith?.length ?? 0) > 0
  const otherWebTitles: string[] = (itemToDelete?.sharedWith ?? []).map(
    (s: any) => s.web?.title ?? s.web?.slug,
  )
  const dialogTitle = isShared
    ? `Remove from ${selectedWebSlug}`
    : 'Delete listing'
  const dialogDescription = isShared
    ? `Remove this listing from the ${selectedWebSlug} web? It will stay listed in ${otherWebTitles.join(', ')}.`
    : "Are you sure you want to delete this listing? It can't be recovered once deleted."
  const dialogButtonLabel = isShared ? 'Yes, remove' : 'Yes, delete'

  const handleSearchTermChange = useCallback((event) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleSelectedCategoriesChange = useCallback(
    (value) => {
      setCategoriesParam(value.map((c) => c.value))
    },
    [setCategoriesParam],
  )

  if (!filteredItems) {
    return null
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          <p className="mt-4 max-w-[500px] text-sm text-gray-600">
            This web is publicly accessible at{' '}
            <a
              href={getWebUrl(selectedWebSlug)}
              target="_blank"
              className="font-semibold hover:underline"
              rel="noopener noreferrer"
            >
              {`${selectedWebSlug}.${REMOTE_HOSTNAME}`}
            </a>
          </p>
        </div>

        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin/listing-edits">View Suggested Edits</Link>
        </Button>
      </div>

      <TableActions
        searchTerm={searchTerm}
        handleSearchTermChange={handleSearchTermChange}
        goToCreateListing={goToCreateListing}
        handleSelectedCategoriesChange={handleSelectedCategoriesChange}
        selectedCategoryLabels={categoriesParam}
      />
      {filteredItems.length > 0 ? (
        <Table items={filteredItems} removeItem={openRemoveDialog} />
      ) : (
        <div className="my-12 flex justify-center">
          <p className="font-semibold">
            No listings yet. Why not{' '}
            <Link
              href="/admin/new-listing"
              className="text-green-800 hover:underline"
            >
              start adding
            </Link>
            .
          </p>
        </div>
      )}
      <DeleteConfirmationDialog
        isOpen={Boolean(itemToDelete)}
        onClose={closeRemoveDialog}
        handleRemove={handleRemove}
        titleLabel={dialogTitle}
        description={dialogDescription}
        buttonLabel={dialogButtonLabel}
      />
    </>
  )
}

export default memo(EditableList)
