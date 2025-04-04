'use client'
import Image from 'next/legacy/image'
import { Link } from 'next-view-transitions'
import Layout from '@components/layout'

interface NewsPost {
  slug: string
  title: string
  date: string
  coverImage?: {
    url: string
  }
  author?: {
    name: string
  }
}

interface NewsProps {
  posts: NewsPost[]
}

export default function News({ posts }: NewsProps) {
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="mb-4 max-w-[850px]">
          <h1 className="mb-3 text-3xl">News</h1>
          <p className="mb-3 text-lg text-gray-600">
            News & updates from the Resilience Web team
          </p>
          <hr className="mb-10" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
            {posts.map((post) => {
              const postDateFormatted = Intl.DateTimeFormat('en-gb', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(new Date(post.date))

              return (
                <Link href={`/news/${post.slug}`} key={post.slug}>
                  <div className="w-full max-w-[445px] cursor-pointer overflow-hidden rounded-md bg-white p-4 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
                    <div className="relative -mx-6 -mt-6 mb-4 h-[210px] bg-gray-100">
                      <Image
                        src={post.coverImage?.url}
                        layout="fill"
                        objectFit="cover"
                        alt={`Image for blog post ${post.title}`}
                      />
                    </div>
                    <div>
                      <h2 className="font-body text-2xl text-gray-700">
                        {post.title}
                      </h2>
                      {/* <p className="text-gray-500">{post.excerpt}</p> */}
                    </div>
                    <div className="mt-4 flex flex-col items-start gap-0">
                      {post.author?.name && (
                        <p className="text-gray-500">{post.author.name}</p>
                      )}
                      <time className="text-gray-500">{postDateFormatted}</time>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
