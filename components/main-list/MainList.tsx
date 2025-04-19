'use client'

import { memo, useMemo } from 'react'
import NextLink from 'next/link'
import { Button } from '@components/ui/button'

import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import Footer from '@components/footer'
import Item from './item'

interface MainListProps {
  filteredItems: any[]
}

const MainList = ({ filteredItems }: MainListProps) => {
  const selectedWebSlug = useSelectedWebSlug()
  const { categories } = useCategoriesPublic({ webSlug: selectedWebSlug })
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  return (
    <>
      <div className="flex min-h-[calc(100vh-302px)] flex-col items-center px-4 py-2">
        <div className="mt-4 w-full max-w-[1400px]">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {filteredItems.map((item) => (
                <Item
                  categoriesIndexes={categoriesIndexes}
                  dataItem={item}
                  key={item.id}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="max-w-[400px] text-center text-gray-600">
                No listings were found that match your search 🤔 Maybe propose
                the listing to the maintainers?
              </p>
              <NextLink href="/new-listing">
                <Button
                  variant="default"
                  className="bg-[#2B8257] hover:bg-[#236c47]"
                >
                  Propose new listing
                </Button>
              </NextLink>
            </div>
          )}
        </div>
      </div>
      <Footer hideBorder />
    </>
  )
}

export default memo(MainList)
