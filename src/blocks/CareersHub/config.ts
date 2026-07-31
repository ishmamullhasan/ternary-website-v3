import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'

/**
 * Careers hub (owner-directed redesign, 2026-07-31) — the careers narrative as ONE editable block
 * in the hub design language, following the SolutionsHub pattern: design lives in code, copy lives
 * here, and every field left empty falls back to the authored default so a half-edited doc can
 * never render broken. The team-voices carousel and the open-roles list remain their own blocks
 * (careersTeam / jobsBlock) after this one.
 */
export const CareersHub: Block = {
  slug: 'careersHub',
  interfaceName: 'CareersHubBlock',
  labels: { singular: 'Careers Hub', plural: 'Careers Hubs' },
  fields: [
    // No 'heroEyebrow' field: the hero renders no label, so an editable eyebrow would be a control
    // that does nothing. A value already stored stays in the document — simply unread.
    // textarea, not text: each LINE of this heading is one beat of the hero sequence — the line
    // appears and a stage of the path draws beside it — so an author needs to be able to press
    // enter. Copy written as a single run still works; it falls back to splitting on sentences.
    { name: 'heroHeading', label: 'Hero heading (one line per beat)', type: 'textarea', localized: true },
    { name: 'heroSub', label: 'Hero subline', type: 'textarea', localized: true },
    { name: 'principlesHeading', label: 'Principles heading', type: 'text', localized: true },
    { name: 'principlesIntro', label: 'Principles intro', type: 'textarea', localized: true },
    {
      name: 'principles',
      label: 'Principles (numbered rows)',
      type: 'array',
      maxRows: 6,
      admin: rowLabelAdmin,
      fields: [
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
      ],
    },
    { name: 'growthHeading', label: 'Growth heading', type: 'text', localized: true },
    { name: 'growthIntro', label: 'Growth intro', type: 'textarea', localized: true },
    {
      name: 'ladder',
      label: 'Career ladder steps (in order)',
      type: 'array',
      maxRows: 6,
      admin: rowLabelAdmin,
      fields: [{ name: 'step', label: 'Step', type: 'text', localized: true }],
    },
    { name: 'ladderNote', label: 'Ladder note', type: 'textarea', localized: true },
    {
      name: 'growthCols',
      label: 'Growth columns',
      type: 'array',
      maxRows: 4,
      admin: rowLabelAdmin,
      fields: [
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
      ],
    },
    { name: 'placesLine', label: 'Two-cities line', type: 'textarea', localized: true },
  ],
}

export default CareersHub
