import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('solution', {
  group: 'Content',
  description: 'Solution offerings and their landing content.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
})
