import type { Field } from 'payload'

type SectionHeaderOptions = {
  /** Use a richText heading instead of a plain text input. */
  richHeading?: boolean
}

/**
 * The {heading, description} pair that recurs across most marketing sections.
 * Returns an array of fields to spread into a `fields: [...]` list.
 */
export const sectionHeader = ({ richHeading = false }: SectionHeaderOptions = {}): Field[] => [
  // Ternary between two fully-formed field objects (each with a literal `type`) so TS infers a
  // concrete, valid Field on each branch — a single `type: cond ? 'richText' : 'text'` widens to a
  // union that isn't assignable to the discriminated Field type.
  richHeading
    ? { name: 'heading', label: 'Heading', type: 'richText', localized: true }
    : { name: 'heading', label: 'Heading', type: 'text', localized: true },
  { name: 'description', label: 'Description', type: 'richText', localized: true },
]
