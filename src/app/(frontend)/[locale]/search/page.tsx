import Motion from '@/components/animation/motion'
import LocalizedLink from '@/components/LocalizedLink'
import SearchInput from '@/components/sections/search/SearchInput'
import { asTypedLocale } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import type { Search } from '@/payload-types'
import config from '@/payload.config'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { TypedLocale, Where } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// Search is query-driven (reads `?q=`), so it must render dynamically per request — never
// prerendered or cached as a static page.
export const dynamic = 'force-dynamic'

// Map a synced search doc's source collection (`type`) to its public detail route. Keep this in
// sync with the app routes under /[locale]/{insights,press-release,stories,capabilities}.
const ROUTE_BY_TYPE: Record<string, string> = {
  insight: 'insights',
  pressRelease: 'press-release',
  story: 'stories',
  capability: 'capabilities',
}

const TYPE_LABEL: Record<string, string> = {
  insight: 'Insight',
  pressRelease: 'Press Release',
  story: 'Story',
  capability: 'Capability',
}

// Returns a locale-LESS href; `LocalizedLink` prefixes the active locale on render.
function resultHref(result: Search): string | null {
  const type = result.type ?? result.doc?.relationTo
  if (!type) return null
  const segment = ROUTE_BY_TYPE[type]
  if (!segment || !result.slug) return null
  return `/${segment}/${result.slug}`
}

// Query the public `search` collection (kept in sync by @payloadcms/plugin-search) on the synced
// title/excerpt. Local API read; the collection is publicly readable so no access override needed.
async function runSearch(query: string, locale: TypedLocale): Promise<Search[]> {
  if (!query) return []

  const payload = await getPayload({ config })
  const where: Where = {
    or: [{ title: { like: query } }, { excerpt: { like: query } }],
  }

  const result = await payload.find({
    collection: 'search',
    where,
    locale,
    limit: 50,
    depth: 0,
    sort: '-priority',
  })

  return result.docs as Search[]
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const { q } = await searchParams
  const query = (q ?? '').trim()

  return generateMeta({
    fallbackTitle: query ? `Search: ${query}` : 'Search',
    fallbackDescription: 'Search Ternary insights, stories, press releases, and capabilities.',
    pathname: '/search',
    locale: typedLocale,
  })
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()

  const { q } = await searchParams
  const query = (q ?? '').trim()
  const results = query ? await runSearch(query, typedLocale) : []

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-10 px-5 pb-24 pt-12 text-primary lg:pt-16">
      <Motion
        tag="header"
        className="flex flex-col gap-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-medium tracking-tight text-cream lg:text-4xl">Search</h1>
        <SearchInput locale={typedLocale} defaultValue={query} />
      </Motion>

      <section aria-live="polite" aria-busy={false} className="flex flex-col gap-6">
        {!query ? (
          <p className="text-sm text-subtle">
            Enter a search term to find insights, stories, press releases, and capabilities.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-subtle">
            No results found for <span className="text-cream">&ldquo;{query}&rdquo;</span>.
          </p>
        ) : (
          <>
            <p className="text-sm text-subtle">
              {results.length} result{results.length === 1 ? '' : 's'} for{' '}
              <span className="text-cream">&ldquo;{query}&rdquo;</span>
            </p>

            <ul className="grid grid-cols-1 gap-3">
              {results.map((result, index) => {
                const href = resultHref(result)
                const type = result.type ?? result.doc?.relationTo ?? ''
                const label = TYPE_LABEL[type] ?? type

                return (
                  <Motion
                    tag="li"
                    key={result.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(index * 0.04, 0.2) }}
                  >
                    {!href ? (
                      <div className="flex flex-col gap-2 rounded-md border border-line bg-main p-5">
                        <div className="flex items-center gap-3">
                          {label && (
                            <span className="inline-flex items-center rounded-full border border-line-strong bg-button-dark px-3 py-1 text-xs text-body">
                              {label}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-medium tracking-tight text-cream">
                          {result.title || 'Untitled'}
                        </h2>
                        {result.excerpt && (
                          <p className="line-clamp-2 text-sm leading-relaxed text-body">{result.excerpt}</p>
                        )}
                      </div>
                    ) : (
                      <LocalizedLink
                        href={href}
                        className="group flex min-h-[44px] flex-col gap-2 rounded-md border border-line bg-main p-5 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {label && (
                            <span className="inline-flex items-center rounded-full border border-line-strong bg-button-dark px-3 py-1 text-xs text-body">
                              {label}
                            </span>
                          )}
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-subtle transition-colors group-hover:text-cream"
                          />
                        </div>
                        <h2 className="text-lg font-medium tracking-tight text-cream">
                          {result.title || 'Untitled'}
                        </h2>
                        {result.excerpt && (
                          <p className="line-clamp-2 text-sm leading-relaxed text-body">{result.excerpt}</p>
                        )}
                      </LocalizedLink>
                    )}
                  </Motion>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
