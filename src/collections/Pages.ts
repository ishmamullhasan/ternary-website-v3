import { type CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { Content } from '@/blocks/Content/config'
import { Cta } from '@/blocks/Cta/config'
import { Hero } from '@/blocks/Hero/config'
import { RelationGrid } from '@/blocks/RelationGrid/config'
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
      blocks: [Hero, Content, RelationGrid, Cta],
    },
  ],
}

export default Pages
