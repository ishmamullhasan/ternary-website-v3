// Shared icon vocabulary for the mega menu.
//
// The VALUES here are the icon identifiers stored in the CMS (kebab-case). The frontend maps each
// value to a concrete `lucide-react` component in `src/components/nav/megaIcons.tsx` — keep the two
// lists in sync (a value with no mapping simply renders no glyph). This module is pure data (no JSX,
// no server imports) so it can be imported from BOTH the Payload config and client components.

export const NAV_ICONS = [
  'arrow-up-right',
  'sparkles',
  'brain',
  'database',
  'cloud',
  'layers',
  'cpu',
  'code',
  'smartphone',
  'globe',
  'users',
  'book-open',
  'book-marked',
  'rocket',
  'building',
  'shield-check',
  'line-chart',
  'boxes',
  'network',
  'server',
  'zap',
  'briefcase',
  'newspaper',
  'search',
  'factory',
  'heart-pulse',
  'landmark',
  'shopping-bag',
  'plane',
  'trophy',
  'workflow',
  'compass',
  'phone',
  'mail',
] as const

export type NavIcon = (typeof NAV_ICONS)[number]

/** `{ label, value }` options for a Payload `select` field. Labels are Title-Cased from the value. */
export const NAV_ICON_OPTIONS = NAV_ICONS.map((value) => ({
  value,
  label: value.replace(/(^|-)([a-z])/g, (_m, sep: string, ch: string) => (sep ? ' ' : '') + ch.toUpperCase()),
}))
