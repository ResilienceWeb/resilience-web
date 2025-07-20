'use client'

import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import { FiEdit } from 'react-icons/fi'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'
import { SlGlobe } from 'react-icons/sl'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import { socialMediaPlatforms, socialIconStyles } from '@helpers/socials'
import CategoryTag from '@components/category-tag'
import Item from '@components/main-list/item'
import RichText from '@components/rich-text'
import ShareButton from '@components/share-button'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'

const ListingMap = dynamic(() => import('@components/listing-map'), {
  ssr: false,
  loading: () => <div className="pt-5 text-center">Loading…</div>,
})

function Listing({ listing }) {
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
      router.back()
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
      <div className="w-full sm:px-6 md:w-[700px] lg:px-8">
        <button
          onClick={goBack}
          className="group mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to main list
        </button>

        {listing.image && (
          <div className="group relative mb-4 h-[200px] w-full overflow-hidden rounded-xl bg-gray-100 md:h-[350px]">
            <Image
              src={listing.image}
              alt={`Image for ${listing.title}`}
              sizes="(max-width: 768px) 100vw, 700px"
              fill
              priority
              className="object-contain"
            />
          </div>
        )}

        <div>
          <div className="mb-10 w-full space-y-6">
            <div className="flex w-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <h1
                  data-testid="Title"
                  className="text-3xl leading-tight font-bold tracking-tight text-gray-900 md:text-4xl"
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
                {typeof window !== 'undefined' && (
                  <ShareButton
                    url={window.location.href}
                    title="Resilience Web"
                    description="Check out this listing on Resilience Web, a place-based visualisation of environmental and social justice groups making the world a better place."
                  />
                )}
                {listing.website && (
                  <a
                    href={listingWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-gray-200/50 transition-all hover:bg-gray-100 hover:text-gray-700 hover:ring-gray-300"
                  >
                    <SlGlobe className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </a>
                )}
                {listing.socials &&
                  listing.socials.map((social, index) => {
                    const config =
                      socialIconStyles[social.platform.toLowerCase()]

                    const Icon = socialMediaPlatforms.find(
                      (p) => p.id === social.platform.toLowerCase(),
                    )?.icon

                    if (!Icon) {
                      return null
                    }

                    return (
                      <a
                        key={`social-${index}`}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group inline-flex h-10 w-10 items-center justify-center rounded-full ${config.bgClass} ${config.textClass} ring-1 ${config.ringClass} transition-all ${config.hoverBgClass} ${config.hoverTextClass} ${config.hoverRingClass}`}
                      >
                        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </a>
                    )
                  })}
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-headings:font-semibold prose-a:text-blue-600 mb-12 max-w-none">
            <RichText html={listing.description} />
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
                <Link
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?tags=${urlEncodedTag}`}
                >
                  <Badge
                    className="cursor-pointer px-2.5 py-0.5 text-xs font-medium tracking-wide transition-all select-none hover:opacity-90"
                    style={{ backgroundColor: tag.color ?? '#718096' }}
                  >
                    #{tag.label}
                  </Badge>
                </Link>
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

        <div className="w-full mb-8 flex justify-between">
          <button
            onClick={goBack}
            className="group mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to main list
          </button>

          <Link href={`${REMOTE_URL}/edit/${subdomain}/${listing.slug}`}>
            <Button variant="purple">
              <FiEdit className="h-5 w-5" />
              Edit Listing
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default memo(Listing)
