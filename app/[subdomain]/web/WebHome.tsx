'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Web } from '@prisma/client'
import Layout from '@components/layout'
import RichText from '@components/rich-text'
import { Button } from '@components/ui/button'

const WebHome = ({ webData }: { webData: Web }) => {
  return (
    <Layout>
      <div className="w-screen relative h-[400px] mt-[-24px]">
        <Image
          src={webData.image}
          alt={webData.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full md:w-[70%] bg-[#3A8159] mt-[-30px] z-10 p-4 rounded-xl">
        <h1 className="text-3xl text-white">{webData.title} Resilience Web</h1>
      </div>
      <div className="w-full md:w-[70%] mt-6 prose max-w-none">
        <RichText html={webData.description} />
      </div>
      <Link href={`/`}>
        <Button size="lg">Explore {webData.title} Resilience Web</Button>
      </Link>
    </Layout>
  )
}

export default WebHome
