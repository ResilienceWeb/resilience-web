import { memo } from 'react'
import { HiOutlineSearch, HiHome, HiOutlineX, HiPlus } from 'react-icons/hi'
import Image from 'next/image'
import NextLink from 'next/link'
import { Share2, List, MapPin, CalendarDays } from 'lucide-react'
import { REMOTE_URL } from '@helpers/config'
import { cn } from '@components/lib/utils'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { MultiSelect } from '@components/ui/multi-select'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import LogoImage from '../../public/logo.png'

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
  isTransitionMode?: boolean
  searchTerm: string
  selectedWebName: string
  selectedWebSlug?: string
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
  isTransitionMode,
  searchTerm,
  selectedWebName,
  selectedWebSlug,
  activeTab,
  onTabChange,
}: HeaderProps) => {
  const handleTabChange = (value: string) => {
    onTabChange?.(value)
  }

  const colsClass = (() => {
    if (hasEvents && isGeoMappingEnabled) return 'grid-cols-4'
    if (hasEvents || isGeoMappingEnabled) return 'grid-cols-3'
    return 'grid-cols-2'
  })()

  if (isMobile) {
    return (
      <>
        <div className="mt-2 flex items-center justify-between px-2">
          <NextLink href={REMOTE_URL}>
            <Button variant="outline" size="sm">
              <HiHome />
              Homepage
            </Button>
          </NextLink>
          {!isTransitionMode && (
            <NextLink href={`${REMOTE_URL}/new-listing/${selectedWebSlug}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <HiPlus />
                Propose listing
              </Button>
            </NextLink>
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="my-4">
            <Image
              alt="Resilience Web CIC logo"
              src={LogoImage}
              width="268"
              unoptimized
            />
          </div>
          <h2 className="relative text-4xl font-bold">
            <span className="relative z-10 after:absolute after:bottom-0 after:left-0 after:z-[-1] after:h-[23%] after:w-full after:bg-primary">
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
              <MultiSelect
                searchable={false}
                onChange={handleCategorySelection}
                options={categories}
                placeholder="Filter by category"
                value={selectedCategories}
              />
              {tags.length > 0 && (
                <MultiSelect
                  searchable={false}
                  onChange={handleTagSelection}
                  options={tags}
                  placeholder="Filter by tag"
                  value={selectedTags}
                />
              )}
              <div className="w-full pb-2">
                <Tabs
                  defaultValue="list"
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className={cn('grid w-full', colsClass)}>
                    <TabsTrigger
                      value="web"
                      className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Web
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                    >
                      <List className="h-3.5 w-3.5" />
                      List
                    </TabsTrigger>
                    {isGeoMappingEnabled && (
                      <TabsTrigger
                        value="map"
                        className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Map
                      </TabsTrigger>
                    )}
                    {hasEvents && (
                      <TabsTrigger
                        value="events"
                        className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
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

          <NextLink href={REMOTE_URL}>
            <Button variant="outline" size="sm">
              <HiHome />
              Homepage
            </Button>
          </NextLink>
        </div>
        <div className="w-full px-4 pb-2">
          <Tabs
            defaultValue="web"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className={cn('grid w-full', colsClass)}>
              <TabsTrigger
                value="web"
                className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                <Share2 className="h-3.5 w-3.5" />
                Web
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                <List className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              {isGeoMappingEnabled && (
                <TabsTrigger
                  value="map"
                  className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Map
                </TabsTrigger>
              )}
              {hasEvents && (
                <TabsTrigger
                  value="events"
                  className="gap-1.5 font-semibold hover:text-green-700 data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
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
