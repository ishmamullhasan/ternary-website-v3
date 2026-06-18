# GUIDE — Building & Maintaining a Payload-based Website

This is the working playbook for building a Payload-based website: a **Payload CMS 3**
backend (MongoDB) running inside a **Next.js 16 App Router** app, with **Tailwind v4** on
the front end. It documents the conventions to follow — file layout, naming,
data-fetching, caching/revalidation, and the step-by-step recipes for adding new
content types and pages — so every new collection, global, and page looks like the
samples here. Concrete names (`contactPage`, `legals`, `careers-colors`, …) are examples
from a reference project; swap them for your own.

> Source of truth is the `GUIDE.md`. When this guide and the code disagree, the
> `GUIDE.md` wins — bring the code in line with it. Every code block below mirrors a real
> file in the reference project; keep your code and this guide in sync as conventions evolve.

---

## 1. Stack & key versions

| Area        | Choice                                                                       |
| ----------- | ---------------------------------------------------------------------------- |
| CMS         | Payload `^3.85` (`buildConfig`, Lexical editor)                              |
| Framework   | Next.js `^16` App Router, React `^19`                                        |
| Database    | MongoDB via `@payloadcms/db-mongodb` (`mongooseAdapter`)                     |
| Media       | `@payloadcms/storage-s3` (S3) + local `public/media`                         |
| Styling     | Tailwind CSS `^4` (`@tailwindcss/postcss`, `@tailwindcss/typography`)        |
| Rich text   | `@payloadcms/richtext-lexical` + a custom serializer (`components/richtext`) |
| Forms       | `@payloadcms/plugin-form-builder` + native `FormData` POST (see §7)          |
| SEO         | `@payloadcms/plugin-seo`                                                     |
| Icons       | `lucide-react`                                                               |
| Animation   | `motion` (Framer Motion successor)                                           |
| UI          | Radix primitives + `class-variance-authority` / `clsx` / `tailwind-merge`    |
| Package mgr | `pnpm` (`^10/^11`)                                                           |

> `react-hook-form`, `zod`, and `@hookform/resolvers` are installed, but the current
> contact/apply forms do **not** use them — they use native `FormData`/`useState` (see
> §7). Reach for RHF+zod only if you add a genuinely complex client form.

Common scripts (`package.json`):

```bash
pnpm dev               # cross-env … next dev
pnpm build             # next build  (postbuild → next-sitemap)
pnpm generate:types    # regenerate src/payload-types.ts  ← run after schema changes
pnpm generate:importmap
pnpm lint / pnpm lint:fix
pnpm format            # prettier --write
pnpm test              # test:int (vitest) + test:e2e (playwright)
```

---

## 2. Repository layout

Sample layout from the reference project. The **directory roles** are the convention; the
specific route / collection / global names are examples to replace with your own.

