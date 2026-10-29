'use client'

import { parseAsStringLiteral, useQueryState } from 'nuqs'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'
import TagsHeader from '@components/admin/tags/header'
import TagsList from '@components/admin/tags/list'
import Faq from '@components/faq'
import { Spinner } from '@components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import useCategories from '@hooks/categories/useCategories'
import useTags from '@hooks/tags/useTags'

const faqs = [
  {
    question: 'What is the difference between a category and a tag?',
    answer:
      'Every listing belongs to exactly one category, which determines its colour on the web. Tags are optional labels that cut across categories — a listing can have several, and visitors can filter the web by tag.',
  },
  {
    question: 'What are shared tags?',
    answer:
      'Shared tags are a common set of tags, such as "Food Bank" or "Repair Café", that every web can use and that mean the same thing wherever they appear. Add the ones that suit your web with the "Add tag" button on the Tags tab, and they will then be available when tagging listings. Shared tags cannot be renamed or given a different icon, but you can remove one from your web at any time, which also takes it off your listings. If none of them fit, you can create your own tag instead.',
  },
  {
    question: 'Why can I not delete a category?',
    answer:
      'A category cannot be deleted while there are still listings using it. Move those listings to a different category first, then delete it.',
  },
  {
    question: 'Where are the category icons and colours used?',
    answer:
      'The colour is used for the listings of that category everywhere on your web. The icon appears in the category filter and, if your web has the Map view enabled, it is also used for the markers on the map.',
  },
  {
    question: 'How long until my changes appear on the public web?',
    answer:
      'Changes to categories and tags are applied to your public web automatically, but there might be a slight delay before they show up.',
  },
]

export default function CategoriesPage() {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral(['categories', 'tags']).withDefault('categories'),
  )
  const { tags, isPending: isTagsPending, isError: isTagsError } = useTags()
  const { categories, isPending: isCategoriesPending } = useCategories()

  const orderedCategories = categories?.sort((a, b) =>
    a.label.localeCompare(b.label),
  )

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

      <Tabs
        value={tab}
        onValueChange={(value) => void setTab(value as 'categories' | 'tags')}
      >
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
          {isTagsError ? (
            <p role="alert" className="text-center text-red-600">
              We couldn&apos;t load your tags. Please try again later.
            </p>
          ) : tags?.length === 0 ? (
            <p className="text-center text-gray-600">No tags yet</p>
          ) : isTagsPending ? (
            <Spinner />
          ) : (
            <TagsList tags={tags} />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 mb-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
