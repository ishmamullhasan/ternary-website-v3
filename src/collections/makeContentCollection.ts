import { detailPreviewURL } from '@/utilities/livePreview'
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
  adminOpts?: {
    group?: string
    description?: string
    defaultColumns?: string[]
    /**
     * Opt-in drafts + scheduled publishing (WEB-454). Off by default so the structurally identical
     * content collections that have no editorial-scheduling need (industry/model/solution) are not
     * forced into a versioned workflow. Only `story` enables it today. When on, public fetchers must
     * keep omitting `draft` (defaults to draft:false) so the site only renders published versions.
     */
    drafts?: boolean
    /**
     * Locale-less detail-route segment for the collection (e.g. `stories`). When set, enables admin
     * live preview routed through /next/preview → `/<locale>/<previewPathSegment>/<slug>` (WEB-449).
     */
    previewPathSegment?: string
  },
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
  // Spread the versions config in only when the caller opts in, so non-versioned collections keep
  // their original (versionless) shape and zero type-regen drift.
  ...(adminOpts?.drafts ? { versions: { drafts: { schedulePublish: true }, maxPerDoc: 20 } as const } : {}),
  admin: {
    useAsTitle: 'title',
    ...(adminOpts?.group ? { group: adminOpts.group } : {}),
    ...(adminOpts?.description ? { description: adminOpts.description } : {}),
    ...(adminOpts?.defaultColumns ? { defaultColumns: adminOpts.defaultColumns } : {}),
    ...(adminOpts?.previewPathSegment
      ? { livePreview: { url: ({ data }) => detailPreviewURL(slug, adminOpts.previewPathSegment!, data) } }
      : {}),
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text', localized: true },
    slugField(),
    { name: 'excerpts', label: 'Excerpts', type: 'textarea', localized: true },
    { name: 'thumbnail', label: 'Thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Content', type: 'richText', localized: true },
  ],
})