```
.
├── public/media/                         # local media mirror (S3 is the source of truth)
├── src/
│   ├── access/                           # authenticated.ts, anyone.ts
│   ├── app/
│   │   ├── (frontend)/                   # public site — one folder per route
│   │   │   ├── layout.tsx                # fetches header/footer; sets revalidate = 0
│   │   │   ├── page.tsx                  # homepage  (fetches the `home` Page, blocks-driven)
│   │   │   ├── [...slug]/page.tsx        # catch-all: every landing page (about/careers/
│   │   │   │                             #   contact/industries/scales/solutions/stories…)
│   │   │   │                             #   is a Pages doc rendered via RenderBlocks
│   │   │   ├── stories/[slug]/page.tsx   # collection detail (story docs)
│   │   │   ├── capabilities/[slug]/page.tsx
│   │   │   ├── insights/[slug]/page.tsx
│   │   │   ├── legals/[slug]/page.tsx
│   │   │   ├── press-release/[slug]/page.tsx
│   │   │   ├── job/[slug]/page.tsx       # + job/[slug]/apply/page.tsx  (lib/ accessor)
│   │   │   └── next/                     # preview · exit-preview · seed routes
│   │   └── (payload)/                    # Payload admin + REST/GraphQL (generated; don't edit)
│   ├── collections/                      # one file per collection (singular, lowercase)
│   │   ├── media.ts  user.ts  story.ts  insight.ts  pressRelease.ts
│   │   ├── capability.ts  solution.ts  industry.ts  scale.ts  model.ts
│   │   └── job.ts  team.ts  legal.ts
│   ├── globals/
│   │   └── header.ts  footer.ts  legalCenter.ts      # site-wide chrome (the only globals)
│   │                                     # Page globals were retired (WEB-404): landing pages
│   │                                     # now live in the Pages collection as blocks.
│   ├── blocks/                           # the block library + RenderBlocks.tsx (page rendering)
│   ├── components/
│   │   ├── animation/                    # motion.tsx (wrapper), corousel.tsx
│   │   ├── grids/                        # one.tsx, two.tsx, three.tsx
│   │   ├── layout/                       # section.tsx, sectionColumn.tsx, bentoCard.tsx
│   │   ├── sections/                     # page-section components (typed `data` props)
│   │   ├── richtext/                     # Lexical serializer (index.tsx + serialize.tsx)
│   │   └── ui/                           # Radix/shadcn primitives
│   ├── endpoints/seed/                   # one-off seed endpoint
│   ├── lib/                              # non-Payload data + tokens (jobs-data, careers-colors)
│   ├── plugins/index.ts                  # all Payload plugins, configured in one array
│   ├── utilities/                        # getGlobals, getURL, getMediaUrl, contentDetailPage, deepMerge…
│   ├── payload.config.ts                 # buildConfig — registers everything
│   └── payload-types.ts                  # GENERATED — never edit by hand
├── .prettierrc  .editorconfig  eslint.config.mjs    # formatting / linting (see §9)
├── next.config.js  tailwind.config.mjs  postcss.config.mjs
├── next-sitemap.config.cjs  redirects.js
├── docker-compose.yml  Dockerfile  Makefile
└── package.json  pnpm-lock.yaml  tsconfig.json
```

Path aliases (`tsconfig.json`):

- `@/*` → `src/*`
- `@payload-config` → `src/payload.config.ts`

Pages import the config as a **value** for `getPayload`:

```ts
import config from '@/payload.config' // in (frontend) pages
import configPromise from '@payload-config' // in shared utilities (src/utilities/getGlobals.ts)
```

---

## 3. Central config (`src/payload.config.ts`)

Everything is registered here. The order of the arrays is the order shown in admin. The
collections/globals listed below are a **sample set** — your project's arrays will differ.

```ts
export default buildConfig({
  admin: {
    user: User.slug,
    livePreview: {
      breakpoints: [
        /* mobile, tablet, desktop */
      ],
    },
  },
  editor: lexicalEditor(),
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  collections: [
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
  ],
  globals: [
    Header,
    Footer,
    Homepage,
    CareersPage,
    About,
    LegalCenter,
    ScalesPage,
    IndustriesPage,
    SolutionsPage,
    ContactPage,
    StoriesPage,
  ],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
```

**Rule:** a new collection or global is not "done" until it is added to the relevant
array here **and** `pnpm generate:types` has been run.

### Environment variables

