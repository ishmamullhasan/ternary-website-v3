import { DEFAULT_LOCALE, LOCALES, localizedPath } from '@/lib/i18n/locales'
import { getJobs } from '@/lib/jobs-data'
import { pagePath } from '@/lib/seo/pagePath'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import { getPayload } from 'payload'

// Hand-rolled instead of Next's `sitemap.ts` MetadataRoute export, for one reason: that API cannot
// emit an `<?xml-stylesheet?>` processing instruction. Without it, browsers show this file as a wall
// of flat text — Chrome's XML tree viewer bails out on any document containing XHTML-namespace
// elements, and the `<xhtml:link>` hreflang alternates below are exactly that. The stylesheet
// (public/sitemap.xsl) renders a readable table for humans; crawlers ignore it and parse the raw XML.
//
// Output is otherwise byte-for-byte equivalent to what the metadata route produced.
//
// Content is dynamically rendered (draftMode + relationship population), so the sitemap is generated
// from the database at request time rather than by a static crawler.
export const dynamic = 'force-dynamic'

// The plugin-seo meta group (WEB-442). depth 0 returns the group inline, so we can read
// hideFromSitemap without populating the image relationship.
type WithMeta = { meta?: { hideFromSitemap?: boolean | null } | null }
const isHidden = (doc: WithMeta): boolean => doc.meta?.hideFromSitemap === true

// Per-document detail routes: Payload collection slug -> URL prefix.
// IMPORTANT: each prefix is verified against an actual folder under src/app/(frontend)/[locale]. The
// solution / industry / model / scale collections are surfaced only as blocks inside Pages (they
// have NO standalone detail route), so they are intentionally NOT listed here — adding them would
// emit 404 URLs. Priority is a relative hint for crawlers.
const DETAIL_ROUTES: { collection: string; prefix: string; priority: number }[] = [
  { collection: 'capability', prefix: 'capabilities', priority: 0.8 },
  { collection: 'insight', prefix: 'insights', priority: 0.7 },
  // Detail lives at /case-studies/<slug>; /stories/<slug> is a 301 in next.config.js. Emit the
  // destination — a sitemap must list canonical URLs, never ones that redirect.
  { collection: 'story', prefix: 'case-studies', priority: 0.7 },
  { collection: 'pressRelease', prefix: 'press-release', priority: 0.6 },
  { collection: 'legal', prefix: 'legals', priority: 0.3 },
]

type Entry = {
  url: string
  lastModified?: Date
  priority?: number
  alternates: Record<string, string>
}

// A page exists in every locale (fallback fills missing bn content). For one locale-LESS path we
// emit one sitemap entry per locale, each carrying the full hreflang alternates map (en + bn +
// x-default). Path building reuses `localizedPath` so it matches the route + canonical logic.
function buildLanguages(base: string, path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `${base}${localizedPath(l, path)}`
  languages['x-default'] = `${base}${localizedPath(DEFAULT_LOCALE, path)}`
  return languages
}

async function buildEntries(): Promise<Entry[]> {
  const base = getServerSideURL()
  const payload = await getPayload({ config })
  const entries: Entry[] = []

  // Emit one entry per locale for a single locale-LESS path, with shared hreflang alternates.
  const pushLocalized = (path: string, opts: { lastModified?: Date; priority?: number }) => {
    const alternates = buildLanguages(base, path)
    for (const l of LOCALES) {
      entries.push({
        url: `${base}${localizedPath(l, path)}`,
        lastModified: opts.lastModified,
        priority: opts.priority,
        alternates,
      })
    }
  }

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
    pushLocalized(path, {
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
        pushLocalized(`/${prefix}/${d.slug}`, {
          lastModified: d.updatedAt ? new Date(d.updatedAt) : undefined,
          priority,
        })
      }
    } catch {
      // A collection may be unavailable in some environments — skip rather than fail the sitemap.
    }
  }

  // Job detail pages (sourced from the recruiting service via jobs-data). Jobs are not Payload docs
  // and carry no meta group, so there is no hideFromSitemap to honour here.
  try {
    const jobs = await getJobs()
    for (const j of jobs) {
      if (!j.slug) continue
      pushLocalized(`/job/${j.slug}`, {
        lastModified: j.published_at ? new Date(j.published_at) : undefined,
        priority: 0.5,
      })
    }
  } catch {
    // Recruiting API may be unavailable — skip job URLs rather than fail.
  }

  return entries
}

// Slugs and titles are authored in the CMS, so a stray `&` or `<` in a URL must not break the
// document. Escaping is on us now that we serialize by hand.
const xml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function serialize(entries: Entry[]): string {
  const urls = entries
    .map((e) => {
      const alternates = Object.entries(e.alternates)
        .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${xml(lang)}" href="${xml(href)}" />`)
        .join('\n')
      const lines = [`    <loc>${xml(e.url)}</loc>`, alternates]
      if (e.lastModified) lines.push(`    <lastmod>${e.lastModified.toISOString()}</lastmod>`)
      if (e.priority !== undefined) lines.push(`    <priority>${e.priority}</priority>`)
      return `  <url>\n${lines.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}

export async function GET() {
  const entries = await buildEntries()

  return new Response(serialize(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
