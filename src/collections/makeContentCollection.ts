import { revalidateTag } from 'next/cache'
import { type CollectionConfig, slugField } from 'payload'

/**
 * Factory for the simple {title, slug, excerpts, thumbnail, content} content collections
 * (story, insight, solution, industry, model) that were previously five byte-identical
 * files. The slug drives both the collection slug and its revalidation tags, so output is
 * schema-identical to the hand-written versions (verified: zero type-regen drift).
 */
export const makeContentCollection = (slug: string): CollectionConfig => ({
  slug,
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
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text', localized: true },
    slugField(),
    { name: 'excerpts', label: 'Excerpts', type: 'textarea', localized: true },
    { name: 'thumbnail', label: 'Thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Content', type: 'richText', localized: true },
  ],
})
