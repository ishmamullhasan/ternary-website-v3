import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('story', {
  group: 'Content',
  description: 'Customer success stories and case studies.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
})
