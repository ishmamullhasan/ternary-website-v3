import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const ContactForm: Block = {
  slug: 'contactForm',
  interfaceName: 'ContactFormBlock',
  labels: { singular: 'Contact Form', plural: 'Contact Forms' },
  fields: [
    ...sectionHeader(),
    {
      name: 'form',
      label: 'Form',
      type: 'relationship',
      relationTo: 'forms',
      required: false,
      admin: {
        description: 'Pick a form to show a "Send us a message" section. Leave empty to hide the section.',
      },
    },
  ],
}

export default ContactForm
