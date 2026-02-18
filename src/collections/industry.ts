import { revalidateTag } from 'next/cache'
import { slugField } from 'payload'
import { CollectionConfig } from 'payload'

const Industry: CollectionConfig = {
  slug: 'industry',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`industry_${doc.slug}`)
        }
        revalidateTag('industry')
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
      name: 'excerpts',
      label: 'Excerpts',
      type: 'textarea',
    },
    {
      name: 'thumbnail',
      label: 'Thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
    },
  ],
}

export default Industry
