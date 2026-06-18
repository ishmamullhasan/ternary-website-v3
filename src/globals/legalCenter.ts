import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

const LegalCenter: GlobalConfig = {
  slug: 'legalCenter',
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
      localized: true,
    },
    {
      name: 'description',
      type: 'text',
      defaultValue: 'Institutional-grade transparency. Reviewed by external counsel.',
      localized: true,
    },
    {
      name: 'menuTitle',
      label: 'Menu section title',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'noticeTitle',
      label: 'Notice Title',
      type: 'text',
      defaultValue: 'Compliance Notice',
      localized: true,
    },
    {
      name: 'noticeDescription',
      label: 'Notice Description',
      type: 'text',
      defaultValue: 'These documents are strictly for procurement review. Do not consider them legal advice.',
      localized: true,
    },
  ],
}

export default LegalCenter
