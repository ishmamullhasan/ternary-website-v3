import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const Header: GlobalConfig = {
  slug: 'header',
  label: 'header',
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_header')
      },
    ],
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
      name: 'siteName',
      type: 'text',
    },
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
}

export default Header
