'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Web, WebLocation } from '@prisma-client'
import { ArrowRight, MapPin, Mail } from 'lucide-react'
import Layout from '@components/layout'
import RichText from '@components/rich-text'
import { Button } from '@components/ui/button'

interface WebHomeProps {
  webData: Web & {
    location?: WebLocation | null
  }
  listingsCount: number
  categoriesCount: number
}

const WebHome = ({
  webData,
  listingsCount,
  categoriesCount,
}: WebHomeProps) => {
  const heading = `${webData.title} Resilience Web`
  const hasInfo = Boolean(webData.location || webData.contactEmail)

  return (
    <Layout>
      {webData.image ? (
        <header className="relative -mt-4 h-[clamp(240px,42vw,420px)] w-full overflow-hidden rounded-b-2xl [margin-inline:calc(50%-50vw)] md:rounded-b-3xl">
          <Image
            src={webData.image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Dark scrim anchors the title with WCAG-safe contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-4 pb-4">
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-white drop-shadow-sm md:text-4xl">
                {heading}
              </h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="-mt-4 bg-primary py-10 [margin-inline:calc(50%-50vw)]">
          <div className="mx-auto max-w-6xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-white md:text-4xl">
              {heading}
            </h1>
          </div>
        </header>
      )}

      <div className="mt-8 flex w-full flex-col gap-8 md:flex-row md:gap-12">
        <div className="min-w-0 md:flex-1">
          {(listingsCount > 0 || categoriesCount > 0) && (
            <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">
                  {listingsCount}
                </strong>{' '}
                {listingsCount === 1 ? 'group' : 'groups'}
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="font-semibold text-foreground">
                  {categoriesCount}
                </strong>{' '}
                {categoriesCount === 1 ? 'category' : 'categories'}
              </span>
            </p>
          )}

          <RichText className="prose max-w-[68ch]" html={webData.description} />

          <div className="mt-8">
            <Button asChild size="lg" className="group">
              <Link href="/">
                Explore {webData.title} Resilience Web
                <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </Button>
          </div>
        </div>

        {hasInfo && (
          <aside className="order-first md:order-none md:w-72 md:shrink-0 lg:w-80">
            <dl className="flex flex-col gap-5 rounded-xl border border-primary/10 bg-primary/5 p-5">
              {webData.location && (
                <div className="flex gap-3">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold text-[var(--primary-green)]">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {webData.location.description}
                    </dd>
                  </div>
                </div>
              )}


              {webData.contactEmail && (
                <div className="flex gap-3">
                  <Mail
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold text-[var(--primary-green)]">
                      Contact
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${webData.contactEmail}`}
                        className="rounded-sm text-sm font-medium break-words text-[var(--primary-green)] underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                      >
                        {webData.contactEmail}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </aside>
        )}
      </div>
    </Layout>
  )
}

export default WebHome
