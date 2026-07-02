import type { CollectionConfig } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateTag } from 'next/cache'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { ALL_CACHE_TAGS } from '@/utilities/cacheTags'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Media docs are depth-populated (URLs, sizes, alt) into cached reads of every collection, global
// and page layout — there is no per-media tag on the read side. So a media edit (alt text, focal
// point, replaced file) or delete must bust every content/global tag; otherwise the embedding pages
// keep serving the stale copy forever under pure tag-based revalidation. Media edits are rare, so
// the blanket bust is an acceptable trade for correctness.
const bustAllTags = () => {
  for (const tag of ALL_CACHE_TAGS) revalidateTag(tag, 'max')
}

const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [bustAllTags],
    afterDelete: [bustAllTags],
  },
  admin: {
    group: 'System',
    description: 'Uploaded images and files used across the site.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Restrict uploads to images so the sharp pipeline below always applies.
    mimeTypes: ['image/*'],
    // Emit the original upload as WebP — broadly supported by all modern browsers
    // and far smaller than JPEG/PNG. Each derivative below inherits this format
    // unless it sets its own `formatOptions`.
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
    imageSizes: [
      // Small fixed-fit derivatives (e.g. admin/list thumbnails, avatars).
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        fit: 'cover',
        withoutEnlargement: true,
      },
      {
        name: 'small',
        width: 600,
        fit: 'inside',
        withoutEnlargement: true,
      },
      // Responsive content widths.
      {
        name: 'card',
        width: 768,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'medium',
        width: 900,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'tablet',
        width: 1024,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'large',
        width: 1400,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'desktop',
        width: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'xlarge',
        width: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      },
      // Open Graph / social card. Cropped to the exact 1.91:1 ratio social
      // platforms expect, and pinned to JPEG for the widest scraper support.
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
        fit: 'cover',
        withoutEnlargement: false,
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
    ],
  },
}

export default Media
