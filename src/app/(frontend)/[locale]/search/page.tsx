import SearchInput from '@/components/sections/search/SearchInput'
import { asTypedLocale } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import type { Search } from '@/payload-types'
import config from '@/payload.config'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { TypedLocale, Where } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

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

function resultHref(locale: string, result: Search): string | null {
  const type = result.type ?? result.doc?.relationTo
  if (!type) return null
  const segment = ROUTE_BY_TYPE[type]
  if (!segment || !result.slug) return null
  return `/${locale}/${segment}/${result.slug}`
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 pb-24 pt-12 text-primary lg:pt-16">
      <header className="flex flex-col gap-6">
        <h1 className="text-3xl font-medium tracking-tight text-white lg:text-4xl">Search</h1>
        <SearchInput locale={typedLocale} defaultValue={query} />
      </header>

      <section aria-live="polite" aria-busy={false} className="flex flex-col gap-6">
        {!query ? (
          <p className="text-sm text-[#757571]">
            Enter a search term to find insights, stories, press releases, and capabilities.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-[#757571]">
            No results found for <span className="text-white">&ldquo;{query}&rdquo;</span>.
          </p>
        ) : (
          <>
            <p className="text-sm text-[#757571]">
              {results.length} result{results.length === 1 ? '' : 's'} for{' '}
              <span className="text-white">&ldquo;{query}&rdquo;</span>
            </p>

            <ul className="flex flex-col gap-3">
              {results.map((result) => {
                const href = resultHref(typedLocale, result)
                const type = result.type ?? result.doc?.relationTo ?? ''
                const label = TYPE_LABEL[type] ?? type

                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      {label && (
                        <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-[#14120B] px-3 py-1 text-xs text-[#D5D5D5]">
                          {label}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium tracking-tight text-white">{result.title || 'Untitled'}</h2>
                    {result.excerpt && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#D5D5D5]">{result.excerpt}</p>
                    )}
                  </>
                )

                if (!href) {
                  return (
                    <li
                      key={result.id}
                      className="flex flex-col gap-2 rounded-lg border border-zinc-800/40 bg-main p-5"
                    >
                      {content}
                    </li>
                  )
                }

                return (
                  <li key={result.id}>
                    <Link
                      href={href}
                      className="group flex flex-col gap-2 rounded-lg border border-zinc-800/40 bg-main p-5 transition-colors hover:border-zinc-700/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {label && (
                          <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-[#14120B] px-3 py-1 text-xs text-[#D5D5D5]">
                            {label}
                          </span>
                        )}
                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#757571] transition-colors group-hover:text-white"
                        />
                      </div>
                      <h2 className="text-lg font-medium tracking-tight text-white">{result.title || 'Untitled'}</h2>
                      {result.excerpt && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-[#D5D5D5]">{result.excerpt}</p>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
