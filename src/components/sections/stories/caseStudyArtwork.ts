/**
 * Client-supplied product screens for the case-study pages, shipped as repo assets.
 *
 * WHY THESE ARE IN CODE AND NOT ONLY IN THE CMS. `story.thumbnail` and `story.gallery` are the real
 * home for these, and real authored media still wins. But the CMS is per-environment — every
 * deployment reads a different database — so media loaded into one is simply absent from the others,
 * and those pages open on a decorative gradient with no product on them at all. Shipping the artwork
 * with the code gives every environment the same page while leaving the CMS free to override it: the
 * same contract the hub blocks use for their copy, authored default in code, CMS first when authored.
 *
 * The one exception is the gradient stand-ins listed at the foot of this file — a story carrying one
 * of those is treated as having no thumbnail, because filler is not authorship.
 *
 * The files are webp at a 1600px long edge with their transparency intact: 13.5MB of source PNG
 * comes to 1.43MB across all eight. Dimensions are recorded here because the hero frame sizes itself
 * to the artwork's ratio and a plain <img> src cannot tell it what that is.
 *
 * FIRST ENTRY IS THE HERO; the rest fill the showcase — the same split the importer applies to
 * `visuals`, so a story looks identical whether it is being served from the CMS or from here.
 */
export interface CaseStudyArtwork {
  src: string
  width: number
  height: number
  /** What the screen actually shows, not a restatement of the title. */
  alt: string
  caption: string
}

export const CASE_STUDY_ARTWORK: Record<string, CaseStudyArtwork[]> = {
  'counterfoil-continuum': [
    {
      src: '/case-studies/counterfoil-continuum-1.webp',
      width: 1600,
      height: 1293,
      alt: 'A venue operations console: revenue and visitor totals, scheduled group visits with confirmed and pending states, a visitor enquiry inbox, and a point-of-sale cart offering cash, card and e-wallet payment.',
      caption: 'One console for the gate, the shop and the group bookings behind them.',
    },
    {
      src: '/case-studies/counterfoil-continuum-2.webp',
      width: 1600,
      height: 712,
      alt: 'The operator view: available balance and next scheduled payout beside a dated transaction history, and an analytics board comparing sales, check-ins and visitors across two selected periods.',
      caption: 'The operator side — settlement and demand, on the same platform.',
    },
  ],
  'hissho-sushiops360': [
    {
      src: '/case-studies/hissho-sushiops360.webp',
      width: 1431,
      height: 1600,
      alt: 'The Hissho SushiOps360 store dashboard: a low-inventory alert for sushi rice and avocado, total sushi sold, shrinkage against last month, an AI assistant prompt, and a weekly inventory outlook with days-of-cover and stockout risk.',
      caption: 'SushiOps360 — the alert, the numbers and the assistant on one surface.',
    },
  ],
  doyouwork: [
    {
      src: '/case-studies/doyouwork.webp',
      width: 1600,
      height: 848,
      alt: 'The DoYouWork daily scheduling board: a week of jobs laid out by day with technician and vehicle assignments on each card, a drivers working/off toggle, and the manage rail for employees, vehicles and expenses.',
      caption: 'DoYouWork — the board a manager runs the week from.',
    },
  ],
  'farogl-odoo-erp': [
    {
      src: '/case-studies/farogl-odoo-erp.webp',
      width: 1600,
      height: 886,
      alt: 'The Odoo app estate for FAR Oil & Gas Limited: Accounting, CRM, Sales, Manufacturing, MRP II, Inventory, Purchase, eCommerce, Email Marketing, Knowledge and Website shown as installable modules.',
      caption: 'The module estate — mapped to validated workflows before anything was configured.',
    },
  ],
  flex5: [
    {
      src: '/case-studies/flex5.webp',
      width: 1296,
      height: 1600,
      alt: 'Flex5 mobile screens: a metabolic nutrition score with a logged breakfast, a biometrics panel tracking weight, A1c and blood pressure, a class library, a gym finder, and the Ask Dr. Five assistant mid-conversation.',
      caption: 'Flex5 — daily guidance, biometrics, learning and discovery in one app.',
    },
  ],
  'alley-analytix': [
    {
      src: '/case-studies/alley-analytix.webp',
      width: 1600,
      height: 1072,
      alt: "The Alley Analytix coach dashboard with today's athlete activity, completed sessions and practice footage, beside the player's league view showing league average, high series, strike and spare percentages.",
      caption: 'Coach and player views — longitudinal tracking, not raw telemetry.',
    },
  ],
  turfly: [
    {
      src: '/case-studies/turfly.webp',
      width: 1459,
      height: 1600,
      alt: 'The Turfly booking app: a location-aware home screen with a discounted futsal venue and a Book Now action, an explore view of nearby pitches, and upcoming bookings.',
      caption: 'Turfly — venue discovery through to instant confirmation.',
    },
  ],
}

/**
 * Decorative gradient stand-ins currently sitting in `thumbnail` on some environments — the purple
 * and amber fields these pages used to open on. They are filler, not content: 10–244kB of flat
 * gradient with no detail in them, checked by eye and by filesize.
 *
 * A story whose thumbnail is one of these is treated as having none, so the shipped product screen
 * wins. Matched on EXACT filename rather than a pattern like /^story-/, which would also swallow a
 * genuine screenshot an author happened to name that way; an unrecognised filename means the CMS
 * keeps control, which is the safe direction to fail. Delete an entry once real media replaces it.
 */
const PLACEHOLDER_THUMBNAILS = new Set([
  'MagicPattern.design-2.webp',
  'MagicPattern.design-5.webp',
  'MagicPattern.design-22.webp',
  'story-hissho-sushiops360.webp',
  'story-doyouwork.webp',
  'story-farogl-odoo-erp.webp',
  'story-flex5.webp',
])

/** True when this media is one of the gradient stand-ins above rather than real artwork. */
export function isPlaceholderThumbnail(filename?: string | null): boolean {
  return typeof filename === 'string' && PLACEHOLDER_THUMBNAILS.has(filename)
}
