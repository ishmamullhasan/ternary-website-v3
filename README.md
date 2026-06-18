# Ternary Solutions Website

The marketing website for **Ternary Solutions, Inc.** This is a proprietary,
closed-source application — see [Proprietary notice](#proprietary-notice) below.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **[React 19](https://react.dev)**
- **[Payload CMS v3](https://payloadcms.com)** with the **MongoDB** adapter
  (`@payloadcms/db-mongodb`, via Mongoose) — admin panel and content API served from
  the same Next.js instance
- **[Tailwind CSS v4](https://tailwindcss.com)** + shadcn/ui (Radix) components
- **S3** media storage (`@payloadcms/storage-s3`)
- Deployed on **[Vercel](https://vercel.com)**
- Tooling: TypeScript, ESLint, Prettier, Vitest (integration), Playwright (e2e), Husky

The app is split into two route groups under `src/app/`:

- `(payload)` — the Payload admin panel and API.
- `(frontend)` — the public marketing site.

## Blocks-based Pages architecture

Content is composed from **blocks**, not hand-written route files. The `pages`
collection (`src/collections/Pages.ts`) has a `layout` blocks field, and pages are
rendered by **`src/blocks/RenderBlocks.tsx`**, which maps each block in `layout` to its
React component. New page sections are added as new blocks under `src/blocks/`, then
arranged per-page from the Payload admin — no code change is needed to build or
re-order a page.

Public pages are served through the catch-all route
`src/app/(frontend)/[...slug]/page.tsx`, which looks up the matching `pages` document
by slug and feeds its `layout` to `RenderBlocks` (the home page is the `home` Pages doc,
fetched directly by `src/app/(frontend)/page.tsx`). The older per-section **page globals
were retired (WEB-404)** — `src/globals/pages/` no longer exists, and the only remaining
globals are the site chrome (`header`, `footer`, `legalCenter`).

Per-page SEO is handled by `@payloadcms/plugin-seo` (see `src/plugins/index.ts`), which
adds a `meta` group (`meta.title` / `meta.description` / `meta.image`) to the `pages` and
content collections, extended with `meta.canonical`, `meta.hideFromSitemap`, and
`meta.twitterCard`.

## Local development

Requires Node `^18.20.2 || >=20.9.0`, **pnpm 10/11**, and a reachable MongoDB instance.

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev               # http://localhost:3000  (admin at /admin)
```

On first run, open `/admin` and follow the prompts to create the initial admin user.

See **`.env.example`** for the full list of environment variables. At minimum you need
`DATABASE_URI` (MongoDB connection string — the code also accepts `DATABASE_URL`),
`PAYLOAD_SECRET`, and `NEXT_PUBLIC_SERVER_URL`.

## Build

```bash
pnpm build    # next build (+ next-sitemap via postbuild)
pnpm start    # serve the production build
```

Other useful scripts:

- `pnpm lint` / `pnpm lint:fix` — ESLint.
- `pnpm test` — integration (Vitest) + e2e (Playwright).
- `pnpm generate:types` — regenerate `src/payload-types.ts` after changing
  collections/globals/blocks.
- `pnpm generate:importmap` — regenerate the admin import map.

## Managing content

Content is edited entirely in the **Payload admin panel** (`/admin`):

- **Pages** — build a page by adding/re-ordering blocks in its `layout` field; the
  public route renders it automatically.
- **Media** — uploads are stored in S3 and referenced from blocks and SEO fields.
- **Globals** (e.g. Header, Footer) and SEO, search, redirects, and form-builder data
  are all managed from the admin.

Drafts use Payload Versions with draft + live preview, so editors can review changes
before publishing.

## Contributing

Internal contributors: see [`CONTRIBUTING.md`](./CONTRIBUTING.md). Security reports:
see [`SECURITY.md`](./SECURITY.md).

## Proprietary notice

Copyright © 2026 Ternary Solutions, Inc. All rights reserved. This software is
proprietary and confidential. It is **not** open-source and is provided for internal
use only. Unauthorized copying, distribution, modification, or use of any part of it is
prohibited without the express prior written permission of Ternary Solutions, Inc. See
[`LICENSE`](./LICENSE).
