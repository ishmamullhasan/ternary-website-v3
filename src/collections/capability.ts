import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Capability: CollectionConfig = {
  slug: 'capability',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`capability_${doc.slug}`, 'max')
        }
        revalidateTag('capability', 'max')
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

export default Capability
