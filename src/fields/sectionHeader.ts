import type { Field } from 'payload'

type SectionHeaderOptions = {
  /** Use a richText description instead of a plain textarea. */
  richDescription?: boolean
}

/**
 * The {heading, description} pair that recurs across most marketing sections.
 * Returns an array of fields to spread into a `fields: [...]` list.
 */
export const sectionHeader = ({ richDescription = false }: SectionHeaderOptions = {}): Field[] => [
  { name: 'heading', label: 'Heading', type: 'text', localized: true },
  { name: 'description', label: 'Description', type: richDescription ? 'richText' : 'textarea', localized: true },
]
