'use client'
import Layout from '@components/layout'

export default function StaticPage({ title, contentHtml }) {
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="mb-8 w-full max-w-[750px] px-2">
          <h1 className="mb-8 mt-4 text-3xl font-bold">{title}</h1>
          <div
            className="prose prose-sm md:prose-base"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </Layout>
  )
}
