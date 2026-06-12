import Capability from '@/collections/capability'
import Industry from '@/collections/industry'
import Job from '@/collections/job'
import Legal from '@/collections/legal'
import Media from '@/collections/media'
import Model from '@/collections/model'
import Scale from '@/collections/scale'
import Solution from '@/collections/solution'
import Story from '@/collections/story'
import Team from '@/collections/team'
import User from '@/collections/user'
import Footer from '@/globals/footer'
import Header from '@/globals/header'
import CareersPage from '@/globals/pages/careers'
import Homepage from '@/globals/pages/homepage'
import plugins from '@/plugins'
import { getServerSideURL } from '@/utilities/getURL'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import LegalCenter from './globals/legal-center'
import About from './globals/pages/about'
import IndustriesPage from './globals/pages/industriesPage'
import ScalesPage from './globals/pages/scalesPage'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {},
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
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [Media, User, Story, Capability, Solution, Industry, Scale, Model, Job, Team, Legal],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Homepage, CareersPage, About, LegalCenter, ScalesPage, IndustriesPage],
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
    tasks: [],
  },
})
