import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Legal: CollectionConfig = {
  slug: 'legal',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`legal_${doc.slug}`, 'max')
        }
        revalidateTag('legal', 'max')
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    slugField(),
    {
      name: 'content',
      label: 'Page Content',
      type: 'richText',
    },
  ],
}

export default Legal
