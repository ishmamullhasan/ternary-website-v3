import { revalidateTag } from 'next/cache'
import { slugField } from 'payload'
import { CollectionConfig } from 'payload'

const Job: CollectionConfig = {
  slug: 'job',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`job_${doc.slug}`)
        }
        revalidateTag('job')
      },
    ],
  },
  admin: {
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'code',
      label: 'Code',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'code' }),
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'team',
      label: 'Team',
      type: 'text',
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
    },
   
  ],
}

export default Job
