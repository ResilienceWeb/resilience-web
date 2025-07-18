import { useCallback, useState, useMemo, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@store/hooks'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { removeNonAlphaNumeric } from '@helpers/utils'
import DeleteConfirmationDialog from '@components/admin/delete-confirmation-dialog'
import usePermissions from '@hooks/permissions/usePermissions'
import useWebs from '@hooks/webs/useWebs'
import Table from './table/Table'
import TableActions from './table/TableActions'

const EditableList = ({ deleteListing, isAdmin, items }) => {
  const router = useRouter()
  const { permissions } = usePermissions()
  const { webs } = useWebs()
  const { selectedWebId, selectedWebSlug } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Array<any>>([])
  const [
    isDeleteConfirmationOpenWithSlug,
    setIsDeleteConfirmationOpenWithSlug,
  ] = useState<any>()

  const filteredItems = useMemo(() => {
    if (!items) return []

    let results = items.filter((item) =>
      removeNonAlphaNumeric(item.title)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )

    if (selectedCategories.length > 0) {
      const categories = selectedCategories.map((c) => c.label)
      results = results.filter((item) =>
        categories.includes(item.category.label),
      )
    }

    return results
      .sort((a, b) => a.title.localeCompare(b.title))
      .sort((a, b) => b.pending - a.pending)
      .sort((a, b) => b.edits.length - a.edits.length)
  }, [items, searchTerm, selectedCategories])

  const goToEdit = useCallback(
    (dataItem) => {
      router.push(`/admin/listings/${dataItem.slug}`)
    },
    [router],
  )

  const goToProposedEdits = useCallback(
    (dataItem) => {
      router.push(`/admin/listings/${dataItem.slug}/edits`)
    },
    [router],
  )

  const goToCreateListing = useCallback(() => {
    router.push('/admin/new-listing')
  }, [router])

  const openRemoveDialog = useCallback((slug) => {
    setIsDeleteConfirmationOpenWithSlug(slug)
  }, [])
  const closeRemoveDialog = useCallback(() => {
    setIsDeleteConfirmationOpenWithSlug(null)
  }, [])

  const handleRemove = useCallback(() => {
    deleteListing({
      slug: isDeleteConfirmationOpenWithSlug,
      webId: selectedWebId,
    })
    closeRemoveDialog()
  }, [
    closeRemoveDialog,
    deleteListing,
    isDeleteConfirmationOpenWithSlug,
    selectedWebId,
  ])

  const handleSearchTermChange = useCallback((event) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleSelectedCategoriesChange = useCallback((value) => {
    setSelectedCategories(value)
  }, [])

  const explanatoryText = useMemo(() => {
    if (isAdmin) {
      return 'You are an admin. You can see all the listings on each web, as well as invite people, or edit categories or tags on each web.'
    }

    const selectedWebName = webs?.find((s) => s.id === selectedWebId)?.title

    if (permissions?.webIds?.includes(selectedWebId)) {
      return `You have access to edit any listing or add new listings on the ${selectedWebName} Resilience Web.`
    }

    return null
  }, [isAdmin, permissions?.webIds, selectedWebId, webs])

  if (!filteredItems) {
    return null
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Listings</h1>
        <p className="max-w-[500px] text-sm text-gray-600">{explanatoryText}</p>
        <p className="mt-4 max-w-[500px] text-sm text-gray-600">
          This web is publicly accessible at{' '}
          <a
            href={`${PROTOCOL}://${selectedWebSlug}.${REMOTE_HOSTNAME}`}
            target="_blank"
            className="font-semibold text-[#2B6CB0] hover:underline"
            rel="noopener noreferrer"
          >
            {`${selectedWebSlug}.${REMOTE_HOSTNAME}`}
          </a>
        </p>
      </div>
      <TableActions
        searchTerm={searchTerm}
        handleSearchTermChange={handleSearchTermChange}
        goToCreateListing={goToCreateListing}
        handleSelectedCategoriesChange={handleSelectedCategoriesChange}
      />
      {filteredItems.length > 0 ? (
        <Table
          goToEdit={goToEdit}
          goToProposedEdits={goToProposedEdits}
          removeItem={openRemoveDialog}
          items={filteredItems}
        />
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
        isOpen={isDeleteConfirmationOpenWithSlug}
        onClose={closeRemoveDialog}
        handleRemove={handleRemove}
        description="Are you sure you want to delete this listing? It can't be recovered once deleted."
        buttonLabel="Yes, delete"
      />
    </>
  )
}

export default memo(EditableList)