| Var                      | Purpose                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `DATABASE_URI`           | Mongo connection string (config reads this)                                             |
| `PAYLOAD_SECRET`         | JWT/crypto secret                                                                       |
| `NEXT_PUBLIC_SERVER_URL` | Canonical site URL (CORS, SEO, media — read by `getServerSideURL`)                      |
| `CRON_SECRET`            | Authorizes Payload job runs (`Bearer <CRON_SECRET>` on the `authorization` header)      |
| `PREVIEW_SECRET`         | Draft preview                                                                           |
| `S3_*`                   | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_MEDIA_PREFIX` |

> Note: the config reads `DATABASE_URI`. Keep `.env` in sync with the config, not just
> with `.env.example`.

### Plugins (`src/plugins/index.ts`)

All plugins live in one array so wiring is reviewable in one place:

```ts
const plugins: Plugin[] = [
  payloadCloudPlugin(),
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
      payment: false, // payment intentionally disabled
    },
  }),
  s3Storage({
    collections: { media: { prefix: process.env.S3_MEDIA_PREFIX } },
    bucket: process.env.S3_BUCKET as string,
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
      region: process.env.S3_REGION,
    },
  }),
  seoPlugin({
    generateTitle: ({ doc }: { doc?: { title?: string | null } }) =>
      doc?.title ? `${doc.title} | Ternary Solutions` : 'Ternary Solutions',
    generateURL: ({ doc }: { doc?: { slug?: string | null } }) => {
      const url = getServerSideURL()
      return doc?.slug ? `${url}/${doc.slug}` : url
    },
  }),
]
```

Add new plugins here, not inline in `payload.config.ts`.

---

## 4. Collections

A collection = repeatable, queryable content (stories, jobs, team members, media).
One file per collection in `src/collections/`, **singular lowercase** slug
(`story`, `capability`, `team`…), with two camelCase exceptions where the entity name is
two words (`pressRelease`) and the single plural exception `users`.

Sample collections (the reference project's set — yours will differ): `media`, `users`,
`story`, `insight`, `pressRelease`, `capability`, `solution`, `industry`, `scale`,
`model`, `job`, `team`, `legal`.

### Canonical template

```ts
import { revalidateTag } from 'next/cache'
import { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug' // or wherever slugField lives

const Story: CollectionConfig = {
  slug: 'story',
  admin: { useAsTitle: 'title' },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) revalidateTag(`story_${doc.slug}`, 'max') // single doc
        revalidateTag('story', 'max') // list
      },
    ],
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text' },
    slugField(), // slug from title
    { name: 'excerpts', label: 'Excerpts', type: 'textarea' },
    { name: 'thumbnail', label: 'Thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Content', type: 'richText' },
  ],
}

export default Story
```

`story`, `insight`, `pressRelease`, `solution`, `model`, `industry` all follow this same
simple shape (title / slug / excerpts / thumbnail / richText `content`). `capability` and
`job` are the elaborate ones — deep nested `group`/`array` structures for case studies,
interview steps, compensation, etc.

### Collection conventions

- **`admin.useAsTitle`** — the human label column. `'title'` by default; `'name'` for
  **Team** and **User**, `'code'` for **Job** (the job code reads better than a title).
- **`slugField()`** generates the URL slug from a text field. Pass `fieldToUse` when the
  source isn't `title`:
  ```ts
  slugField({ fieldToUse: 'code' }) // Job — slug from the job code
  slugField({ fieldToUse: 'name' }) // Team — slug from the person's name
  ```
- **Fields are camelCase** and always carry an explicit `label`.
- **Media** is referenced via `type: 'upload', relationTo: 'media'` — never a raw URL.
- **Cross-references** use `type: 'relationship'` (`hasMany: true` for lists; an array
  of `relationTo` values for polymorphic links, e.g. `['capability','solution','industry','scale','model']`
  on the homepage `about` group).
- **Rich text** uses `type: 'richText'`. Extend with Lexical features when a field needs
  a toolbar (used on **Job** `description`, **Media** caption):
  ```ts
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()],
  })
  ```
- **Sidebar / date fields** — date fields use `admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } }`
  (see `pressRelease.releaseDate`, `job` dates).
- **Selects carry enums** — e.g. `job.seniority` options `['Junior','Mid','Senior','Lead','C-Suite']`,
  `legal.menuIcon` options `['shield','file-text','scale']`.
- **`admin.description`** is used generously to instruct editors ("Leave empty to hide
  this section", "e.g. CS-014").
- **Nesting** — repeated/structured content uses `type: 'group'` (a section) wrapping
  `type: 'array'` (repeatable rows). Example from `capability`:
  ```ts
  {
    name: 'caseStudies', label: 'Case Studies', type: 'group',
    fields: [
      { name: 'sectionLabel', label: 'Section Label', type: 'text' },
      {
        name: 'items', label: 'Case Study Items', type: 'array',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'problem', label: 'Problem', type: 'textarea' },
          { name: 'approach', label: 'Approach', type: 'textarea' },
          { name: 'outcome', label: 'Outcome', type: 'textarea' },
        ],
      },
    ],
  }
  ```

### Access control (`src/access/`)

Keep access functions centralized and import them — don't inline booleans.

```ts
// src/access/authenticated.ts → Boolean(user)
// src/access/anyone.ts        → true

