import { REMOTE_URL } from '@helpers/config'

function generateSiteMap(items) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://resilienceweb.org.uk</loc>
     </url>
     <url>
       <loc>https://resilienceweb.org.uk/about</loc>
     </url>
     <url>
      <loc>https://resilienceweb.org.uk/news</loc>
     </url>
     ${items
       .map((item) => {
         return `
       <url>
           <loc>${item.loc}</loc>
           <lastmod>${item.lastmod}</lastmod>
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const response = await fetch(`${REMOTE_URL}/api/listings`)
  const data = await response.json()
  const { listings } = data
  const pathItems = listings
    .filter((l) => l.web.published === true)
    .filter((l) => l.image !== null)
    .filter((l) => l.description !== '')
    .map((l) => ({
      loc: `https://${l.web.slug}.resilienceweb.org.uk/${l.slug}`,
      lastmod: l.updatedAt,
    }))

  const sitemap = generateSiteMap(pathItems)

  res.setHeader('Content-Type', 'text/xml')
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
