import { getServerSideURL } from '@/utilities/getURL'
import { SITE_DESCRIPTION, SITE_NAME } from './config'

// Pure JSON-LD builders (schema.org shapes). No I/O — each returns a plain object that <JsonLd>
// serialises. Keeping them pure means they're trivially testable and safe in server components.

type JsonLdObject = Record<string, unknown>

/** schema.org/Organization — the publisher behind every page. Injected once site-wide. */
export function organization(): JsonLdObject {
  const url = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    logo: `${url}/favicon.svg`,
    description: SITE_DESCRIPTION,
  }
}

/** schema.org/WebSite — the site itself. Injected once site-wide. */
export function website(): JsonLdObject {
  const url = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: SITE_DESCRIPTION,
  }
}

type ArticleArgs = {
  title: string
  description?: string | null
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
  url: string
}

/** schema.org/Article — insight + press-release detail pages. */
export function article({ title, description, image, datePublished, dateModified, url }: ArticleArgs): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    publisher: organization(),
  }
}

type JobPostingArgs = {
  title: string
  description?: string | null
  datePosted?: string | null
  location?: string | null
  url: string
}

/** schema.org/JobPosting — job detail page. */
export function jobPosting({ title, description, datePosted, location, url }: JobPostingArgs): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    ...(description ? { description } : {}),
    ...(datePosted ? { datePosted } : {}),
    url,
    hiringOrganization: organization(),
    ...(location
      ? { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: location } } }
      : {}),
  }
}

type BreadcrumbItem = { name: string; url: string }

/** schema.org/BreadcrumbList — built from a page's breadcrumb chain. */
export function breadcrumbList(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
