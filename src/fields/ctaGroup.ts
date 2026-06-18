import type { GroupField } from 'payload'

import { buttonGroup } from './link'

type CtaOptions = {
  /** Include a `subheading` text field above the heading (e.g. job CTA). */
  subheading?: boolean
  /** Single `button` group instead of `button_1` + `button_2`. */
  singleButton?: boolean
}

/**
 * The call-to-action group, previously hand-duplicated across ~9 collections/globals.
 * Options reproduce each variant's EXACT field names so adopting it requires no data
 * migration. Default = legal/about/etc. shape (heading, description, backgroundImage,
 * button_1, button_2).
 */
export const ctaGroup = ({ subheading = false, singleButton = false }: CtaOptions = {}): GroupField => {
  const fields: GroupField['fields'] = []

  if (subheading) fields.push({ name: 'subheading', label: 'Subheading', type: 'text', localized: true })
  fields.push({ name: 'heading', label: 'Heading', type: 'text', localized: true })
  fields.push({ name: 'description', label: 'Description', type: 'textarea', localized: true })
  fields.push({ name: 'backgroundImage', label: 'Background Image', type: 'upload', relationTo: 'media' })

  if (singleButton) {
    fields.push(buttonGroup('button', 'Button'))
  } else {
    fields.push(buttonGroup('button_1', 'Button 1'))
    fields.push(buttonGroup('button_2', 'Button 2'))
  }

  return { name: 'cta', label: 'CTA', type: 'group', fields }
}
