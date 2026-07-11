'use client'

import { useEffect, useState, memo } from 'react'
import { FaStar } from 'react-icons/fa'
import { HiUserGroup } from 'react-icons/hi'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
  const { subdomain } = useParams<{ subdomain: string }>()
  const [isWithinAFewSecondsOfRender, setIsWithinAFewSecondsOfRender] =
    useState<boolean>(true)
  const { ref, inView } = useInView()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsWithinAFewSecondsOfRender(false)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [])

  const listingHref = isBranchDeploy()
    ? `/${subdomain}/${dataItem.slug}`
    : `/${dataItem.slug}`

  const categoryBackgroundColor = chroma(dataItem.category.color)
    .alpha(0.5)
    .css()

  const categoryIndex = categoriesIndexes?.[dataItem.category.label]

  // Frozen at mount so the featured check stays pure during render
  const [now] = useState(() => Date.now())
  const isFeatured =
    Boolean(dataItem.featured) && new Date(dataItem.featured).getTime() > now

  return (
    <Link
      href={listingHref}
      className="animate-in fade-in slide-in-from-bottom motion-reduce:animate-none relative block h-fit rounded-md bg-white shadow-md transition-all duration-200 ease-out hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      ref={ref}
    >
      {isFeatured && (
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
        iconName={dataItem.category.icon}
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
                  <p className="text-sm text-primary">
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
    </Link>
  )
}

export default memo(Item)