access: {
  create: authenticated,
  read: anyone,          // public content
  update: authenticated,
  delete: authenticated,
}
```

`Media` is `read: anyone`; `users` is authenticated for every operation. `users` also
sets `auth: true` and `timestamps: true`.

### Media collection specifics

- `folders: true`, `upload.focalPoint: true`, `adminThumbnail: 'thumbnail'`, static dir
  `public/media`.
- Named `imageSizes` (`thumbnail` 300w, `square` 500×500, `small` 600w, `medium` 900w,
  `large` 1400w, `xlarge` 1920w, `og` 1200×630) — request the right size on the front end
  instead of full originals.
- **No `afterChange` revalidation hook** — media is referenced through the docs that embed
  it, so those docs' tags cover it.

---

## 5. Globals

A global = a single, named document. **The only globals are the site-wide chrome:**
`header`, `footer`, `legalCenter` (live at `src/globals/`, registered in
`src/payload.config.ts` as `globals: [Header, Footer, LegalCenter]`).

> **Page globals were retired (WEB-404).** There is no longer a `src/globals/pages/`
> directory and no `<page>Page` global. Every CMS-driven landing page (home, about,
> careers, contact, industries, scales, solutions, stories) is now a **document in the
> `pages` collection** (`src/collections/Pages.ts`) whose `layout` blocks field is composed
> from the block library and rendered by `src/blocks/RenderBlocks.tsx`. Do **not** add page
> globals back. See §"Blocks-based Pages" for the model; the home page is the `home` Pages
> doc, fetched directly by `src/app/(frontend)/page.tsx`, and all other landing pages are
> served by the `[...slug]` catch-all route.

### SEO meta attach point

`@payloadcms/plugin-seo` (configured in `src/plugins/index.ts`) injects a `meta` group
(`meta.title` / `meta.description` / `meta.image`) into the `pages` collection and the
content collections. Via the plugin's `fields` callback we append three custom fields
**into that same meta group**: `meta.canonical` (text override), `meta.hideFromSitemap`
(checkbox), and `meta.twitterCard` (select). These are the schema attach point only — the
generateMetadata / sitemap / JSON-LD readers are WEB-443.

### Global conventions

- Chrome globals are the plain noun (`header`, `footer`, `legalCenter`).
- **Structure with `group`** (a section), **`array`** (repeatable rows), and nested
  groups for sub-sections. Keep field names descriptive (`hero`, `stats`, `routes`,
  `offices`, `cta`).
- **Repeated UI elements get numbered names**: `button_1`/`button_2`, `section_2`/`section_3`,
  `menu_1`/`menu_4`, `item1`/`item2` — matches the visual order in the design.
- **Most fields are `required: false`** so an editor can publish partial content; the
  front end guards every value (see §6).
- **Forms are referenced**, not rebuilt: a `relationship` to the `forms` collection
  (created by the form-builder plugin). Populate it with `depth >= 1` to get the full
  Form doc on the page.
- **Icons/gradients are positional** — when a global has a fixed visual set (contact
  `routes`, story `categoryLanding`), the icon/gradient is chosen in code by array index;
  the CMS only supplies text. Document this with `admin.description`.

### Revalidation tags — the important rule

A global's `afterChange` hook invalidates a tag, and the page that reads that global
**must use the same tag string**. By convention the tag is **exactly the global's slug**
(no `global_` prefix). This is the contract that makes CMS edits show up without a
redeploy.

Sample globals and the tags they emit:

| Global        | Slug          | Tag(s) emitted in `afterChange`       |
| ------------- | ------------- | ------------------------------------- |
| Header        | `header`      | `header`                              |
| Footer        | `footer`      | `footer`                              |
| Legal sidebar | `legalCenter` | `legal-center` + `legal` _(two tags)_ |

> `legalCenter` emits a **second** `legal` tag so that editing the sidebar also busts the
> `legal` collection list (the two are rendered together on `legals/[slug]`).
>
> Landing pages are no longer globals: the `pages` collection emits `pages_<slug>` + `pages`
> (`src/collections/Pages.ts`, mirroring `makeContentCollection`). These tags are
> future-proofing — the frontend is `revalidate = 0` today, so they are a no-op until the
> WEB-445 cache-tag work wires the fetchers to read them.

Collections follow the parallel pattern: `revalidateTag('<collection>_<slug>', 'max')` for
the single doc plus `revalidateTag('<collection>', 'max')` for the list. Always pass
`'max'` as the second arg.

---

## 6. Front-end data fetching

Every page is an `async` Server Component returning `Promise<JSX.Element>`. Page data is
fetched through Payload's local API wrapped in `unstable_cache`, tagged so the
`afterChange` hooks above can invalidate it.

> **Landing pages no longer use the `findGlobal` pattern below.** They are `pages` docs:
> the `[...slug]` route and `src/app/(frontend)/page.tsx` (home) `payload.find({ collection:
'pages', where: { slug } })` and feed `layout` to `RenderBlocks`. The worked example below
> is retained only to illustrate the cached-fetch + tag convention for the **chrome globals**
> (`header`/`footer`/`legalCenter`); substitute `findGlobal('header')` etc. The
> `contactPage`/`ContactPage` names here are historical (page globals were retired, WEB-404).

### Pattern A — inline `unstable_cache` (the cached-fetch + tag convention)

Sample (illustrative — the now-retired contact page global), top of a page Server Component:

```tsx
import type { ContactPage, Form } from '@/payload-types'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import type { JSX } from 'react'

