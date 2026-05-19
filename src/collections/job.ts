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
      name: 'button',
      label: 'Apply Now Button',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: false,
        },
        {
          name: 'link',
          label: 'Link',
          type: 'text',
          required: false,
        },
      ],
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
      name: 'type',
      label: 'Type',
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
      name: 'salary',
      label: 'Salary',
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
      label: 'Experience Level',
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

    {
      name: 'details',
      label: 'Details Section',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'item1',
          label: 'The Mission',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: false,
            },
          ],
        },
        {
          name: 'item2',
          label: 'What you will do',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'points',
              label: 'Points',
              type: 'array',
              required: false,
              fields: [
                {
                  name: 'point',
                  label: 'Point',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: 'item3',
          label: 'Who you are',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'points',
              label: 'Points',
              type: 'array',
              required: false,
              fields: [
                {
                  name: 'point',
                  label: 'Point',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: 'item4',
          label: 'Nice-to-Haves:',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'points',
              label: 'Points',
              type: 'array',
              required: false,
              fields: [
                {
                  name: 'point',
                  label: 'Point',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'interviewProcess',
      label: 'Interview Process',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'steps',
          label: 'Steps',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
              type: 'textarea',
              required: false,
            },
          ],
        },
      ],
    },

    {
      name: 'openRoles',
      label: 'Other Open Roles',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'jobs',
          label: 'Jobs',
          type: 'relationship',
          relationTo: 'job',
          hasMany: true,
          required: false,
        },
      ],
    },

    {
      name: 'cta',
      label: 'CTA',
      type: 'group',
      fields: [
        {
          name: 'subheading',
          label: 'Subheading',
          type: 'text',
          required: false,
        },
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },

        {
          name: 'button',
          label: 'Button',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export default Job
