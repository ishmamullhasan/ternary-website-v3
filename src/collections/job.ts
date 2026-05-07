import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateTag } from 'next/cache'
import { FixedToolbarFeature } from 'node_modules/@payloadcms/richtext-lexical/dist/features/toolbars/fixed/server'
import { InlineToolbarFeature } from 'node_modules/@payloadcms/richtext-lexical/dist/features/toolbars/inline/server'
import { CollectionConfig, slugField } from 'payload'

const Job: CollectionConfig = {
  slug: 'job',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`job_${doc.slug}`, 'max')
        }
        revalidateTag('job', 'max')
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
      required: false,
    },
    {
      name: 'team',
      label: 'Team',
      type: 'text',
      required: false,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
      required: false,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
    },
    {
      name: 'excerpts',
      label: 'Excerpts',
      type: 'textarea',
      required: false,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'level',
      label: 'Experiencce Level',
      type: 'select',
      required: false,
      defaultValue: 'Junior',
      options: [
        { label: 'Junior', value: 'Junior' },
        { label: 'Mid', value: 'Mid' },
        { label: 'Senior', value: 'Senior' },
        { label: 'Lead', value: 'Lead' },
        { label: 'C-Suite', value: 'C-Suite' },
      ],
    },
    {
      name: 'opened',
      label: 'Opened',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'closed',
      label: 'Closed',
      type: 'date',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'image',
      label: 'Image',
      type: 'relationship',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'active',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      required: false,
    },
  ],
}

export default Job
