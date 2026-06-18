import ContactRoutesSection from '@/components/sections/contactRoutes'
import type { ContactRoutesBlock } from '@/payload-types'
import type { JSX } from 'react'

export function ContactRoutesComponent(props: ContactRoutesBlock): JSX.Element | null {
  // Reuse the design-faithful section sub-component. The block's own props
  // ({ heading, description, items }) match its `data` shape exactly.
  return <ContactRoutesSection data={props as never} />
}
