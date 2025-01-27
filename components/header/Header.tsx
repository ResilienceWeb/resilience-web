import { memo } from 'react'
import NextLink from 'next/link'
import Select from 'react-select'
import Image from 'next/legacy/image'
import { HiOutlineSearch, HiHome, HiOutlineX } from 'react-icons/hi'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import ModeSwitch from '@components/mode-switch'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import customMultiSelectStyles from '@styles/select-styles'
import { cn } from '@components/lib/utils'

const Header = ({
  categories,
  selectedCategories,
  tags,
  selectedTags,
  handleCategorySelection,
  handleSearchTermChange,
  handleSwitchChange,
  handleTagSelection,
  handleClearSearchTermValue,
  isMobile,
  isWebMode,
  searchTerm,
  selectedWebName,
}) => {
  if (isMobile) {
    return (
      <>
        <NextLink href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
          <Button
            variant="default"
            size="sm"
            className="ml-2 mt-2 bg-blue-600 hover:bg-blue-700"
          >
            <HiHome className="mr-2 h-4 w-4" />
            Homepage
          </Button>
        </NextLink>
        <div className="flex flex-col items-center justify-center">
          <div className="my-4">
            <Image
              alt="Resilience Web CIC logo"
              src="/logo.png"
              width="306"
              height="104"
              unoptimized
            />
          </div>
          <h2 className="relative text-4xl font-bold">
            <span className="relative z-10 after:absolute after:bottom-0 after:left-0 after:z-[-1] after:h-[23%] after:w-full after:bg-[#2B8257]">
              {selectedWebName}
            </span>
          </h2>
          <div className="w-[95%] pt-4">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <div
                  className={cn(
                    'w-full',
                    isWebMode
                      ? 'max-w-[250px]'
                      : isMobile
                        ? 'w-full'
                        : 'max-w-[300px]',
                  )}
                >
                  <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-500" />
                    <Input
                      onChange={handleSearchTermChange}
                      placeholder="Search"
                      value={searchTerm}
                      className="h-[38px] w-full bg-white pl-10 placeholder:text-gray-500"
                    />
                    {searchTerm !== '' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClearSearchTermValue()}
                        className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
                      >
                        <HiOutlineX className="h-4 w-4" />
                        <span className="sr-only">Clear search input</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full">
                <Select
                  isMulti
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  onChange={handleCategorySelection}
                  options={categories}
                  placeholder="Filter by category"
                  styles={customMultiSelectStyles}
                  value={selectedCategories}
                />
              </div>
              {tags.length > 0 && (
                <div className="w-full">
                  <Select
                    isMulti
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    onChange={handleTagSelection}
                    options={tags}
                    placeholder="Filter by tag"
                    styles={customMultiSelectStyles}
                    value={selectedTags}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="transition-all duration-300 ease-in-out">
      <header className="flex h-14 w-full items-center bg-white px-4">
        <div className="flex w-full space-x-2">
          <h2 className="px-[10px] text-[1.75rem] font-bold">
            {selectedWebName}
          </h2>
        </div>
        <ModeSwitch
          checked={isWebMode}
          handleSwitchChange={handleSwitchChange}
        />
        <NextLink href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 px-6 hover:bg-blue-700"
          >
            <HiHome className="mr-2 h-4 w-4" />
            Homepage
          </Button>
        </NextLink>
      </header>
    </div>
  )
}

export default memo(Header)
