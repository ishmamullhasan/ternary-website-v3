import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('story', {
  group: 'Content',
  description: 'Customer success stories and case studies.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
  // Drafts + scheduled publishing (WEB-454). Opt-in: industry/model/solution share this factory but
  // intentionally do NOT enable drafts.
  drafts: true,
  // Detail route is /<locale>/stories/<slug>; enables draft live preview (WEB-449).
  previewPathSegment: 'stories',
})
