import { caseStudyFields } from '@/collections/fields/caseStudyFields'
import { makeContentCollection } from '@/collections/makeContentCollection'
import type { CollectionConfig } from 'payload'

const base = makeContentCollection('story', {
  group: 'Content',
  description: 'Customer success stories and case studies.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
  // Drafts + scheduled publishing (WEB-454). Opt-in: industry/model/solution share this factory but
  // intentionally do NOT enable drafts.
  drafts: true,
  // Detail route is /<locale>/case-studies/<slug>; enables draft live preview (WEB-449).
  previewPathSegment: 'case-studies',
})

// Append the structured case-study fields to the story collection only (other collections that
// share makeContentCollection stay byte-identical — see caseStudyFields.ts).
const story: CollectionConfig = { ...base, fields: [...base.fields, ...caseStudyFields] }

export default story
