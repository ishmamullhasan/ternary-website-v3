import { getJobs } from '@/lib/jobs-data'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

// Content is dynamically rendered (draftMode + relationship population), so the sitemap is
// generated from the database at request time rather than by the static next-sitemap crawler.
export const dynamic = 'force-dynamic'

type Crumb = { url?: string | null }

/** Full path of a blocks page (home lives at "/"; others derive from breadcrumbs or slug). */
const pagePath = (page: { slug?: string | null; breadcrumbs?: unknown }): string => {
  if (page.slug === 'home') return '/'
  const crumbs = Array.isArray(page.breadcrumbs) ? (page.breadcrumbs as Crumb[]) : []
  const last = crumbs.length ? crumbs[crumbs.length - 1]?.url : null
  return last || `/${page.slug ?? ''}`
}

// Per-document detail routes: Payload collection slug -> URL prefix (matches src/app/(frontend)).
const DETAIL_ROUTES: { collection: string; prefix: string }[] = [
  { collection: 'capability', prefix: 'capabilities' },
  { collection: 'insight', prefix: 'insights' },
  { collection: 'story', prefix: 'stories' },
  { collection: 'pressRelease', prefix: 'press-release' },
  { collection: 'legal', prefix: 'legals' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerSideURL()
  const payload = await getPayload({ config })
  const entries: MetadataRoute.Sitemap = []

  // Blocks-driven pages (home + the marketing pages served via the [...slug] catch-all).
  const pages = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  for (const p of pages.docs) {
    entries.push({
      url: `${base}${pagePath(p)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    })
  }

  // Per-document detail pages from their content collections.
  for (const { collection, prefix } of DETAIL_ROUTES) {
    try {
      const docs = await payload.find({
        collection: collection as never,
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      })
      for (const d of docs.docs as { slug?: string | null; updatedAt?: string }[]) {
        if (!d.slug) continue
        entries.push({
          url: `${base}/${prefix}/${d.slug}`,
          lastModified: d.updatedAt ? new Date(d.updatedAt) : undefined,
        })
      }
    } catch {
      // A collection may be unavailable in some environments — skip rather than fail the sitemap.
    }
  }

  // Job detail pages (sourced from the recruiting service via jobs-data).
  try {
    const jobs = await getJobs()
    for (const j of jobs) if (j.slug) entries.push({ url: `${base}/job/${j.slug}` })
  } catch {
    // Recruiting API may be unavailable — skip job URLs rather than fail.
  }

  return entries
}
