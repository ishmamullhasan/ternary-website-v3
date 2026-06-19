import { authConfig } from '@/auth.config'
import { getServerSideURL } from '@/utilities/getURL'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { authjsPlugin } from 'payload-authjs'

const generateTitle = ({ doc }: { doc?: { title?: string | null } }) => {
  return doc?.title ? `${doc.title} | Ternary Solutions` : 'Ternary Solutions'
}

const generateURL = ({ doc }: { doc?: { slug?: string | null } }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

const plugins: Plugin[] = [
  payloadCloudPlugin(),
  // Adds `parent` + computed `breadcrumbs` to Pages, so editors can build page trees
  // and the URL derives from the hierarchy (e.g. /solutions/enterprise).
  nestedDocsPlugin({
    collections: ['pages'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${typeof doc.slug === 'string' ? doc.slug : ''}`, ''),
    generateLabel: (_, doc) => (typeof doc.title === 'string' ? doc.title : ''),
  }),
  formBuilderPlugin({
    fields: {
      text: true,
      textarea: true,
      select: true,
      email: true,
      state: true,
      country: true,
      checkbox: true,
      number: true,
      message: true,
      date: true,
      radio: true,
      payment: false,
    },
  }),
  s3Storage({
    collections: {
      media: {
        prefix: process.env.S3_MEDIA_PREFIX,
      },
    },
    bucket: process.env.S3_BUCKET as string,
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
      region: process.env.S3_REGION,
      // ... Other S3 configuration
    },
    // clientUploads: true,
  }),
  // SEO meta attach point. The plugin injects a `meta` group (meta.title / meta.description /
  // meta.image). The `fields` callback receives that group's default inner fields and returns
  // the group's final field list, so spreading `defaultFields` and appending below adds our
  // three custom fields INTO the meta group. WEB-443 reads meta.* for generateMetadata /
  // sitemap / JSON-LD — this is purely the schema attach point; nothing reads it yet.
  // tabbedUI is intentionally left off so the existing admin field layout is not restructured.
  seoPlugin({
    collections: [
      'pages',
      'story',
      'insight',
      'solution',
      'capability',
      'industry',
      'scale',
      'model',
      'pressRelease',
      'legal',
      'job',
    ],
    uploadsCollection: 'media',
    generateTitle,
    generateURL,
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'canonical',
        type: 'text',
        admin: {
          description: "Override canonical URL. Leave blank to use the page's own URL.",
        },
      },
      {
        name: 'hideFromSitemap',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'Exclude this entry from the XML sitemap.',
        },
      },
      {
        name: 'twitterCard',
        type: 'select',
        options: ['summary', 'summary_large_image'],
        defaultValue: 'summary_large_image',
      },
    ],
  }),
  // Google Workspace SSO into the admin (Auth.js v5). Registered unconditionally so the
  // /api/auth route and auth strategy are always present; the "Sign in with Google" button only
  // appears once AUTH_GOOGLE_ID/SECRET enable the provider in auth.config.ts. Email/password
  // login is unaffected. See docs/claude/google-admin-sso.md.
  authjsPlugin({ authjsConfig: authConfig }),
]

export default plugins
