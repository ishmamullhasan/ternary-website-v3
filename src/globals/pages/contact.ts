import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const ContactPage: GlobalConfig = {
  slug: 'contactPage',
  label: 'Contact',
  admin: {
    group: 'Pages',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('contactPage', 'max')
      },
    ],
  },
  fields: [
    {
      name: 'hero',
      label: 'Hero Section',
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
          name: 'button_1',
          label: 'Button 1',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', required: false },
            { name: 'link', label: 'Link', type: 'text', required: false },
          ],
        },
        {
          name: 'button_2',
          label: 'Button 2',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', required: false },
            { name: 'link', label: 'Link', type: 'text', required: false },
          ],
        },
      ],
    },

    {
      name: 'stats',
      label: 'Response-time Stats',
      type: 'array',
      admin: {
        description: 'Response-time cards shown below the hero.',
      },
      fields: [
        { name: 'value', label: 'Value', type: 'text', required: false },
        { name: 'label', label: 'Label', type: 'text', required: false },
        { name: 'detail', label: 'Detail', type: 'text', required: false },
      ],
    },

    {
      name: 'routes',
      label: 'Contact Routes',
      type: 'group',
      admin: {
        description: 'The icon and gradient for each route is fixed in code by position.',
      },
      fields: [
        { name: 'heading', label: 'Heading', type: 'textarea', required: false },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        {
          name: 'items',
          label: 'Routes',
          type: 'array',
          fields: [
            { name: 'title', label: 'Title', type: 'text', required: false },
            { name: 'description', label: 'Description', type: 'textarea', required: false },
            { name: 'email', label: 'Email', type: 'text', required: false },
            { name: 'replyWindow', label: 'Reply Window', type: 'text', required: false },
            { name: 'cta', label: 'CTA Label', type: 'text', required: false },
            {
              name: 'info',
              label: 'Show Info Icon',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'bestFor',
              label: 'Best For',
              type: 'array',
              fields: [{ name: 'item', label: 'Item', type: 'text', required: false }],
            },
          ],
        },
      ],
    },

    {
      name: 'offices',
      label: 'Offices',
      type: 'group',
      fields: [
        { name: 'heading', label: 'Heading', type: 'text', required: false },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        {
          name: 'items',
          label: 'Offices',
          type: 'array',
          fields: [
            { name: 'city', label: 'City', type: 'text', required: false },
            { name: 'tag', label: 'Tag', type: 'text', required: false },
            { name: 'timezone', label: 'Timezone', type: 'text', required: false },
            { name: 'hours', label: 'Hours', type: 'text', required: false },
            { name: 'email', label: 'Email', type: 'text', required: false },
            { name: 'phone', label: 'Phone', type: 'text', required: false },
            {
              name: 'address',
              label: 'Address',
              type: 'array',
              fields: [{ name: 'line', label: 'Line', type: 'text', required: false }],
            },
          ],
        },
      ],
    },

    {
      name: 'form',
      label: 'Contact Form',
      type: 'group',
      admin: {
        description: 'Pick a form to show a "Send us a message" section. Leave empty to hide the section.',
      },
      fields: [
        { name: 'heading', label: 'Heading', type: 'text', required: false },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        {
          name: 'form',
          label: 'Form',
          type: 'relationship',
          relationTo: 'forms',
          required: false,
        },
      ],
    },

    {
      name: 'cta',
      label: 'CTA Banner',
      type: 'group',
      fields: [
        { name: 'heading', label: 'Heading', type: 'text', required: false },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        {
          name: 'button_1',
          label: 'Button 1',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', required: false },
            { name: 'link', label: 'Link', type: 'text', required: false },
          ],
        },
        {
          name: 'button_2',
          label: 'Button 2',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', required: false },
            { name: 'link', label: 'Link', type: 'text', required: false },
          ],
        },
      ],
    },
  ],
}

export default ContactPage
