import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('model', {
  group: 'Content',
  description: 'Engagement and delivery models.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
})
