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
      <div className="mt-4 w-full md:min-w-[684px] md:max-w-[700px]">
        <button
          onClick={goBack}
          className="mb-2 ml-2 flex items-center text-gray-700 hover:text-gray-600"
        >
          <HiArrowLeft className="mr-2" />
          Back to main list
        </button>

        {listing.image && (
          <div className="relative h-[250px] w-screen overflow-hidden md:h-[400px] md:w-[700px] md:rounded-lg">
            <Image
              src={listing.image}
              alt={`Image for ${listing.title}`}
              sizes="(max-width: 768px) 100vw, 700px"
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        <div className="px-4 md:px-2">
          <div className="mb-6 w-full py-4 md:mb-10 md:flex">
            <div className="flex w-full flex-col justify-between">
              <h1 data-testid="Title" className="text-2xl font-bold">
                {listing.title}
              </h1>

              <div className="mt-8 flex w-full justify-between">
                <div>
                  <CategoryTag colorHex={listing.category.color}>
                    {listing.category.label}
                  </CategoryTag>
                  {listing.seekingVolunteers && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="flex items-center text-[#2B8257]">
                            <HiUserGroup className="mr-1" /> Seeking volunteers
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This group is seeking volunteers or members. Get in
                            touch with them if you'd like to help.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <div className="flex space-x-4">
                  {listing.website && (
                    <a
                      href={listingWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 transition-colors duration-150 hover:text-gray-500"
                    >
                      <SlGlobe className="h-8 w-8" />
                    </a>
                  )}
                  {listing.facebook && (
                    <a
                      href={listing.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 transition-colors duration-150 hover:text-gray-500"
                    >
                      <FaFacebook className="h-8 w-8" />
                    </a>
                  )}
                  {listing.twitter && (
                    <a
                      href={listing.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 transition-colors duration-150 hover:text-gray-500"
                    >
                      <FaTwitter className="h-8 w-8" />
                    </a>
                  )}
                  {listing.instagram && (
                    <a
                      href={listing.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 transition-colors duration-150 hover:text-gray-500"
                    >
                      <FaInstagram className="h-8 w-8" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
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

          <div className="mb-8 mt-8 flex flex-wrap justify-end gap-1">
            {listing.tags?.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <NextLink
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?tags=${urlEncodedTag}`}
                >
                  <Badge
                    className="cursor-pointer select-none transition-opacity hover:opacity-90"
                    style={{ backgroundColor: tag.color ?? '#718096' }}
                  >
                    #{tag.label}
                  </Badge>
                </NextLink>
              )
            })}
          </div>

          {listing.relations?.length > 0 && (
            <>
              <h2 className="mb-4 text-xl font-bold">Related listings</h2>
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {listing.relations.map((relatedListing) => (
                  <Item
                    categoriesIndexes={categoriesIndexes}
                    dataItem={relatedListing}
                    key={relatedListing.id}
                    simplified
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={goBack}
          className="mb-4 flex items-center text-gray-700 hover:text-gray-600"
        >
          <HiArrowLeft className="mr-2" />
          Back to main list
        </button>
      </div>

      <div className="fixed bottom-8 right-8 z-10">
        <a
          href={`${REMOTE_URL}/edit/${subdomain}/${listing.slug}`}
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-blue-500 text-2xl text-white transition-colors hover:bg-blue-600"
        >
          <FiEdit />
        </a>
      </div>
    </>
  )
}

export default memo(Listing)