export default async function Page(): Promise<JSX.Element> {
  const getContactPageData = unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.findGlobal({ slug: 'contactPage', depth: 2 })
    },
    ['contactPage'], // cache key parts
    { tags: ['contactPage'] }, // MUST match the global's afterChange tag
  )

  const contactPageData: ContactPage | null = await getContactPageData()

  if (!contactPageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  const hero = contactPageData?.hero // then read nested fields defensively
  const stats = contactPageData?.stats ?? []
  const formGroup = contactPageData?.form
  // With depth>=1 the relationship is populated to the full Form doc:
  const form = formGroup?.form && typeof formGroup.form === 'object' ? (formGroup.form as Form) : null
  // ...
}
```

**Naming is uniform** across every page global: the cached fetcher is `get<Name>PageData`
and the awaited result is `<name>PageData`, typed `<Name>Page | null`. A single `await`
— **no `try/catch`, no `as` cast** (`findGlobal` already returns the right type) — followed
by the null guard:

```tsx
const aboutPageData: AboutPage | null = await getAboutPageData()
if (!aboutPageData) {
  return <div className="…">Error loading data.</div>
}
```

Sample mapping (one row per page global in the reference project):

| Page       | Fetcher                 | Variable             | Slug / key / tag |
| ---------- | ----------------------- | -------------------- | ---------------- |
| home       | `getHomePageData`       | `homePageData`       | `homePage`       |
| about      | `getAboutPageData`      | `aboutPageData`      | `aboutPage`      |
| careers    | `getCareersPageData`    | `careersPageData`    | `careersPage`    |
| contact    | `getContactPageData`    | `contactPageData`    | `contactPage`    |
| industries | `getIndustriesPageData` | `industriesPageData` | `industriesPage` |
| scales     | `getScalesPageData`     | `scalesPageData`     | `scalesPage`     |
| solutions  | `getSolutionsPageData`  | `solutionsPageData`  | `solutionsPage`  |
| stories    | `getStoriesPageData`    | `storiesPageData`    | `storiesPage`    |

> The cache **key** (2nd arg) and **tag** (3rd arg) are both the global's slug; the tag
> must equal what the global's `afterChange` hook emits, or edits won't show without a
> redeploy. No `try/catch` and no `as …Page | null` cast — `findGlobal` already returns
> the correct type.

### Pattern B — `getHeader` / `getFooter` helpers (chrome only, uncached)

`src/utilities/getGlobals.ts` is a thin, **uncached** wrapper (`revalidate: 0`) used by
the root layout for header/footer — never for page bodies:

```tsx
type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0) {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug, depth })
}

