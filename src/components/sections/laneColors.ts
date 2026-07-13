/**
 * Flare palette for the delivery globe's shipping lanes — the single source of truth shared by the
 * CMS select (blocks/homeSections/config.ts), the admin map picker (admin/globe/LaneMapField.tsx)
 * and the globe overlay itself (globalDeliveryGlobe.tsx).
 *
 * These are desaturated pastels sitting around the cream marker colour (#F4F3EC) rather than
 * saturated hues: enough separation to tell two crossing lanes apart, not enough to fight the muted
 * globe. The first three are the lanes' original hard-coded colours, kept so existing output is
 * unchanged. `rgb` is pre-formatted for the overlay's `rgba(...)` strings.
 */
export type LaneColorValue = 'cream' | 'amber' | 'azure' | 'rose' | 'sage' | 'lilac' | 'copper' | 'teal'

export type LaneColor = {
  value: LaneColorValue
  label: string
  /** `r, g, b` — interpolated straight into `rgba(${rgb}, a)`. */
  rgb: string
  hex: string
}

export const LANE_COLORS: readonly LaneColor[] = [
  { value: 'cream', label: 'Cream', rgb: '244, 243, 236', hex: '#F4F3EC' },
  { value: 'amber', label: 'Amber', rgb: '240, 214, 170', hex: '#F0D6AA' },
  { value: 'azure', label: 'Azure', rgb: '176, 206, 240', hex: '#B0CEF0' },
  { value: 'rose', label: 'Rose', rgb: '238, 190, 190', hex: '#EEBEBE' },
  { value: 'sage', label: 'Sage', rgb: '184, 214, 187', hex: '#B8D6BB' },
  { value: 'lilac', label: 'Lilac', rgb: '206, 194, 234', hex: '#CEC2EA' },
  { value: 'copper', label: 'Copper', rgb: '226, 168, 138', hex: '#E2A88A' },
  { value: 'teal', label: 'Teal', rgb: '160, 212, 210', hex: '#A0D4D2' },
] as const

export const DEFAULT_LANE_COLOR: LaneColorValue = 'cream'

/** Colour for a lane, by CMS value. Falls back to cycling the palette by index, as the globe used
 *  to do, so a lane saved before this field existed still gets a distinct flare. */
export const laneColor = (value: string | null | undefined, index = 0): LaneColor =>
  LANE_COLORS.find((c) => c.value === value) ?? LANE_COLORS[index % LANE_COLORS.length]!
