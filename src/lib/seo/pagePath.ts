// Single source of truth for a blocks-page's URL path. Both the [...slug] route and the sitemap
// derive paths from this so they can never diverge (home → "/", others → last breadcrumb url, else slug).

type Crumb = { url?: string | null }

export type PagePathInput = { slug?: string | null; breadcrumbs?: unknown }

/** Full path of a blocks page. Home (slug "home") lives at "/". */
export function pagePath(page: PagePathInput): string {
  if (page.slug === 'home') return '/'
  const crumbs = Array.isArray(page.breadcrumbs) ? (page.breadcrumbs as Crumb[]) : []
  const last = crumbs.length ? crumbs[crumbs.length - 1]?.url : null
  return last || `/${page.slug ?? ''}`
}
