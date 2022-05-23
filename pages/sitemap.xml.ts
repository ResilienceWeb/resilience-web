import { REMOTE_URL } from '@helpers/config'

function generateSiteMap(paths) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://resilienceweb.org.uk</loc>
     </url>
     <url>
       <loc>https://resilienceweb.org.uk/about</loc>
     </url>
     <url>
       <loc>https://resilienceweb.org.uk/how-it-works</loc>
     </url>
     ${paths
         .map((path) => {
             return `
       <url>
           <loc>${path}</loc>
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
    const paths = listings.map(
        (l) => `https://${l.location.slug}.resilienceweb.org.uk/${l.slug}`,
    )

    const sitemap = generateSiteMap(paths)

    res.setHeader('Content-Type', 'text/xml')
    // we send the XML to the browser
    res.write(sitemap)
    res.end()

    return {
        props: {},
    }
}

export default SiteMap

