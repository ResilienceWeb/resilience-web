'use client'

import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { FiEdit } from 'react-icons/fi'
import { SlGlobe } from 'react-icons/sl'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'
import { Badge } from '@components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

import DescriptionRichText from '@components/main-list/description-rich-text'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import CategoryTag from '@components/category-tag'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import Item from '@components/main-list/item'

const ListingMap = dynamic(() => import('./listing-map'), {
  ssr: false,
  loading: () => <div className="pt-5 text-center">Loading…</div>,
})

interface ListingProps {
  listing: any // TODO: Add proper type
}

function Listing({ listing }: ListingProps) {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const goBack = useCallback(() => {
    const referrer = document.referrer
    if (referrer.includes('google') || referrer.includes('bing')) {
      router.push(`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`)
    } else {
      router.push('/')
    }
  }, [router, subdomain])

  const { categories } = useCategoriesPublic({ webSlug: subdomain })
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  const listingWebsite = useMemo(() => {
    if (!listing?.website) {
      return null
    }

    if (listing.website.includes('http')) {
      return listing.website
    }

    return `//${listing.website}`
  }, [listing.website])

  return (
    <>
      <div className="mt-4 w-full sm:px-6 md:w-[700px] lg:px-8">
        <button
          onClick={goBack}
          className="group mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to main list
        </button>

        {listing.image && (
          <div className="group relative mb-8 h-[300px] w-full overflow-hidden rounded-xl bg-gray-50 md:h-[450px]">
            <Image
              src={listing.image}
              alt={`Image for ${listing.title}`}
              sizes="(max-width: 768px) 100vw, 700px"
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <div>
          <div className="mb-10 w-full space-y-6">
            <div className="flex w-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <h1
                  data-testid="Title"
                  className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl"
                >
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex items-center gap-2">
                    <CategoryTag colorHex={listing.category.color}>
                      {listing.category.label}
                    </CategoryTag>
                    {listing.seekingVolunteers && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="group flex items-center gap-1.5 rounded-full bg-green-50/80 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-100/80 transition-colors hover:bg-green-100">
                              <HiUserGroup className="h-3.5 w-3.5" />
                              Seeking volunteers
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-[200px]"
                          >
                            <p className="text-center text-sm">
                              This group is seeking volunteers or members. Get
                              in touch with them if you'd like to help.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {listing.website && (
                  <a
                    href={listingWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-gray-200/50 transition-all hover:bg-gray-100 hover:text-gray-700 hover:ring-gray-300"
                  >
                    <SlGlobe className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
                {listing.facebook && (
                  <a
                    href={listing.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#1877F2]/70 ring-1 ring-blue-100/50 transition-all hover:bg-blue-100 hover:text-[#1877F2] hover:ring-blue-200"
                  >
                    <FaFacebook className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
                {listing.twitter && (
                  <a
                    href={listing.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-[#1DA1F2]/70 ring-1 ring-sky-100/50 transition-all hover:bg-sky-100 hover:text-[#1DA1F2] hover:ring-sky-200"
                  >
                    <FaTwitter className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
                {listing.instagram && (
                  <a
                    href={listing.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#E4405F]/70 ring-1 ring-pink-100/50 transition-all hover:bg-pink-100 hover:text-[#E4405F] hover:ring-pink-200"
                  >
                    <FaInstagram className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-headings:font-semibold prose-a:text-blue-600 mb-12 max-w-none">
            <DescriptionRichText html={listing.description} />
          </div>

          {listing.location?.latitude &&
            listing.location?.longitude &&
            listing.location?.description && (
              <ListingMap
                latitude={listing.location.latitude}
                longitude={listing.location.longitude}
                locationDescription={listing.location.description}
              />
            )}

          <div className="mb-12 flex flex-wrap justify-end gap-2">
            {listing.tags?.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <NextLink
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?tags=${urlEncodedTag}`}
                >
                  <Badge
                    className="cursor-pointer select-none px-2.5 py-0.5 text-xs font-medium tracking-wide transition-all hover:opacity-90"
                    style={{ backgroundColor: tag.color ?? '#718096' }}
                  >
                    #{tag.label}
                  </Badge>
                </NextLink>
              )
            })}
          </div>

          {listing.relations?.length > 0 && (
            <div className="mb-12 overflow-hidden">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900">
                Related listings
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {listing.relations.map((relatedListing) => (
                  <Item
                    categoriesIndexes={categoriesIndexes}
                    dataItem={relatedListing}
                    key={relatedListing.id}
                    simplified
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={goBack}
          className="group mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to main list
        </button>
      </div>

      <div className="fixed bottom-8 right-8 z-10">
        <a
          href={`${REMOTE_URL}/edit/${subdomain}/${listing.slug}`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg text-white shadow-lg ring-1 ring-blue-900/10 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:ring-blue-900/20"
        >
          <FiEdit className="transition-transform group-hover:scale-110" />
        </a>
      </div>
    </>
  )
}

export default memo(Listing)
