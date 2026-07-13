import { authConfig } from '@/auth.config'
import { sendFormSubmissionNotification } from '@/plugins/formSubmissionNotification'
import { getServerSideURL } from '@/utilities/getURL'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { BeforeSync, SearchPluginConfig } from '@payloadcms/plugin-search/types'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Field, Plugin } from 'payload'
import { authjsPlugin } from 'payload-authjs'
import { activityLogPlugin } from './activityLog'
import { liveRefreshPlugin } from './liveRefresh'

const generateTitle = ({ doc }: { doc?: { title?: string | null } }) => {
  return doc?.title ? `${doc.title} | Ternary` : 'Ternary'
}

const generateURL = ({ doc }: { doc?: { slug?: string | null } }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

// Collections fed into the global site search (WEB-456). Each synced search doc carries enough
// to render a linked result without a second read: title, slug, excerpt, and the source `type`.
const SEARCHABLE_COLLECTIONS = ['insight', 'pressRelease', 'story', 'capability'] as const

// Newsroom items rank above evergreen content so fresh announcements surface first.
const searchDefaultPriorities: NonNullable<SearchPluginConfig['defaultPriorities']> = {
  pressRelease: 40,
  insight: 30,
  story: 20,
  capability: 10,
}

// Extra renderable fields appended to the plugin's default search schema (title/priority/doc/docUrl).
const searchExtraFields: Field[] = [
  {
    name: 'type',
    type: 'text',
    index: true,
    admin: { readOnly: true, description: 'Source collection slug (insight, pressRelease, story, capability).' },
  },
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: { readOnly: true },
  },
  {
    name: 'excerpt',
    type: 'textarea',
    admin: { readOnly: true },
  },
]

// Copy the renderable fields from the source doc into the search doc on every save. The plugin
// already sets `title` and `doc`; we add `type`, `slug`, and `excerpt` so the search page can link
// straight to the real detail route and show a summary with no follow-up fetch.
const searchBeforeSync: BeforeSync = ({ originalDoc, searchDoc, collectionSlug }) => {
  const title = typeof originalDoc?.title === 'string' ? originalDoc.title : searchDoc.title
  const slug = typeof originalDoc?.slug === 'string' ? originalDoc.slug : ''
  // `excerpts` is the canonical summary field across these collections; `summary`/`excerpt` are
  // tolerated as fallbacks for forward-compat.
  const excerpt =
    typeof originalDoc?.excerpts === 'string'
      ? originalDoc.excerpts
      : typeof originalDoc?.summary === 'string'
        ? originalDoc.summary
        : typeof originalDoc?.excerpt === 'string'
          ? originalDoc.excerpt
          : ''

  return {
    ...searchDoc,
    title,
    type: collectionSlug,
    slug,
    excerpt,
  }
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
    // WEB-452: email every new submission to the team inbox via the SES adapter. The hook
    // is fire-and-forget (try/catch inside) so a mail failure never blocks the submission.
    formSubmissionOverrides: {
      hooks: {
        afterChange: [sendFormSubmissionNotification],
      },
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
  // Global site search (WEB-456). Creates a `search` collection the plugin keeps in sync via an
  // afterChange hook on each source collection — `beforeSync` copies title/slug/excerpt/type into
  // each search doc so the /[locale]/search page can render linked results from one read. The
  // search collection is publicly readable by default; writes are plugin-only.
  searchPlugin({
    collections: [...SEARCHABLE_COLLECTIONS],
    defaultPriorities: searchDefaultPriorities,
    beforeSync: searchBeforeSync,
    searchOverrides: {
      fields: ({ defaultFields }) => [...defaultFields, ...searchExtraFields],
    },
  }),
  // Google Workspace SSO into the admin (Auth.js v5). Registered unconditionally so the
  // /api/auth route and auth strategy are always present; the "Sign in with Google" button only
  // appears once AUTH_GOOGLE_ID/SECRET enable the provider in auth.config.ts. Email/password
  // login is unaffected. See docs/claude/google-admin-sso.md.
  authjsPlugin({ authjsConfig: authConfig }),
  // Audit trail. Like liveRefresh below, it walks config.collections/globals and hangs a hook off
  // every one, so it has to run after every plugin that ADDS a collection — `forms` and
  // `form-submissions` (formBuilderPlugin), `search` (searchPlugin), and the Auth.js session fields
  // authjsPlugin grafts onto `users`, which are what make an SSO sign-in visible at all. Ordering it
  // before those would silently leave their writes unaudited.
  activityLogPlugin,
  // Live refresh (WEB-490). MUST stay last: it walks config.collections/globals appending the
  // content-version bump hook, so it has to run after every other plugin has finished adding its own
  // collections — otherwise `forms` (formBuilderPlugin) and friends are invisible to it.
  liveRefreshPlugin,
]

export default plugins
