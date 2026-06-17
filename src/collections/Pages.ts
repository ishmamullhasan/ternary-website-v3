import { type CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { Content } from '@/blocks/Content/config'
import { Cta } from '@/blocks/Cta/config'
import { Hero } from '@/blocks/Hero/config'
import { RelationGrid } from '@/blocks/RelationGrid/config'
import { getServerSideURL } from '@/utilities/getURL'

const pageUrl = (slug: unknown): string => `${getServerSideURL()}/${typeof slug === 'string' ? slug : ''}`

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
      url: ({ data }) => pageUrl(data?.slug),
    },
    preview: (data) => pageUrl(data?.slug),
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
