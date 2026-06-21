/**
 * Shared icon vocabularies for `iconSelect` / `cardsArray({ icons })`.
 *
 * The list here MUST stay in sync with the name→component map a renderer supports
 * (e.g. the benefit-card chip in `@/components/layout/bentoCard`). Editors pick one of
 * these names per card; the renderer maps the name to a lucide icon.
 */

/** Benefit / culture / growth card glyphs (Careers grids, etc.). */
export const benefitIcons = [
  'zap',
  'users',
  'heart',
  'globe',
  'rocket',
  'shield',
  'sparkles',
  'trophy',
  'target',
  'trending-up',
  'book-open',
  'compass',
] as const
