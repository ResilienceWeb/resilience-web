'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { HiUserGroup, HiOutlineLink, HiExternalLink } from 'react-icons/hi'
import { toast } from 'sonner'
import { sanitizeLink } from '@helpers/utils'
import { REMOTE_HOSTNAME, PROTOCOL } from '@helpers/config'
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

import { socialMediaPlatforms, socialIconStyles } from '@helpers/socials'
import DescriptionRichText from '@components/main-list/description-rich-text'
import CategoryTag from '@components/category-tag'

interface DialogProps {
  isOpen: boolean
  isMobile?: boolean
  item: any
  onClose: () => void
}

const Dialog = ({ isOpen, isMobile, item, onClose }: DialogProps) => {
  const [subdomain, setSubdomain] = useState<string>()

  const websiteSanitized = useMemo(
    () => sanitizeLink(item.website),
    [item.website],
  )

  const showCopiedToClipboardToast = useCallback(() => {
    toast.info('Copied to clipboard', {
      description:
        'The link to this listing is copied to your clipboard and ready to be shared.',
      duration: 4000,
    })
  }, [])

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const individualListingLink = `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}/${item.slug}`
  const handleShareButtonClick = useCallback(() => {
    void navigator.clipboard.writeText(individualListingLink)
    showCopiedToClipboardToast()
  }, [showCopiedToClipboardToast, individualListingLink])

  console.log(item)

  const socialLinks = (
    <>
      <div className="mt-2 flex items-center gap-2">
        {item.socials &&
          item.socials.map((social, index) => {
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
                className={`group inline-flex h-10 w-10 items-center justify-center rounded-full ${config.bgClass} ${config.textClass} ring-1 ${config.ringClass} transition-all ${config.hoverBgClass} ${config.hoverTextClass} ${config.hoverRingClass}`}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            )
          })}
        {item.seekingVolunteers && (
          <div className="ml-2 flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-[#2B8257]">
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
    </>
  )

  const listingWebsite = useMemo(() => {
    if (!item?.website) {
      return null
    }

    if (item.website.includes('http')) {
      return item.website
    }

    return `//${item.website}`
  }, [item.website])

  const searchParams = useSearchParams()
  const webSearchParam = searchParams.get('web')

  return (
    <DialogPrimitive open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[672px]">
        {item.image && (
          <div className="relative -mx-6 -mt-6 h-[300px] min-h-[300px] w-full overflow-hidden sm:w-[calc(100%+48px)]">
            <Image
              alt={`${item.label} cover image`}
              src={item.image}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              style={{
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        <DialogHeader className="flex items-center pb-0">
          <DialogTitle className="flex items-center">
            {item.label}
            <HiOutlineLink
              className="ml-1 cursor-pointer text-xl transition-colors duration-200 hover:text-[#2B8257]"
              onClick={handleShareButtonClick}
            />
          </DialogTitle>
        </DialogHeader>

        <div>
          <div className="flex justify-between">
            <CategoryTag colorHex={item.category.color}>
              {item.category.label}
            </CategoryTag>
          </div>
          <br />

          {item.website && (
            <div className="flex items-start gap-1">
              <p className="font-semibold text-gray-700">Website:</p>
              <a
                href={listingWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-blue-400 hover:text-blue-500"
              >
                <span>{websiteSanitized}</span>
                <HiExternalLink />
              </a>
            </div>
          )}

          {isMobile && (
            <div className="mt-4 flex justify-between">{socialLinks}</div>
          )}

          <div className="my-4">
            <DescriptionRichText html={item.description} />
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-1">
            {item.tags?.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <Link
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?web=${webSearchParam}&tags=${urlEncodedTag}`}
                  onClick={onClose}
                >
                  <Badge
                    className="transition-opacity select-none hover:opacity-80"
                    style={{ backgroundColor: tag.color ?? '#797d7a' }}
                    clickable
                  >
                    #{tag.label}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>

        {!isMobile && (
          <div className="flex justify-between border-t pt-3">
            {socialLinks}

            <Link href={individualListingLink}>
              <Button
                variant="default"
                className="mt-2 bg-[#2B8257] hover:bg-[#236c47]"
              >
                Go to listing
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </DialogPrimitive>
  )
}

export default memo(Dialog)
