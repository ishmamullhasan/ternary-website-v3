import Analytics from '@/collections/analytics'
import Capability from '@/collections/capability'
import Industry from '@/collections/industry'
import Insight from '@/collections/insight'
import Job from '@/collections/job'
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
import Footer from '@/globals/footer'
import Header from '@/globals/header'
import LegalCenter from '@/globals/legalCenter'
import { pruneAnalyticsTask } from '@/jobs/pruneAnalytics'
import plugins from '@/plugins'
import { getServerSideURL } from '@/utilities/getURL'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // First-party analytics dashboard (WEB-447) rendered above the admin home dashboard. This is
      // a path string resolved through the generated import map (pnpm generate:importmap), so the
      // server component never leaks into the client admin bundle.
      beforeDashboard: ['@/components/admin/AnalyticsDashboard'],
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
  editor: lexicalEditor(),
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
    Job,
    Team,
    Legal,
    // System group — keep last so it sorts to the bottom of the admin nav.
    Analytics,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, LegalCenter],
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
    // Retention: pruneAnalytics deletes pageview rows older than N days (default 90). Trigger it via
    // a Vercel Cron hitting the Payload jobs run endpoint (gated by CRON_SECRET above) — see the
    // scheduling note in src/jobs/pruneAnalytics.ts.
    tasks: [pruneAnalyticsTask],
  },
})
