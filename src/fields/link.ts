import type { Field, GroupField } from 'payload'

type ButtonOptions = {
  /** Make the URL mandatory. Blank values are coerced to `#` so a save is never blocked. */
  requiredLink?: boolean
}

/**
 * A reusable {label, link} button group. `name`/`label` are passed so existing field
 * names are preserved exactly (e.g. `button`, `button_1`, `button_2`) — important for
 * not orphaning stored content.
 *
 * With `requiredLink`, the URL becomes mandatory and defaults to `#`; a `beforeValidate`
 * hook coerces any empty value back to `#`, so "blank" is stored as `#` rather than failing.
 */
export const buttonGroup = (name: string, label: string, { requiredLink = false }: ButtonOptions = {}): GroupField => {
  const link: Field = { name: 'link', label: 'Link', type: 'text' }
  if (requiredLink) {
    link.required = true
    link.defaultValue = '#'
    link.hooks = {
      beforeValidate: [({ value }) => (typeof value === 'string' && value.trim() ? value : '#')],
    }
  }

  return {
    name,
    label,
    type: 'group',
    fields: [{ name: 'label', label: 'Label', type: 'text', localized: true }, link],
  }
}
