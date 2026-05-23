import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

const LegalCenter: GlobalConfig = {
  slug: 'legal-center',
  label: 'Legal Menu Sidebar',
  hooks: {
    afterChange: [
      () => {
        revalidateTag('legal-center', 'max')
        revalidateTag('legal', 'max')
      },
    ],
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Legal Center',
    },
    {
      name: 'description',
      type: 'text',
      defaultValue: 'Institutional-grade transparency. Reviewed by external counsel.',
    },
    {
      name: 'menuTitle',
      label: 'Menu section title',
      type: 'text',
      required: false,
    },
    {
      name: 'noticeTitle',
      label: 'Notice Title',
      type: 'text',
      defaultValue: 'Compliance Notice',
    },
    {
      name: 'noticeDescription',
      label: 'Notice Description',
      type: 'text',
      defaultValue: 'These documents are strictly for procurement review. Do not consider them legal advice.',
    },
  ],
}

export default LegalCenter
