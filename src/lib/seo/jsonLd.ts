import { getServerSideURL } from '@/utilities/getURL'
import { SITE_DESCRIPTION, SITE_NAME } from './config'

// Pure schema.org JSON-LD builders. No I/O beyond reading the server URL — each function returns a
// plain object that <JsonLd> serialises into a <script type="application/ld+json">. Keeping them
// pure means they're trivially testable and safe to call from server components.
//
// Every builder stamps the correct '@context' + '@type' and omits empty fields so the emitted
// structured data stays valid (Google ignores keys with null/undefined values, but omitting them
// keeps the markup clean and lint-friendly).

const SCHEMA_CONTEXT = 'https://schema.org'

type JsonLdObject = Record<string, unknown>

/**
 * schema.org/Organization — the publisher behind every page. Injected once site-wide (root layout).
 * `sameAs` is the canonical list of the org's profiles on other platforms; left empty until those
 * URLs are confirmed, but kept in the shape so search engines can pick them up once populated.
 */
export function organization(): JsonLdObject {
  const url = getServerSideURL()
  const sameAs: string[] = []
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    logo: `${url}/favicon.svg`,
    description: SITE_DESCRIPTION,
    sameAs,
  }
}

/** schema.org/WebSite — the site itself. Injected once site-wide alongside the Organization. */
export function website(): JsonLdObject {
  const url = getServerSideURL()
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: SITE_DESCRIPTION,
  }
}

export type ArticleArgs = {
  headline: string
  description?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName?: string | null
  url: string
  image?: string | null
}

/**
 * schema.org/Article — insight, press-release, and story detail pages. The `author` defaults to the
 * publishing organisation when no byline is supplied (press releases / case studies), and is a
 * Person when an author name is mapped (insights).
 */
export function article({
  headline,
  description,
  datePublished,
  dateModified,
  authorName,
  url,
  image,
}: ArticleArgs): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: authorName ? { '@type': 'Person', name: authorName } : { '@type': 'Organization', name: SITE_NAME },
    publisher: organization(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }
}

export type JobPostingArgs = {
  title: string
  description?: string | null
  datePosted?: string | null
  validThrough?: string | null
  employmentType?: string | null
  locationName?: string | null
  url: string
  /** Defaults to the site organisation; pass to override the hiring entity. */
  hiringOrganization?: string
}

/**
 * schema.org/JobPosting — the job detail page. This is the Google Jobs win: a valid JobPosting lets
 * roles surface in the Google for Jobs experience. `employmentType` should be one of schema.org's
 * enum values (FULL_TIME, PART_TIME, CONTRACTOR, …) when known.
 */
export function jobPosting({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  locationName,
  url,
  hiringOrganization = SITE_NAME,
}: JobPostingArgs): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'JobPosting',
    title,
    ...(description ? { description } : {}),
    ...(datePosted ? { datePosted } : {}),
    ...(validThrough ? { validThrough } : {}),
    ...(employmentType ? { employmentType } : {}),
    hiringOrganization: { '@type': 'Organization', name: hiringOrganization, sameAs: getServerSideURL() },
    ...(locationName
      ? { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: locationName } } }
      : {}),
    url,
  }
}

export type BreadcrumbItem = { name: string; url: string }

/** schema.org/BreadcrumbList — built from a page's breadcrumb chain (absolute URLs). */
export function breadcrumbList(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
