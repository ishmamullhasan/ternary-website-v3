/**
 * Industries that must not appear on the public Industries hub index.
 *
 * ⚠️ FLAG (redesign/v2): the brief referenced an existing `industryExclusions` list to reuse, but
 * no such list exists anywhere in the codebase — so this is newly introduced here. It matches on
 * normalized title. If exclusion should instead be author-controlled, add a boolean field to the
 * `industry` collection (e.g. `hideFromHub`) and filter on that rather than on hard-coded titles.
 */
const EXCLUDED_INDUSTRY_TITLES = ['software platforms', 'test industry'] as const

export function isExcludedIndustry(title?: string | null): boolean {
  if (!title) return false
  const normalized = title.trim().toLowerCase()
  return EXCLUDED_INDUSTRY_TITLES.some((excluded) => normalized === excluded || normalized.includes(excluded))
}
