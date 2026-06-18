import { getJobs } from '@/lib/jobs-data'
import { pagePath } from '@/lib/seo/pagePath'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

// Content is dynamically rendered (draftMode + relationship population), so the sitemap is
// generated from the database at request time rather than by the static next-sitemap crawler.
export const dynamic = 'force-dynamic'

// The plugin-seo meta group (WEB-442). depth 0 returns the group inline, so we can read
// hideFromSitemap without populating the image relationship.
type WithMeta = { meta?: { hideFromSitemap?: boolean | null } | null }
const isHidden = (doc: WithMeta): boolean => doc.meta?.hideFromSitemap === true

// Per-document detail routes: Payload collection slug -> URL prefix.
// IMPORTANT: each prefix is verified against an actual folder under src/app/(frontend). The
// solution / industry / model / scale collections are surfaced only as blocks inside Pages (they
// have NO standalone detail route), so they are intentionally NOT listed here — adding them would
// emit 404 URLs. Priority is a relative hint for crawlers.
const DETAIL_ROUTES: { collection: string; prefix: string; priority: number }[] = [
  { collection: 'capability', prefix: 'capabilities', priority: 0.8 },
  { collection: 'insight', prefix: 'insights', priority: 0.7 },
  { collection: 'story', prefix: 'stories', priority: 0.7 },
  { collection: 'pressRelease', prefix: 'press-release', priority: 0.6 },
  { collection: 'legal', prefix: 'legals', priority: 0.3 },
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
    if (isHidden(p as WithMeta)) continue
    const path = pagePath(p)
    entries.push({
      url: `${base}${path}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      priority: path === '/' ? 1 : 0.9,
    })
  }

  // Per-document detail pages from their content collections.
  for (const { collection, prefix, priority } of DETAIL_ROUTES) {
    try {
      const docs = await payload.find({
        collection: collection as never,
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      })
      for (const d of docs.docs as (WithMeta & { slug?: string | null; updatedAt?: string })[]) {
        if (!d.slug || isHidden(d)) continue
        entries.push({
          url: `${base}/${prefix}/${d.slug}`,
          lastModified: d.updatedAt ? new Date(d.updatedAt) : undefined,
          priority,
        })
      }
    } catch {
      // A collection may be unavailable in some environments — skip rather than fail the sitemap.
    }
  }

  // Job detail pages (sourced from the recruiting service via jobs-data). Jobs are not Payload
  // docs and carry no meta group, so there is no hideFromSitemap to honour here.
  try {
    const jobs = await getJobs()
    for (const j of jobs) {
      if (!j.slug) continue
      entries.push({
        url: `${base}/job/${j.slug}`,
        lastModified: j.published_at ? new Date(j.published_at) : undefined,
        priority: 0.5,
      })
    }
  } catch {
    // Recruiting API may be unavailable — skip job URLs rather than fail.
  }

  return entries
}
