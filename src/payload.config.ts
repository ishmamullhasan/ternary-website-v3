import { Callout } from '@/blocks/Callout/config'
import { Table } from '@/blocks/Table/config'
import ActivityLog from '@/collections/activityLog'
import Analytics from '@/collections/analytics'
import Capability from '@/collections/capability'
import Industry from '@/collections/industry'
import Insight from '@/collections/insight'
import Legal from '@/collections/legal'
import Media from '@/collections/media'
import Model from '@/collections/model'
import Pages from '@/collections/Pages'
import PressRelease from '@/collections/pressRelease'
import Scale from '@/collections/scale'
import Solution from '@/collections/solution'
import Story from '@/collections/story'
import Team from '@/collections/team'
import User from '@/collections/user'
import { sesEmailAdapter } from '@/email/sesAdapter'
import ErrorPage from '@/globals/errorPage'
import Footer from '@/globals/footer'
import Header from '@/globals/header'
import LegalCenter from '@/globals/legalCenter'
import NotFound from '@/globals/notFound'
import Ops from '@/globals/ops'
import Revalidator from '@/globals/revalidator'
import { pruneAnalyticsTask } from '@/jobs/pruneAnalytics'
import plugins from '@/plugins'
import { getServerSideURL } from '@/utilities/getURL'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // Rendered above the admin home dashboard, top-to-bottom. These are path strings resolved
      // through the generated import map (pnpm generate:importmap), so server components never leak
      // into the client admin bundle.
      beforeDashboard: [
        // One-click whole-site cache revalidator (clears every content/global tag + the full page
        // cache).
        '@/components/admin/revalidate/CacheRevalidator',
        // First-party analytics dashboard (WEB-447).
        '@/components/admin/AnalyticsDashboard',
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: User.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // Richer Lexical editor (WEB-455). Keeps all defaultFeatures (paragraphs, headings,
  // blockquote, ordered/unordered lists, inline code, bold/italic/etc.) and layers on:
  //  - LinkFeature: internal links to the main content collections + external URLs.
  //  - UploadFeature: inline media images.
  //  - BlocksFeature: the reusable Callout + Table blocks (rendered via the JSX converter in
  //    src/components/richtext/index.tsx).
  //  - Fixed + Inline toolbars so the controls are always reachable.
  // Lexical features are config-level only and do not alter generated types — richText
  // values stay the generic SerializedEditorState shape.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      // Drop the stock heading feature (h1–h6) and re-add it restricted to h2–h4. The page's single
      // <h1> is owned by the hero block or the page shell, so an authored h1 in body copy creates a
      // second one; h5/h6 only ever appear via a skipped level. Toolbar-only — stored nodes are
      // untouched, and the JSX converter (components/richtext/index.tsx) still renders legacy h1.
      ...defaultFeatures.filter((f) => f.key !== 'heading'),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      LinkFeature({
        enabledCollections: ['pages', 'insight', 'pressRelease', 'story', 'capability'],
      }),
      UploadFeature({
        collections: {
          media: { fields: [] },
        },
      }),
      BlocksFeature({
        blocks: [Callout, Table],
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),
  // Amazon SES (SMTP). Resolves to undefined without SMTP creds so local dev/CI fall back to
  // Payload's console mock transport. See src/email/sesAdapter.ts.
  email: await sesEmailAdapter(),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Bengali', code: 'bn' },
    ],
    defaultLocale: 'en',
    fallback: true, // missing bn content falls back to en
  },
  db: mongooseAdapter({
    // Payload Cloud injects DATABASE_URI; local/.env.example use DATABASE_URL — accept both.
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
  }),
  collections: [
    Pages,
    Media,
    User,
    Story,
    Insight,
    PressRelease,
    Capability,
    Solution,
    Industry,
    Scale,
    Model,
    Team,
    Legal,
    // System group — keep last so it sorts to the bottom of the admin nav. Within the group, nav
    // order follows registration order.
    //
    // Audit trail. Rows are written by the activity-log plugin (src/plugins/activityLog.ts), which
    // hangs hooks off every other collection and global — including the ones plugins create.
    ActivityLog,
    Analytics,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, LegalCenter, NotFound, ErrorPage, Ops, Revalidator],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    // Auto-run the jobs queue so scheduled-publish jobs (WEB-454) actually execute. Payload enqueues
    // a publish job when an editor schedules a draft on pages/insight/pressRelease/story; this cron
    // promotes those drafts to published once their time arrives. autoRun runs the queue inside the
    // long-lived Node process (local/self-hosted). On Vercel, where the server is serverless and a
    // persistent cron timer cannot stay alive, autoRun is a no-op — instead point a Vercel Cron at
    // the Payload jobs run endpoint (gated by jobs.access.run / CRON_SECRET below), e.g. in
    // vercel.json: { "crons": [{ "path": "/api/payload-jobs/run", "schedule": "*/5 * * * *" }] }.
    autoRun: [
      {
        // Every 5 minutes. The leading field is the (optional) seconds slot in Payload's cron format.
        cron: '*/5 * * * *',
        // Run scheduled-publish jobs plus any other default-queue jobs (e.g. pruneAnalytics if it is
        // ever enqueued onto the default queue).
        queue: 'default',
      },
    ],
    // Only auto-run outside Vercel's serverless runtime; there the Vercel Cron above drives the queue.
    shouldAutoRun: () => !process.env.VERCEL,
    // Retention: pruneAnalytics deletes pageview rows older than N days (default 90). Trigger it via
    // a Vercel Cron hitting the Payload jobs run endpoint (gated by CRON_SECRET above) — see the
    // scheduling note in src/jobs/pruneAnalytics.ts.
    tasks: [pruneAnalyticsTask],
  },
})
