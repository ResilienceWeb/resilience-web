'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Web, WebLocation } from '@prisma/client'
import Layout from '@components/layout'
import RichText from '@components/rich-text'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'

interface WebHomeProps {
  webData: Web & {
    location?: WebLocation | null
  }
}

const WebHome = ({ webData }: WebHomeProps) => {
  return (
    <Layout>
      {webData.image && (
        <>
          <div className="w-screen relative h-[400px] mt-[-24px]">
            <Image
              src={webData.image}
              alt={webData.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="w-full bg-[#3A8159] mt-[-30px] z-10 p-4 rounded-xl">
            <h1 className="text-3xl text-white">
              {webData.title} Resilience Web
            </h1>
          </div>
        </>
      )}

      {!webData.image && (
        <h1 className="text-3xl">{webData.title} Resilience Web</h1>
      )}

      {/* Mobile layout - location and contact at top */}
      <div className="md:hidden mt-6">
        <div className="w-full flex flex-col gap-4">
          {webData.location && (
            <div>
              <h3 className="text-xl">Location</h3>
              <p className="text-md">{webData.location.description}</p>
            </div>
          )}

          {webData.contactEmail && (
            <div>
              <h3 className="text-xl">Contact Email</h3>
              <a
                href={`mailto:${webData.contactEmail}`}
                className="text-md text-green-800 hover:underline"
              >
                {webData.contactEmail}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Desktop and mobile layout for main content */}
      <div className="flex flex-col md:flex-row mt-6">
        <div className="w-full md:w-2/3 prose max-w-none md:pr-8">
          <RichText html={webData.description} textSize="medium" />

          <div className="mt-8">
            <Link href={`/`}>
              <Button size="lg">Explore {webData.title} Resilience Web</Button>
            </Link>
          </div>
        </div>

        {/* Vertical separator - only visible on desktop */}
        <div className="hidden md:block">
          <Separator orientation="vertical" className="h-full mx-4" />
        </div>

        {/* Desktop layout for location and contact */}
        <div className="hidden md:flex md:w-1/3 flex-col gap-4">
          {webData.location && (
            <div>
              <h3 className="text-xl">Location</h3>
              <p className="text-md">{webData.location.description}</p>
            </div>
          )}

          {webData.contactEmail && (
            <div>
              <h3 className="text-xl">Contact Email</h3>
              <a
                href={`mailto:${webData.contactEmail}`}
                className="text-md text-green-800 hover:underline"
              >
                {webData.contactEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default WebHome
