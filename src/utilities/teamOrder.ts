import type { Team } from '@/payload-types'

/**
 * Sort populated team docs by the collection's manual drag-and-drop order (`_order`, a
 * fractional-indexing key — plain lexicographic comparison is the correct semantics). Direct
 * `payload.find({ collection: 'team' })` reads should pass `sort: '_order'` instead; this helper is
 * for team docs arriving through populated relationships, whose order is the relationship array's.
 * Docs without a key (not yet reordered/re-saved) sink to the end, keeping their relative order.
 */
export function sortByTeamOrder<T extends Pick<Team, '_order'>>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    if (!a._order || !b._order) return (a._order ? 0 : 1) - (b._order ? 0 : 1)
    return a._order < b._order ? -1 : a._order > b._order ? 1 : 0
  })
}
