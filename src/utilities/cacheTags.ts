// Canonical list of every top-level cache tag used across the site's ISR (WEB-457).
//
// Read paths tag their `unstable_cache` / fetch reads with these collection- and global-level tags
// (detail pages additionally tag `${collection}_${slug}`, but every such entry ALSO carries the
// collection-level tag, so revalidating the tags below busts individual pages too). Write paths bust
// them from each collection/global afterChange hook via `revalidateTag(...)`.
//
// Revalidating all of these clears the entire site's Data Cache — used by the /next/revalidate
// endpoint and the admin "Revalidate site" button (components/admin/revalidate).
export const CONTENT_TAGS = [
  'pages',
  'capability',
  'industry',
  'insight',
  'legal',
  'model',
  'pressRelease',
  'scale',
  'solution',
  'story',
  'team',
] as const

export const GLOBAL_TAGS = ['header', 'footer', 'legal-center'] as const

export const ALL_CACHE_TAGS = [...CONTENT_TAGS, ...GLOBAL_TAGS] as const

export type CacheTag = (typeof ALL_CACHE_TAGS)[number]

// Tags for cached reads of `pages` docs (home + [...slug]). Pages render block layouts that embed
// docs from every content collection at depth 2 (aboutSection relates to 8 collections, teamSection
// to team, industryPanels to industry, …), so a pages read must be busted when ANY of those
// collections changes — otherwise the embedded copies (titles, excerpts, thumbnails) go stale even
// though the source doc's own tag was revalidated. CONTENT_TAGS already includes 'pages' itself.
export const PAGES_EMBED_TAGS = CONTENT_TAGS
