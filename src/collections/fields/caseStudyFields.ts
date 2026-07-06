import type { Field } from 'payload'

/**
 * Structured case-study fields appended to the `story` collection only (composed in
 * `story.ts`, NOT in the shared `makeContentCollection` factory). The story detail page
 * (`/case-studies/<slug>`) renders the main `content` rich text as the write-up; these two
 * fields drive only the hero chrome (hero chips + the meta strip) and both live in the admin
 * right sidebar so the edit view leads with title/content.
 *
 * Every leaf text field is `localized` (en + bn). The repeatable `tags` array is `localized`
 * too, so each locale keeps an independent chip list.
 */
export const caseStudyFields: Field[] = [
  // Hero chips — short technique/topic tags shown under the lead paragraph.
  {
    name: 'tags',
    label: 'Hero Tags',
    type: 'array',
    localized: true,
    admin: {
      position: 'sidebar',
      description: 'Short chips shown in the hero (e.g. “Event-driven architecture”).',
    },
    fields: [{ name: 'name', label: 'Label', type: 'text' }],
  },

  // 5-cell meta strip beneath the hero.
  {
    name: 'caseMeta',
    label: 'Case Meta',
    type: 'group',
    admin: { position: 'sidebar' },
    fields: [
      { name: 'industry', label: 'Industry', type: 'text', localized: true },
      { name: 'engagement', label: 'Engagement', type: 'text', localized: true },
      { name: 'duration', label: 'Duration', type: 'text', localized: true },
      { name: 'team', label: 'Team', type: 'text', localized: true },
      { name: 'year', label: 'Year', type: 'text', localized: true },
    ],
  },
]
