import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Site Settings',
    description: 'Site footer: menus, link columns, and copyright.',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('footer', { expire: 0 })
      },
    ],
  },
  fields: [
    // {
    //   name: 'contact',
    //   label: 'Contact Section',
    //   type: 'group',
    //   required: false,
    //   fields: [
    //     {
    //       name: 'heading',
    //       label: 'Heading',
    //       type: 'text',
    //       required: false,
    //     },
    //     {
    //       name: 'subtext',
    //       label: 'Subtext',
    //       type: 'text',
    //       required: false,
    //     },
    //     {
    //       name: 'emailPlaceholder',
    //       label: 'Email Placeholder',
    //       type: 'text',
    //       required: false,
    //     },
    //     {
    //       name: 'privacyText',
    //       label: 'Privacy Text',
    //       type: 'textarea',
    //       required: false,
    //     },
    //   ],
    // },
    {
      name: 'menu_1',
      label: 'Menu 1',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'logo',
          label: 'Logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'siteName',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
          required: false,
          localized: true,
        },
        {
          name: 'copyright',
          label: 'Copyright',
          type: 'text',
          required: false,
          localized: true,
        },
      ],
    },

    {
      name: 'capabilities',
      label: 'Capabilities',
      type: 'relationship',
      relationTo: 'capability',
      hasMany: true,
      required: false,
    },
    {
      name: 'solutions',
      label: 'Solutions',
      type: 'relationship',
      relationTo: 'solution',
      hasMany: true,
      required: false,
    },
    {
      name: 'industries',
      label: 'Industries',
      type: 'relationship',
      relationTo: 'industry',
      hasMany: true,
      required: false,
    },
    {
      name: 'menu_4',
      label: 'Company',
      type: 'group',
      required: false,
      fields: [
        {
          name: 'menu',
          label: 'Menu',
          type: 'array',
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
    {
      name: 'resources',
      label: 'Resources',
      type: 'group',
      required: false,
      admin: { description: 'Fourth free-link column (Stories, Scales, Newsroom, etc.).' },
      fields: [
        {
          name: 'menu',
          label: 'Menu',
          type: 'array',
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
    {
      name: 'legalLinks',
      label: 'Legal Links',
      type: 'array',
      required: false,
      admin: { description: 'Small legal links shown inline in the footer bottom bar (Terms, Privacy, etc.).' },
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
      name: 'socialLinks',
      label: 'Social Links',
      type: 'array',
      required: false,
      admin: { description: 'Social media icons shown in the footer bottom bar.' },
      fields: [
        {
          name: 'platform',
          label: 'Platform',
          type: 'select',
          required: false,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'X (Twitter)', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'GitHub', value: 'github' },
          ],
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
      name: 'partners',
      label: 'Partner Badges',
      type: 'array',
      required: false,
      maxRows: 4,
      admin: {
        description:
          'The four white pill logos at the bottom-right of the footer. Each takes a logo image and an optional link.',
      },
      fields: [
        {
          name: 'logo',
          label: 'Logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: false,
          localized: true,
          admin: { description: 'Used as the accessible label and as a text fallback when no logo image is set.' },
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
}

export default Footer
