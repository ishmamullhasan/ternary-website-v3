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

// Note the tags here are the ones each global's afterChange hook actually revalidates (see
// src/globals/*), which are NOT always the global's slug: notFound → `not-found`, errorPage →
// `error-page`. The `ops` global has no cached read, so it has no tag.
export const GLOBAL_TAGS = ['header', 'footer', 'legal-center', 'not-found', 'error-page'] as const

export const ALL_CACHE_TAGS = [...CONTENT_TAGS, ...GLOBAL_TAGS] as const

export type CacheTag = (typeof ALL_CACHE_TAGS)[number]

// Human-readable index of the tags above, for the admin Revalidator screen (Settings →
// Revalidator). Keep in sync with CONTENT_TAGS / GLOBAL_TAGS — a tag missing here is simply not
// offered as an individual target, and one listed here that isn't a real tag is rejected by the
// server action's allowlist check.
export type CacheTarget = {
  tag: CacheTag
  label: string
  kind: 'collection' | 'global'
}

export const CACHE_TARGETS: readonly CacheTarget[] = [
  { tag: 'pages', label: 'Pages', kind: 'collection' },
  { tag: 'capability', label: 'Capabilities', kind: 'collection' },
  { tag: 'industry', label: 'Industries', kind: 'collection' },
  { tag: 'insight', label: 'Insights', kind: 'collection' },
  { tag: 'legal', label: 'Legal documents', kind: 'collection' },
  { tag: 'model', label: 'Models', kind: 'collection' },
  { tag: 'pressRelease', label: 'Press releases', kind: 'collection' },
  { tag: 'scale', label: 'Scales', kind: 'collection' },
  { tag: 'solution', label: 'Solutions', kind: 'collection' },
  { tag: 'story', label: 'Stories', kind: 'collection' },
  { tag: 'team', label: 'Team', kind: 'collection' },
  { tag: 'header', label: 'Header', kind: 'global' },
  { tag: 'footer', label: 'Footer', kind: 'global' },
  { tag: 'legal-center', label: 'Legal Center', kind: 'global' },
  { tag: 'not-found', label: '404 Page', kind: 'global' },
  { tag: 'error-page', label: 'Error Page', kind: 'global' },
] as const

// Tags for cached reads of `pages` docs (home + [...slug]). Pages render block layouts that embed
// docs from every content collection at depth 2 (aboutSection relates to 8 collections, teamSection
// to team, industryPanels to industry, …), so a pages read must be busted when ANY of those
// collections changes — otherwise the embedded copies (titles, excerpts, thumbnails) go stale even
// though the source doc's own tag was revalidated. CONTENT_TAGS already includes 'pages' itself.
export const PAGES_EMBED_TAGS = CONTENT_TAGS
