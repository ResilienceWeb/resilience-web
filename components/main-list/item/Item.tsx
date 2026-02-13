'use client'

import { useCallback, useMemo, useEffect, useState, memo } from 'react'
import { FaStar } from 'react-icons/fa'
import { HiUserGroup } from 'react-icons/hi'
import { useInView } from 'react-intersection-observer'
import { useParams, useRouter } from 'next/navigation'
import chroma from 'chroma-js'
import { isBranchDeploy } from '@helpers/config'
import CategoryTag from '@components/category-tag'
import ListingImage from '@components/listing-image'
import { Badge } from '@components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import ImagePlaceholder from './image-placeholder'

type Props = {
  categoriesIndexes: Record<string, number>
  dataItem: ListingNodeType
  simplified?: boolean
}

const Item = ({ categoriesIndexes, dataItem, simplified = false }: Props) => {
  const router = useRouter()
  const { subdomain } = useParams<{ subdomain: string }>()
  const [isWithinAFewSecondsOfRender, setIsWithinAFewSecondsOfRender] =
    useState<boolean>(true)
  const { ref, inView } = useInView()

  useEffect(() => {
    setTimeout(() => {
      setIsWithinAFewSecondsOfRender(false)
    }, 3000)
  }, [])

  const onClick = useCallback(() => {
    const path = isBranchDeploy()
      ? `/${subdomain}/${dataItem.slug}`
      : `/${dataItem.slug}`
    router.push(path)
  }, [dataItem.slug, router, subdomain])

  const categoryBackgroundColor = useMemo(
    () => chroma(dataItem.category.color).alpha(0.5).css(),
    [dataItem.category.color],
  )

  const categoryIndex = useMemo(
    () => categoriesIndexes?.[dataItem.category.label],
    [categoriesIndexes, dataItem.category.label],
  )

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom relative h-fit cursor-pointer rounded-md bg-white shadow-md transition-all duration-200 ease-out hover:shadow-xl"
      onClick={onClick}
      ref={ref}
    >
      {dataItem.featured && new Date(dataItem.featured) > new Date() && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FaStar className="absolute top-[140px] z-100 h-[26px] w-[26px] text-yellow-200 right-1 bottom-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Featured listing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {dataItem.new && (
        <Badge variant="secondary" className="absolute top-1 right-1 z-10">
          New
        </Badge>
      )}
      <CategoryTag
        className="absolute top-1 left-1 z-10 min-w-min shadow-md"
        alpha={1}
        colorHex={dataItem.category.color}
      >
        {dataItem.category.label}
      </CategoryTag>
      {dataItem.image ? (
        <ListingImage
          alt={`${dataItem.label} cover image`}
          src={dataItem.image}
          sizes="(max-width: 768px) 90vw, 300px"
          priority={inView && isWithinAFewSecondsOfRender}
        />
      ) : (
        categoryIndex !== null &&
        categoryIndex !== undefined && (
          <ImagePlaceholder
            backgroundColor={categoryBackgroundColor}
            categoryIndex={categoryIndex}
          />
        )
      )}
      <div className="px-3 pb-3">
        <div className="mt-3 flex justify-between">
          <h2 className="mb-0 line-clamp-3 text-[15px] font-semibold text-[#454545]">
            {dataItem.label ?? dataItem.title}
          </h2>
        </div>
        {dataItem.seekingVolunteers && !simplified && (
          <div className="flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-[#2B8257]">
                    Seeking volunteers <HiUserGroup className="inline" />
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This group is seeking volunteers or members. Get in touch
                    with them if you'd like to help.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Item)
