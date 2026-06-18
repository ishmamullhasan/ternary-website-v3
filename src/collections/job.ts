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
    group: 'Careers',
    description: 'Open job postings and their detail content.',
    useAsTitle: 'code',
    defaultColumns: ['code', 'title', 'location', 'active', 'updatedAt'],
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
      localized: true,
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
          localized: true,
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
      localized: true,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'type',
      label: 'Type',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'salary',
      label: 'Salary',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'excerpts',
      label: 'Excerpts',
      type: 'textarea',
      required: false,
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
      localized: true,
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
              localized: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: false,
              localized: true,
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
              localized: true,
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
                  localized: true,
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
              localized: true,
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
                  localized: true,
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
              localized: true,
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
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'teamBox',
      label: 'The Team (Sidebar)',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'reportingToName',
          label: 'Reporting To (Name)',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'reportingToRole',
          label: 'Reporting To (Role)',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'podSize',
          label: 'Pod Size',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'crossFunctional',
          label: 'Cross-Functional',
          type: 'text',
          required: false,
          localized: true,
        },
      ],
    },

    {
      name: 'compensationBox',
      label: 'Compensation (Sidebar)',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'base',
          label: 'Base Salary',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'equity',
          label: 'Equity',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'note',
          label: 'Note',
          type: 'textarea',
          required: false,
          localized: true,
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
          localized: true,
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
              localized: true,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
              type: 'textarea',
              required: false,
              localized: true,
            },
            {
              name: 'duration',
              label: 'Duration',
              type: 'text',
              required: false,
              localized: true,
              admin: {
                description: 'e.g. 30m, 1h',
              },
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
          localized: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          localized: true,
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
          localized: true,
        },
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
          localized: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          localized: true,
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
              localized: true,
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
