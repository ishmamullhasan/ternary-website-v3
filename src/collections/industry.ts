import type { CollectionConfig } from 'payload'

import { CrossIndustryPatterns } from '@/blocks/CrossIndustryPatterns/config'
import { Cta } from '@/blocks/Cta/config'
import { IndustriesDetails } from '@/blocks/IndustriesDetails/config'
import { IndustriesHero } from '@/blocks/IndustriesHero/config'
import { IndustriesSection } from '@/blocks/IndustriesSection/config'
import { IndustryPanels } from '@/blocks/IndustryPanels/config'
import { RegulatoryPosture } from '@/blocks/RegulatoryPosture/config'
import { makeContentCollection } from '@/collections/makeContentCollection'

const base = makeContentCollection('industry', {
  group: 'Content',
  description: 'Industry verticals and their landing content.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
})

// Detail pages render `layout` (the redesigned, block-driven sections) when present, and fall back
// to the simple {title, excerpts, content} presentation otherwise — so existing rows are unaffected
// (this only adds a field; MongoDB leaves stored docs untouched). The block set mirrors the
// industry-detail Figma: intro → benefit grid → operators statement → showcase panels →
// structural-leverage feature → compliance cards → CTA.
const industry: CollectionConfig = {
  ...base,
  fields: [
    ...base.fields,
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: [
        IndustriesHero,
        IndustriesSection,
        IndustriesDetails,
        IndustryPanels,
        CrossIndustryPatterns,
        RegulatoryPosture,
        Cta,
      ],
    },
  ],
}

export default industry
