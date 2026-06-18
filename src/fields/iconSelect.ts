import type { SelectField } from 'payload'

const pretty = (s: string): string => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

type IconSelectOptions = { name?: string; label?: string; defaultValue?: string; description?: string }

/**
 * Typed icon picker constrained to the icon names a block's renderer actually supports.
 * Pass the allowed lucide-style names (e.g. ['lock','activity','check']).
 */
export const iconSelect = (
  icons: string[],
  { name = 'icon', label = 'Icon', defaultValue, description }: IconSelectOptions = {},
): SelectField => ({
  name,
  label,
  type: 'select',
  defaultValue: defaultValue ?? icons[0],
  options: icons.map((i) => ({ label: pretty(i), value: i })),
  admin: { description: description ?? 'Icon shown on this item.' },
})
