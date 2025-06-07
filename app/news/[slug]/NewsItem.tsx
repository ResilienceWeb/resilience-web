'use client'

import Image from 'next/image'
import Layout from '@components/layout'
import SignupForm from '@components/signup-form'

interface NewsItemProps {
  post: {
    title: string
    date: string
    author?: {
      name: string
    }
    coverImage?: {
      url: string
    }
  }
  contentHtml: string
}

export default function NewsItem({ post, contentHtml }: NewsItemProps) {
  const postDateFormatted = Intl.DateTimeFormat('en-gb', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.date))

  return (
    <Layout applyPostStyling>
      <h1 className="text-center text-pretty">{post.title}</h1>
      <div className="mx-auto mt-2 mb-6 flex w-[90%] justify-center md:w-[650px]">
        {post.author?.name && (
          <p className="font-semibold">
            {post.author.name}
            <span className="mx-1">•</span>
          </p>
        )}
        <time>{postDateFormatted}</time>
      </div>

      {post.coverImage?.url && (
        <div className="relative -mx-4 mb-8 h-[250px] w-screen overflow-hidden md:h-[400px] md:w-[850px] md:rounded-xl">
          <Image
            alt={`Cover image for post: ${post.title}`}
            src={post.coverImage.url}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 850px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mx-auto mb-12 max-w-[100%] md:max-w-[650px]">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      <div className="mx-4 mb-8">
        <p className="mb-2 font-semibold">
          Sign up to our mailing list to stay up to date
        </p>
        <SignupForm />
      </div>
    </Layout>
  )
}
