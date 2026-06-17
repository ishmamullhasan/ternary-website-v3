/**
 * Shared semantic colour classes for the careers & job pages. These now reference the
 * brand tokens defined in globals.css `@theme` (WEB-410) instead of raw hex literals, so
 * the palette has a single source of truth.
 */
export const careersText = {
  cream: 'text-cream',
  body: 'text-body',
  muted: 'text-subtle',
  white: 'text-white',
  onLight: 'text-ink',
} as const

export const careersBg = {
  page: 'bg-page',
  card: 'bg-main',
  cardInner: 'bg-ink',
  badge: 'bg-badge',
  button: 'bg-cream',
  buttonHover: 'hover:bg-cream-hover',
  buttonDark: 'bg-button-dark',
} as const

export const careersBorder = {
  muted: 'border-subtle',
  subtle: 'border-line',
  input: 'border-line-strong',
} as const
