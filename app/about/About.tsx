'use client'
import Layout from '@components/layout'

export default function About({ page, contentHtml }) {
  return (
    <Layout applyPostStyling>
      <div className="flex justify-center">
        <div className="mb-8 w-[90%] md:w-[650px]">
          <h1 className="mb-8 text-2xl font-bold">{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </Layout>
  )
}
