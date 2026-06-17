import type { IndustriesSectionBlock, Industry } from '@/payload-types'

import type { JSX } from 'react'

import IndustryComp from '@/components/sections/industriesComp'

// Renders the real hand-built IndustryComp — the block only supplies its content.
export function IndustriesSectionComponent({ heading, description, industries }: IndustriesSectionBlock): JSX.Element {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)
  return <IndustryComp heading={heading} description={description} industry={items} />
}
