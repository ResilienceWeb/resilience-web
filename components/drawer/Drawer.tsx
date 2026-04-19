'use client'

import { memo } from 'react'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import Image from 'next/image'
import NextLink from 'next/link'
import Link from 'next/link'
import { MultiSelect } from '@components/ui/multi-select'
import { REMOTE_URL } from '@helpers/config'
import DonateButton from '@components/donate-button'
import RichText from '@components/rich-text'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'
import VolunteerSwitch from '@components/volunteer-switch'
import LogoImage from '../../public/logo.png'

interface DrawerProps {
  categories: any[]
  selectedCategories: any[]
  tags: any[]
  selectedTags: any[]
  handleTagSelection: (selected: any) => void
  handleCategorySelection: (selected: any) => void
  handleClearSearchTermValue: () => void
  handleSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleVolunteerSwitchChange: (checked: boolean) => void
  isVolunteer: boolean
  searchTerm: string
  webDescription?: string
  webContactEmail?: string
  webSlug: string
  isTransitionMode?: boolean
}

const Drawer = ({
  categories,
  selectedCategories,
  tags,
  selectedTags,
  handleTagSelection,
  handleCategorySelection,
  handleClearSearchTermValue,
  handleSearchTermChange,
  handleVolunteerSwitchChange,
  isVolunteer,
  searchTerm,
  webDescription,
  webContactEmail,
  isTransitionMode = false,
  webSlug,
}: DrawerProps) => {
  return (
    <div className="fixed z-3 h-screen w-[300px] bg-white shadow-xl">
      <div className="flex h-full flex-col overflow-hidden">
        {/* Tier 1: Logo + Filters (pinned top) */}
        <div className="shrink-0">
          <NextLink href={REMOTE_URL} className="block">
            <div className="my-2 flex cursor-pointer justify-center px-4">
              <Image
                alt="Resilience Web CIC logo"
                src={LogoImage}
                width="268"
                priority
              />
            </div>
          </NextLink>
          <Separator />
          <div className="flex flex-col items-center gap-3 px-2.5 py-4">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                <HiOutlineSearch className="h-5 w-5" />
              </div>
              <Input
                type="text"
                className="h-[38px] pr-10 pl-10"
                onChange={handleSearchTermChange}
                placeholder="Search"
                value={searchTerm}
              />
              {searchTerm !== '' && (
                <button
                  onClick={handleClearSearchTermValue}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label="Clear search input"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="w-full">
              <MultiSelect
                searchable={false}
                onChange={handleCategorySelection}
                options={categories}
                placeholder="Category"
                value={selectedCategories}
              />
            </div>
            {tags.length > 0 && (
              <div className="w-full">
                <MultiSelect
                  searchable={false}
                  onChange={handleTagSelection}
                  options={tags}
                  placeholder="Tag"
                  value={selectedTags}
                />
              </div>
            )}
            {!isTransitionMode && (
              <VolunteerSwitch
                checked={isVolunteer}
                handleSwitchChange={handleVolunteerSwitchChange}
              />
            )}
          </div>
        </div>

        {/* Tier 2: Context + CTA (scrollable middle) */}
        <div className="min-h-0 flex-1 overflow-y-auto border-t px-3 py-4">
          <div className="flex flex-col gap-4">
            {webDescription && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  About this web
                </h3>
                {webDescription.length < 100 ? (
                  <div className="prose prose-sm mt-1">
                    <RichText html={webDescription} />
                  </div>
                ) : (
                  <Link href="/web" className="mt-1 inline-block">
                    <Button variant="outline" size="sm">
                      Read more
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {webContactEmail && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Contact
                </h3>
                <p className="mt-0.5 text-sm">
                  <a
                    href={`mailto:${webContactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {webContactEmail}
                  </a>
                </p>
              </div>
            )}

            {!isTransitionMode && (
              <div>
                <a href={`${REMOTE_URL}/new-listing/${webSlug}`}>
                  <Button variant="outline" className="w-full">
                    Propose new listing
                  </Button>
                </a>
                <p className="mt-1 text-xs text-gray-500">
                  Know a group that isn't listed? Let the maintainers know.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tier 3: Donate (pinned footer, visually quiet) */}
        <div className="shrink-0 border-t bg-gray-50 px-3 py-3">
          <p className="text-xs text-gray-500">
            {isTransitionMode
              ? 'Support the technology behind this with a donation.'
              : 'Help us host and develop Resilience Web.'}
          </p>
          <div className="mt-2">
            <DonateButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Drawer)
