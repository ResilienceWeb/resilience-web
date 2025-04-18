'use client'

import NextLink from 'next/link'
import { memo } from 'react'
import Select from 'react-select'
import Image from 'next/legacy/image'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

import VolunteerSwitch from '@components/volunteer-switch'
import DonateButton from '@components/donate-button'
import customMultiSelectStyles from '@styles/select-styles'
import { REMOTE_URL } from '@helpers/config'
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
  isTransitionMode = false,
}: DrawerProps) => {
  return (
    <div className="fixed z-3 h-screen w-[300px] bg-white shadow-xl">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-4">
          <NextLink href={REMOTE_URL} className="block">
            <div className="my-2 flex cursor-pointer justify-center px-4">
              <Image
                alt="Resilience Web CIC logo"
                src={LogoImage}
                width="306"
                height="104"
                unoptimized
              />
            </div>
          </NextLink>
          <Separator />
          {!isTransitionMode && (
            <>
              <div className="p-4">
                <a
                  href="/new-listing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full bg-[#2B8257] hover:bg-[#236c47]"
                  >
                    Propose new listing
                  </Button>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Know something that isn't yet listed? Let us know! 🙏
                </p>
              </div>
              <Separator />
            </>
          )}
          <div className="my-5 flex flex-col items-center gap-5">
            <div className="relative w-full max-w-[280px]">
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
            <div className="w-full max-w-[280px]">
              <Select
                id="category-select"
                isMulti
                isSearchable={false}
                menuPortalTarget={document.body}
                onChange={handleCategorySelection}
                options={categories}
                placeholder="Category"
                styles={customMultiSelectStyles}
                value={selectedCategories}
              />
            </div>
            {tags.length > 0 && (
              <div className="w-full max-w-[280px]">
                <Select
                  id="tag-select"
                  isMulti
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  onChange={handleTagSelection}
                  options={tags}
                  placeholder="Tag"
                  styles={customMultiSelectStyles}
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
          {webDescription && (
            <>
              <Separator />
              <div className="mx-2 mt-5">
                <h2 className="text-xl font-semibold">About this web</h2>
                <p className="text-[0.9375rem] text-gray-600">
                  {webDescription}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="shrink-0 border-t bg-white p-4">
          <h2 className="text-xl font-semibold">Like what you see?</h2>
          {isTransitionMode ? (
            <p className="mb-3 text-gray-600">
              If you can, please support the technology behind this with a small
              donation.
            </p>
          ) : (
            <p className="mb-3 text-gray-600">
              Consider making a donation to help us host and develop the
              Resilience Web platform 🙏🏼
            </p>
          )}
          <DonateButton />
        </div>
      </div>
    </div>
  )
}

export default memo(Drawer)
