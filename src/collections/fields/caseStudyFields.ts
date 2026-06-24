import type { Field } from 'payload'

/**
 * Structured case-study fields appended to the `story` collection only (composed in
 * `story.ts`, NOT in the shared `makeContentCollection` factory). These drive the bespoke
 * `/case-studies/<slug>` detail layout: hero chips + meta strip, then the numbered
 * Challenge / Approach / Solution / Outcome / Lessons sections, and the "Why it matters"
 * statement (matching Figma node 1556-7370).
 *
 * Every leaf text field is `localized` (en + bn). Repeatable arrays are `localized` too, so
 * each locale keeps an independent item list — translations can differ in count if needed.
 * Section eyebrow labels ("01 — The Challenge", etc.) live in the component, not the CMS.
 */
export const caseStudyFields: Field[] = [
  // Hero chips — short technique/topic tags shown under the lead paragraph.
  {
    name: 'tags',
    label: 'Hero Tags',
    type: 'array',
    localized: true,
    admin: { description: 'Short chips shown in the hero (e.g. “Event-driven architecture”).' },
    fields: [{ name: 'name', label: 'Label', type: 'text' }],
  },

  // 5-cell meta strip beneath the hero.
  {
    name: 'caseMeta',
    label: 'Case Meta',
    type: 'group',
    fields: [
      { name: 'industry', label: 'Industry', type: 'text', localized: true },
      { name: 'engagement', label: 'Engagement', type: 'text', localized: true },
      { name: 'duration', label: 'Duration', type: 'text', localized: true },
      { name: 'team', label: 'Team', type: 'text', localized: true },
      { name: 'year', label: 'Year', type: 'text', localized: true },
    ],
  },

  // 01 — The Challenge
  {
    name: 'challenge',
    label: 'Challenge (01)',
    type: 'group',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', localized: true },
      {
        name: 'paragraphs',
        label: 'Paragraphs',
        type: 'array',
        localized: true,
        fields: [{ name: 'text', label: 'Text', type: 'textarea' }],
      },
    ],
  },

  // 02 — The Approach (numbered cards)
  {
    name: 'approach',
    label: 'Approach (02)',
    type: 'group',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', localized: true },
      {
        name: 'cards',
        label: 'Cards',
        type: 'array',
        localized: true,
        admin: { description: 'Auto-numbered 01, 02, 03 … in the layout.' },
        fields: [{ name: 'body', label: 'Body', type: 'textarea' }],
      },
    ],
  },

  // 03 — The Solution
  {
    name: 'solution',
    label: 'Solution (03)',
    type: 'group',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      {
        name: 'paragraphs',
        label: 'Paragraphs',
        type: 'array',
        localized: true,
        fields: [{ name: 'text', label: 'Text', type: 'textarea' }],
      },
    ],
  },

  // 04 — The Outcome (metric cards + testimonial)
  {
    name: 'outcome',
    label: 'Outcome (04)',
    type: 'group',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      { name: 'intro', label: 'Intro', type: 'textarea', localized: true },
      {
        name: 'metrics',
        label: 'Metrics',
        type: 'array',
        localized: true,
        fields: [
          { name: 'value', label: 'Value', type: 'text' },
          { name: 'label', label: 'Label', type: 'text' },
          { name: 'sublabel', label: 'Sub-label', type: 'text' },
        ],
      },
      {
        name: 'quote',
        label: 'Testimonial',
        type: 'group',
        fields: [
          { name: 'text', label: 'Quote', type: 'textarea', localized: true },
          { name: 'authorName', label: 'Author Name', type: 'text', localized: true },
          { name: 'authorRole', label: 'Author Role', type: 'text', localized: true },
        ],
      },
    ],
  },

  // 05 — What we'd do again (lesson cards)
  {
    name: 'lessons',
    label: "Lessons (05 — What we'd do again)",
    type: 'group',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', localized: true },
      {
        name: 'cards',
        label: 'Cards',
        type: 'array',
        localized: true,
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'body', label: 'Body', type: 'textarea' },
        ],
      },
    ],
  },

  // Why it matters — closing statement.
  { name: 'whyItMatters', label: 'Why It Matters', type: 'textarea', localized: true },
]
