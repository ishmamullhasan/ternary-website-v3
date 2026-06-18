import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('industry', {
  group: 'Content',
  description: 'Industry verticals and their landing content.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
})
