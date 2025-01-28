'use client'
import Layout from '@components/layout'

export default function About({ page, contentHtml }) {
  return (
    <Layout applyPostStyling>
      <div className="flex justify-center">
        <div className="mb-8 w-full max-w-[650px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-2xl font-bold">{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </Layout>
  )
}
