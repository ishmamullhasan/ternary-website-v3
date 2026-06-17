import { type CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { AboutPageSection } from '@/blocks/AboutPage/config'
import { CareersPageSection } from '@/blocks/CareersPage/config'
import { ContactPageSection } from '@/blocks/ContactPage/config'
import { Content } from '@/blocks/Content/config'
import { Cta } from '@/blocks/Cta/config'
import { FeatureGrid } from '@/blocks/FeatureGrid/config'
import { FormBlock } from '@/blocks/Form/config'
import { Hero } from '@/blocks/Hero/config'
import { homeSectionBlocks } from '@/blocks/homeSections/config'
import { IndustriesPageSection } from '@/blocks/IndustriesPage/config'
import { IndustriesSection } from '@/blocks/IndustriesSection/config'
import { Jobs } from '@/blocks/Jobs/config'
import { Logos } from '@/blocks/Logos/config'
import { RelationGrid } from '@/blocks/RelationGrid/config'
import { ScalesPageSection } from '@/blocks/ScalesPage/config'
import { SolutionsPageSection } from '@/blocks/SolutionsPage/config'
import { Steps } from '@/blocks/Steps/config'
import { StoriesPageSection } from '@/blocks/StoriesPage/config'
import { Team } from '@/blocks/Team/config'
import { getServerSideURL } from '@/utilities/getURL'

type Breadcrumb = { url?: string | null }

/** Build the preview URL from the page's nested-docs breadcrumb path (falls back to slug). */
const pageUrl = (data?: { slug?: unknown; breadcrumbs?: unknown }): string => {
  const crumbs = Array.isArray(data?.breadcrumbs) ? (data.breadcrumbs as Breadcrumb[]) : []
  const fromCrumbs = crumbs.length ? crumbs[crumbs.length - 1]?.url : null
  const path = fromCrumbs || (typeof data?.slug === 'string' ? `/${data.slug}` : '')
  return `${getServerSideURL()}${path}`
}

/**
 * Blocks-based page model (Epic A). Editors compose a page from the reusable block
 * library via `layout`, rather than the structure being frozen in code. Drafts +
 * autosave are enabled so live preview can show unpublished changes.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => pageUrl(data),
    },
    preview: (data) => pageUrl(data),
  },
  versions: {
    drafts: { autosave: { interval: 100 } },
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    slugField(),
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: [
        Hero,
        Content,
        RelationGrid,
        FeatureGrid,
        Logos,
        Team,
        Steps,
        Jobs,
        FormBlock,
        IndustriesSection,
        ...homeSectionBlocks,
        // Composite design-faithful page blocks (one per ported marketing page).
        AboutPageSection,
        SolutionsPageSection,
        IndustriesPageSection,
        ScalesPageSection,
        ContactPageSection,
        CareersPageSection,
        StoriesPageSection,
        Cta,
      ],
    },
  ],
}

export default Pages
