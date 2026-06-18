import type { GroupField } from 'payload'

/**
 * A reusable {label, link} button group. `name`/`label` are passed so existing field
 * names are preserved exactly (e.g. `button`, `button_1`, `button_2`) — important for
 * not orphaning stored content.
 */
export const buttonGroup = (name: string, label: string): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', label: 'Label', type: 'text', localized: true },
    { name: 'link', label: 'Link', type: 'text' },
  ],
})
