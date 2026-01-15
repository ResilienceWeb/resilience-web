'use client'

import { memo, useMemo } from 'react'
import { FiEdit, FiMapPin, FiNavigation } from 'react-icons/fi'
import { HiArrowLeft, HiUserGroup, HiExternalLink } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { actionTypes, actionIconStyles } from '@helpers/actions'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import { socialMediaPlatforms, socialIconStyles } from '@helpers/socials'
import { sanitizeLink } from '@helpers/utils'
import CategoryTag from '@components/category-tag'
import { MagicBackButton } from '@components/magic-back-button/MagicBackButton'
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
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center gap-2 text-gray-400">
        <FiMapPin className="h-5 w-5 animate-pulse" />
        <span>Loading map…</span>
      </div>
    </div>
  ),
})

function Listing({ listing }) {
  const websiteSanitized = useMemo(
    () => sanitizeLink(listing.website),
    [listing.website],
  )

  const { categories } = useCategoriesPublic({ webSlug: listing.web?.slug })
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
    <div className="w-full max-w-3xl mx-auto px-0 lg:px-8 pb-10">
      <MagicBackButton className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-900 hover:gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200">
          <HiArrowLeft className="h-4 w-4" />
        </span>
        Back to main list
      </MagicBackButton>

      {listing.image && (
        <div className="group relative mb-8 h-[240px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 md:h-[400px]">
          <Image
            src={listing.image}
            alt={`Image for ${listing.title}`}
            sizes="(max-width: 768px) 100vw, 768px"
            fill
            priority
            className="object-contain"
          />
        </div>
      )}

      <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
        <div className="mb-8 border-b border-gray-100 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1
                data-testid="Title"
                className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl"
              >
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`${PROTOCOL}://${listing.web.slug}.${REMOTE_HOSTNAME}?categories=${listing.category.label}`}
                >
                  <CategoryTag
                    colorHex={listing.category.color}
                    className="hover:opacity-90"
                  >
                    {listing.category.label}
                  </CategoryTag>
                </Link>

                {listing.website && (
                  <a
                    href={listingWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <HiExternalLink className="h-3.5 w-3.5" />
                    <span>{websiteSanitized}</span>
                  </a>
                )}

                {listing.seekingVolunteers && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                          <HiUserGroup className="h-3.5 w-3.5" />
                          Seeking volunteers
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-center text-sm">
                          This group is seeking volunteers or members. Get in
                          touch with them if you'd like to help.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {typeof window !== 'undefined' && (
                <ShareButton
                  url={window.location.href}
                  title="Resilience Web"
                  description="Check out this listing on Resilience Web, a place-based visualisation of environmental and social justice groups making the world a better place."
                />
              )}

              {listing.socials &&
                listing.socials.map((social, index) => {
                  const config = socialIconStyles[social.platform.toLowerCase()]
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
                      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full ${config.bgClass} ${config.textClass} ring-1 ${config.ringClass} transition-all hover:shadow-md ${config.hoverBgClass} ${config.hoverTextClass} ${config.hoverRingClass}`}
                    >
                      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    </a>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base">
          <RichText html={listing.description} />
        </div>

        {listing.actions && listing.actions.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Get Involved
            </h3>
            <div className="flex flex-wrap gap-3">
              {listing.actions.map((action, index) => {
                const config = actionIconStyles[action.type.toLowerCase()]
                const actionConfig = actionTypes.find(
                  (a) => a.id === action.type.toLowerCase(),
                )

                if (!actionConfig) {
                  return null
                }

                const Icon = actionConfig.icon

                return (
                  <a
                    key={`action-${index}`}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all ${config.bgClass} ${config.textClass} ring-1 ${config.ringClass} ${config.hoverBgClass} ${config.hoverTextClass} ${config.hoverRingClass}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{actionConfig.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {listing.location?.latitude &&
          listing.location?.longitude &&
          listing.location?.description && (
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Location
              </h3>
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 ring-1 ring-emerald-100">
                      <FiMapPin className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-gray-900">
                      {listing.location.description}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${listing.location.latitude},${listing.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100 transition-all hover:from-emerald-100 hover:to-green-100 hover:shadow-md"
                  >
                    <FiNavigation className="h-4 w-4" />
                    Get Directions
                  </a>
                </div>
                <div className="h-[300px]">
                  <ListingMap
                    latitude={listing.location.latitude}
                    longitude={listing.location.longitude}
                    locationDescription={listing.location.description}
                    hideDescription
                  />
                </div>
              </div>
            </div>
          )}

        {listing.web?.slug && listing.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {listing.tags.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <Link
                  key={tag.id}
                  href={`${PROTOCOL}://${listing.web.slug}.${REMOTE_HOSTNAME}?tags=${urlEncodedTag}`}
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
        )}

        {listing.relations?.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Related Listings
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-8 flex items-center justify-between">
        <MagicBackButton className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-900 hover:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200">
            <HiArrowLeft className="h-4 w-4" />
          </span>
          Back to main list
        </MagicBackButton>

        {listing.web?.slug && (
          <Link href={`${REMOTE_URL}/edit/${listing.web.slug}/${listing.slug}`}>
            <Button variant="purple">
              <FiEdit className="h-5 w-5" />
              Edit Listing
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default memo(Listing)
