import { revalidateTag } from 'next/cache'
import { type CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

/**
 * Factory for the simple {title, slug, excerpts, thumbnail, content} content collections
 * (story, insight, solution, industry, model) that were previously five byte-identical
 * files. The slug drives both the collection slug and its revalidation tags, so output is
 * schema-identical to the hand-written versions (verified: zero type-regen drift).
 */
export const makeContentCollection = (
  slug: string,
  adminOpts?: { group?: string; description?: string; defaultColumns?: string[] },
): CollectionConfig => ({
  slug,
  // Public marketing content: world-readable so the site can populate these relationships
  // (else SSR/REST reads are access-filtered and sections render empty). Writes stay staff-only.
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`${slug}_${doc.slug}`, 'max')
        }
        revalidateTag(slug, 'max')
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    ...(adminOpts?.group ? { group: adminOpts.group } : {}),
    ...(adminOpts?.description ? { description: adminOpts.description } : {}),
    ...(adminOpts?.defaultColumns ? { defaultColumns: adminOpts.defaultColumns } : {}),
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text', localized: true },
    slugField(),
    { name: 'excerpts', label: 'Excerpts', type: 'textarea', localized: true },
    { name: 'thumbnail', label: 'Thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Content', type: 'richText', localized: true },
  ],
})
