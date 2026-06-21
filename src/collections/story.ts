import { makeContentCollection } from '@/collections/makeContentCollection'
import { statsArray } from '@/fields/arrays'
import { rowLabelAdmin } from '@/fields/rowLabel'

const story = makeContentCollection('story', {
  group: 'Content',
  description: 'Customer success stories and case studies.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
  // Drafts + scheduled publishing (WEB-454). Opt-in: industry/model/solution share this factory but
  // intentionally do NOT enable drafts.
  drafts: true,
  // Detail route is /<locale>/stories/<slug>; enables draft live preview (WEB-449).
  previewPathSegment: 'stories',
})

// Optional structured case-study body. Lets the detail page render the numbered multi-section Figma
// layout; when these are empty the page falls back to the flat `content` field. All fields are
// optional so existing stories keep rendering unchanged.
story.fields = [
  ...story.fields,
  {
    name: 'bodySections',
    label: 'Body sections',
    type: 'array',
    admin: {
      ...rowLabelAdmin,
      description:
        'Numbered case-study sections (01 The Challenge, 02 The Approach, …). Leave empty to use the flat content field.',
    },
    fields: [
      { name: 'label', label: 'Label', type: 'text', localized: true, admin: { description: 'e.g. 01 The Challenge' } },
      { name: 'heading', label: 'Heading', type: 'text', localized: true },
      { name: 'lede', label: 'Lede', type: 'textarea', localized: true },
      { name: 'body', label: 'Body', type: 'richText', localized: true },
    ],
  },
  statsArray({ name: 'outcomeStats', label: 'Outcome metrics' }),
  {
    name: 'quote',
    label: 'Quote',
    type: 'group',
    admin: { description: 'Pull-quote / testimonial.' },
    fields: [
      { name: 'text', label: 'Quote', type: 'textarea', localized: true },
      { name: 'name', label: 'Name', type: 'text', localized: true },
      { name: 'role', label: 'Role', type: 'text', localized: true },
    ],
  },
  {
    name: 'readTime',
    label: 'Read time',
    type: 'number',
    admin: { description: 'Reading time in minutes.' },
  },
  {
    name: 'code',
    label: 'Code',
    type: 'text',
    admin: { description: 'Case-study code, e.g. CS-014.' },
  },
]

export default story
