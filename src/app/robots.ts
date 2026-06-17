import { getServerSideURL } from '@/utilities/getURL'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = getServerSideURL()
  return {
    rules: [{ userAgent: '*', disallow: '/admin/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
