'use client'

import { useMemo } from 'react'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'
import TagsHeader from '@components/admin/tags/header'
import TagsList from '@components/admin/tags/list'
import { Spinner } from '@components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import useCategories from '@hooks/categories/useCategories'
import useTags from '@hooks/tags/useTags'

export default function CategoriesPage() {
  const { tags, isPending: isTagsPending } = useTags()
  const { categories, isPending: isCategoriesPending } = useCategories()

  const orderedCategories = useMemo(() => {
    return categories?.sort((a, b) => a.label.localeCompare(b.label))
  }, [categories])

  if (isCategoriesPending) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Categories & Tags</h1>
        <p className="text-gray-600">
          Add, edit or remove categories and tags. You can also customise the
          icon and colour for each category.
        </p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesHeader />
          <CategoriesList categories={orderedCategories} />
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <TagsHeader />
          {tags.length === 0 ? (
            <p className="text-center text-gray-600">No tags yet</p>
          ) : isTagsPending ? (
            <Spinner />
          ) : (
            <TagsList tags={tags} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
