import type { Block } from 'payload'

/** Renders a form built with the form-builder plugin (e.g. the contact form). */
export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlockType',
  labels: { singular: 'Form', plural: 'Forms' },
  fields: [
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'form', label: 'Form', type: 'relationship', relationTo: 'forms', required: true },
  ],
}