export async function getHeader() {
  return getGlobal('header', 1) // depth 1 → logo media URL populated
}
export async function getFooter() {
  return getGlobal('footer', 1)
}
```

Consumed in `src/app/(frontend)/layout.tsx`:

```tsx
const [headerData, footerData] = await Promise.all([getHeader(), getFooter()])
```

> There is **no** `getCachedGlobal` helper in this setup. Page globals use Pattern A;
> chrome uses these uncached helpers. Don't invent a caching wrapper for header/footer.

### Collections by slug (dynamic routes)

`legals/[slug]` is the canonical Payload-collection detail route:

```tsx
function getLegalBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.find({
        collection: 'legal',
        where: { slug: { equals: slug } },
        depth: 2,
        limit: 1,
      })
    },
    [`legal_${slug}`],
    { tags: [`legal_${slug}`, 'legal'] }, // matches the collection hook tags
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal = docs[0]
  if (!legal) notFound()
  return { title: legal.title ? `${legal.title} | Ternary Solutions` : 'Ternary Solutions' }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal: Legal | undefined = docs[0]
  if (!legal) notFound()
  // ...
}
```

Note the cached fetcher returns a **function you must call** (`getLegalBySlug(slug)()`).
Pair these with `generateMetadata()` and call `notFound()` (from `next/navigation`) when
the doc is missing.

### `job/[slug]` — collection-shaped route over a `lib/` accessor

The jobs routes look like collection routes but read from `src/lib/jobs-data.ts` (a mock
of the recruiting API), not Payload:

```tsx
export async function generateStaticParams() {
  const jobs = await getJobs()
  return jobs.map((job) => ({ slug: job.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const jobData = await getJob(slug)
  if (!jobData) notFound() // maps to API 404
  const relatedJobs = await getRelatedJobs(slug)
  // ...
}
```

### Fetch rules of thumb

- **`findGlobal({ slug, depth })`** for globals; **`find({ collection, where, depth, limit, sort })`**
  for collections.
- **`depth`**: `0` = scalars only; `1` = populate first-level relations/media (gives
  media `url`); `2` = populate nested relations (e.g. a Form referenced inside a group).
  Page globals use `depth: 2`; chrome helpers use `depth: 1`. Use the smallest depth that
  renders.
- **Cache key vs tag**: key (`[...]`, 2nd arg) makes the memo unique; tag (3rd arg) must
  equal the tag the corresponding `afterChange` hook emits (the global slug, or
  `<collection>_<slug>` + `<collection>`).
- **Always null-check** the top-level result and render the standard red
  `Error loading data.` fallback (globals) or `notFound()` (collection details). Read
  nested fields with `?.` and `?? []`/defaults.
- **Generated types only**: import `type { … }` from `@/payload-types`; never hand-write
  content shapes. Cast populated relations (`field as Form`, `field as Media`) at the edge.
- Avoid `export const dynamic = 'force-dynamic'` on cacheable pages — it defeats the
  tag-based revalidation. (A few legacy pages still set it; not the pattern to copy.)

### `lib/` for non-Payload data

Data that isn't owned by Payload lives in `src/lib/` behind an async accessor so it can
later be swapped for a real API without touching pages — see `jobs-data.ts`:

```ts
/** ✅ `GET /jobs` — list of open roles, newest first. */
export async function getJobs(): Promise<JobListing[]> {
  const data = mockJobs
  // const data = await fetchJobs()   ← swap mock for fetch here
  return [...data].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
}

/** ✅ `GET /jobs/{slug}` — single role (null when not found). */
export async function getJob(slug: string): Promise<JobListing | null> {
  return mockJobs.find((job) => job.slug === slug) ?? null
}

/** Other open roles — derived from the list (API has no curated relationship). */
export async function getRelatedJobs(slug: string): Promise<JobListing[]> {
  const jobs = await getJobs()
  return jobs.filter((job) => job.slug !== slug)
}
```

The `JobListing` interface annotates each field with provenance (✅ API · 🟡 CMS · 🔒
internal-only) — keep that discipline when extending it. Design tokens for a page family
also live in `lib/` (`careers-colors.ts`):

```ts
export const careersText = { cream: 'text-[#F4F3EC]', body: 'text-[#D5D5D5]', muted: 'text-[#757571]' /* … */ } as const
export const careersBg = { page: 'bg-[#050505]', card: 'bg-[#1B1A17]', button: 'bg-[#F4F3EC]' /* … */ } as const
export const careersBorder = {
  muted: 'border-[#757571]',
  subtle: 'border-[#27272a]',
  input: 'border-[#3f3f46]',
} as const
```

---

## 7. Components

### Pages own fetching; sections own presentation

**Section components** (`src/components/sections/*`) receive **typed `data` props** sliced
from `@/payload-types`. Pass the smallest slice the component needs and let the component
type it via `NonNullable<…>`:

```tsx
// page.tsx
<ContactRoutes data={contactPageData?.routes} />
<ContactOffices data={contactPageData?.offices} />
<ContactForm fields={form.fields ?? []} formId={form.id} submitLabel={form.submitButtonLabel} />

// contactOffices.tsx
type OfficesData = NonNullable<Contact['offices']>
export default function ContactOffices({ data }: { data?: OfficesData }): JSX.Element | null {
  const offices = data?.items ?? []
  if (offices.length === 0) return null
  // ...
}
```

Sections that have nothing to show **return `null`** rather than an empty shell.

### `Motion` — the one animation primitive

`src/components/animation/motion.tsx` is a `'use client'` wrapper over `motion.create(tag)`:

```tsx
'use client'
interface MotionWrapperProps extends MotionProps {
  tag?: ElementType
  className?: string
  id?: string
  children?: ReactNode
}
export default function Motion({ tag = 'div', children, ...rest }: MotionWrapperProps): JSX.Element {
  const Component = motion.create(tag)
  return <Component {...rest}>{children}</Component>
}
```

Use it as `<Motion tag="section" {...motionSectionProps}>…</Motion>`. The
`motionSectionProps` / `motionBlockProps` objects are **defined locally at the top of each
page/section that animates** (not centralized) — copy the shape so scroll-in motion stays
consistent:

```tsx
const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}
const motionBlockProps = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}
```

### Layout primitives

- **`Section`** (`layout/section.tsx`) — titled wrapper. Renders the heading/description
  only when present (`showHeader = Boolean(title?.trim()) || Boolean(desc?.trim())`) and
  wraps children in a `Motion` section with the standard scroll-in.
- **`ColumnSection`** (`layout/sectionColumn.tsx`) — two-column layout with an optional
  `aside`; `mainSide` controls which side the primary column sits on.
- **`BentoCard`** (`layout/bentoCard.tsx`) — bento grid card; pass `animated={false}` when
  a parent grid owns the scroll motion.

### Forms — form-builder plugin + native `FormData`

The contact form is `'use client'`, reads the plugin's `Form['fields']`, and POSTs to the
form-builder submission endpoint — **no react-hook-form, no zod**:

```tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const submissionData = Array.from(formData.entries()).map(([field, value]) => ({
    field,
    value: value.toString(),
  }))
  setStatus('submitting')
  const res = await fetch('/api/form-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form: formId, submissionData }),
  })
  // … set success/error status
}
```

Fields are rendered by switching on `field.blockType` (`'text' | 'email' | 'number' |
'date' | 'textarea' | 'select' | 'checkbox' | …`), using `field.width` to pick a column
span. The **apply** form (`applyForm.tsx`) is a larger bespoke form driven by a single
`useState` object plus local `Label`/`TextInput` primitives, POSTing to the applications
endpoint — use that pattern for forms not owned by the form-builder plugin.

### Rich text rendering (`components/richtext/`)

Lexical content is rendered by a custom recursive serializer, not a Payload component:

```tsx
// index.tsx
export default function RichText({ content, className = '' }: { content?: RichText | null; className?: string }) {
  if (!content) return null
  const contentToSerialize = content.root?.children || content
  return <div className={className}>{serialize(contentToSerialize)}</div>
}
```

`serialize.tsx` walks the node tree: `Text` nodes apply bold/italic marks; node `type`s
switch over `heading` (slugified `id` + per-tag Tailwind classes), `link` (`newTab` →
`target/_blank` + `rel`), `upload` (`next/image`), lists, etc. Extend the `switch` when a
new Lexical node type needs rendering.

### Server/client boundary

Keep it tight: pages stay Server Components; mark only the interactive leaves
(`'use client'`) — `Motion`, forms, filters, carousels. The root `layout.tsx` is a Server
Component that fetches chrome and passes typed props into `<Header>`/`<Footer>`.

---

## 8. Recipes

### Add a new collection

1. Create `src/collections/<name>.ts` from the §4 template (slug, `useAsTitle`,
   `slugField()` if it has a detail route, fields, `afterChange` revalidation emitting
   `<name>_<slug>` + `<name>`).
2. Register it in `collections: [...]` in `payload.config.ts`.
3. `pnpm generate:types`.
4. Build the route(s) under `src/app/(frontend)/<name>/` using the §6 collection-by-slug
   pattern + matching cache tags; add `generateStaticParams`/`generateMetadata` for
   `[slug]` and `notFound()` for misses.

### Add a new CMS-driven page

Landing pages are **Pages docs**, not globals — usually no code change is needed:

1. If you need a section that doesn't exist yet, add a **block** under `src/blocks/<Name>/`
   (config + component) and register it in the `Pages.layout` `blocks` list
   (`src/collections/Pages.ts`) and in `RenderBlocks.tsx`.
2. `pnpm generate:types` (only when you added/changed a block schema).
3. In the admin, create a `pages` document, set its `slug`, compose `layout` from the blocks,
   and **publish**. It is served by the `[...slug]` catch-all (or, for `home`, by
   `src/app/(frontend)/page.tsx`). SEO is per-page via the injected `meta` group.

### Add a form to a page

1. Editor builds the form in the admin **Forms** collection (form-builder plugin).
2. Use the `ContactForm` block (or any block with a `relationship` to `forms`) in the page's
   `layout` and pick the form.
3. Fetch the page with `depth: 2` so the Form doc is populated; narrow it
   (`typeof formGroup.form === 'object' ? (formGroup.form as Form) : null`) and render
   with `<ContactForm fields={form.fields ?? []} formId={form.id} submitLabel={form.submitButtonLabel} />`.

### Change a field / schema

1. Edit the collection/global config.
2. `pnpm generate:types` — **required**; never edit `payload-types.ts` by hand.
3. Update any component/page that reads the changed field (TypeScript will flag them).

---

## 9. Formatting, linting & editor config

Formatting is **Prettier** — never hand-roll spacing or import order. Config is `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "semi": false,
  "bracketSpacing": true,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-organize-imports"]
}
```

What this means for code you write:

- **Single quotes**, **no semicolons**, **trailing commas everywhere**, **2-space indent**,
  **120-column** width.
- `prettier-plugin-organize-imports` **sorts and de-dupes imports** on format — don't
  hand-order them. This is why every file's imports come out alphabetized with the
  `type`-only imports in place; just run the formatter and let it settle.

`.editorconfig` pins the same basics editor-wide (2-space indent, LF line endings, UTF-8,
trim trailing whitespace, final newline) so non-VS-Code editors match.

```bash
pnpm format     # prettier --write "**/*.{cjs,mjs,ts,tsx,md,json,css,scss,less,html}" --ignore-path .gitignore
pnpm lint       # next lint  (rules in eslint.config.mjs)
pnpm lint:fix   # next lint --fix
```

`pnpm format` passes `--ignore-path .gitignore`, so ignored/generated files are skipped.
Run **`pnpm lint` and `pnpm format` before every commit** — both are in the checklist below.

---

## 10. Conventions checklist (PR review)

- [ ] New collection/global registered in `payload.config.ts`.
- [ ] `pnpm generate:types` run and `payload-types.ts` committed.
- [ ] `afterChange` revalidation hook present — page global emits its **own slug** as the
      tag; collection emits `<collection>_<slug>` + `<collection>`; all with `'max'`.
- [ ] Page fetch key/tag **matches** the hook tag exactly (the global slug).
- [ ] Smallest sufficient `depth` (globals 2, chrome 1); top-level null check +
      `Error loading data.` fallback (or `notFound()` for collection details).
- [ ] Types imported from `@/payload-types` (`type` imports); no hand-written shapes;
      populated relations cast at the edge.
- [ ] Access control via `src/access/` helpers; nothing public that shouldn't be.
- [ ] Media via `upload`/`relationTo: 'media'`; relations via `relationship`.
- [ ] Fields camelCase + explicit `label`; editor-facing `admin.description` where helpful.
- [ ] Sections take a typed `data` slice and `return null` when empty; animate via `Motion` + local `motion*Props`.
- [ ] No new `force-dynamic` on cacheable pages.
- [ ] `pnpm lint` and `pnpm format` clean.
