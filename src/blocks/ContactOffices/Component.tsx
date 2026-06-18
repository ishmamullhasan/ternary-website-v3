import ContactOfficesSection from '@/components/sections/contactOffices'
import type { ContactOfficesBlock } from '@/payload-types'
import type { JSX } from 'react'

export function ContactOfficesComponent(props: ContactOfficesBlock): JSX.Element | null {
  // Reuse the design-faithful section sub-component. The block's own props
  // ({ heading, description, items }) match its `data` shape exactly.
  return <ContactOfficesSection data={props as never} />
}
