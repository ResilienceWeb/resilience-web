import { memo, useState, useMemo } from 'react'
import { HiOutlineSearch, HiHome, HiOutlineX } from 'react-icons/hi'
import Select from 'react-select'
import Image from 'next/legacy/image'
import NextLink from 'next/link'
import customMultiSelectStyles from '@styles/select-styles'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { cn } from '@components/lib/utils'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'

type HeaderProps = {
  categories: any
  selectedCategories: any
  tags: any
  selectedTags: any
  handleCategorySelection: any
  handleSearchTermChange: any
  handleTagSelection: any
  handleClearSearchTermValue: any
  hasEvents: boolean
  isGeoMappingEnabled: boolean
  isMobile: boolean
  isWebMode: boolean
  searchTerm: string
  selectedWebName: string
  activeTab?: string
  onTabChange?: (value: string) => void
}

const Header = ({
  categories,
  selectedCategories,
  tags,
  selectedTags,
  handleCategorySelection,
  handleSearchTermChange,
  handleTagSelection,
  handleClearSearchTermValue,
  hasEvents,
  isGeoMappingEnabled,
  isMobile,
  isWebMode,
  searchTerm,
  selectedWebName,
  activeTab,
  onTabChange,
}: HeaderProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab)

  const handleTabChange = (value) => {
    setCurrentTab(value)
    if (onTabChange) {
      onTabChange(value)
    }
  }

  const tabCount = useMemo(() => {
    let tabCount = 2

    if (isGeoMappingEnabled) {
      tabCount += 1
    }

    if (hasEvents) {
      tabCount += 1
    }

    return tabCount
  }, [hasEvents, isGeoMappingEnabled])

  if (isMobile) {
    return (
      <>
        <NextLink href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
          <Button variant="outline" size="sm" className="mt-2 ml-2">
            <HiHome />
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

          <div className="mt-6 w-[95%] pt-2">
            <div className="flex flex-col gap-2">
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
                    <HiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-lg text-gray-500" />
                    <Input
                      onChange={handleSearchTermChange}
                      placeholder="Search"
                      value={searchTerm}
                      className="size-sm h-[38px] w-full pl-10 text-sm"
                    />
                    {searchTerm !== '' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClearSearchTermValue()}
                        className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
                      >
                        <HiOutlineX className="h-4 w-4" />
                        <span className="sr-only">Clear search input</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
              {tags.length > 0 && (
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
              )}
              <div className="w-full pb-2">
                <Tabs
                  defaultValue="list"
                  value={currentTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList
                    className={cn('grid', 'w-full', `grid-cols-${tabCount}`)}
                  >
                    <TabsTrigger
                      value="web"
                      className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                    >
                      Web
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                    >
                      List
                    </TabsTrigger>
                    {isGeoMappingEnabled && (
                      <TabsTrigger
                        value="map"
                        className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                      >
                        Map
                      </TabsTrigger>
                    )}
                    {hasEvents && (
                      <TabsTrigger
                        value="events"
                        className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                      >
                        Events
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div>
      <header className="flex w-full flex-col bg-white">
        <div className="flex h-14 w-full items-center px-4">
          <div className="flex w-full space-x-2">
            <h2 className="px-[10px] text-[1.75rem] font-bold">
              {selectedWebName}
            </h2>
          </div>

          <NextLink href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
            <Button variant="outline" size="sm">
              <HiHome />
              Homepage
            </Button>
          </NextLink>
        </div>
        <div className="w-full px-4 pb-2">
          <Tabs
            defaultValue="web"
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className={cn('grid', 'w-full', `grid-cols-${tabCount}`)}>
              <TabsTrigger
                value="web"
                className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                Web
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                List
              </TabsTrigger>
              {isGeoMappingEnabled && (
                <TabsTrigger
                  value="map"
                  className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  Map
                </TabsTrigger>
              )}
              {hasEvents && (
                <TabsTrigger
                  value="events"
                  className="font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  Events
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </header>
    </div>
  )
}

export default memo(Header)
