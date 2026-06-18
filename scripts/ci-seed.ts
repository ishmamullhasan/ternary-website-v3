// Headless seed for CI (Lighthouse) — seeds the header/footer globals + a demo user (via
// seed()), then ensures a PUBLISHED Pages document with slug `home` exists so the homepage `/`
// (which fetches the `home` Page — see src/app/(frontend)/page.tsx) renders for auditing.
//
// Migration note (WEB-442): the old header comment claimed this "populates …/homepage globals",
// but page globals were retired in WEB-404 and seed() only ever wrote header/footer + a demo
// user — it never created a homepage. Landing pages now come from the Pages collection, so we
// upsert a `home` Page here instead of touching a (now-unregistered) page global.
// Run via: pnpm payload run ./scripts/ci-seed.ts
// Uses top-level await so `payload run` blocks on the async work before exiting.
import config from '@payload-config'
import { getPayload, type PayloadRequest } from 'payload'

import { seed } from '@/endpoints/seed'

const payload = await getPayload({ config })

// Idempotent: create the published `home` Page if missing, else publish the existing one. An
// empty `layout` is enough for Lighthouse — the route returns a valid page shell (header/footer
// from the frontend layout). WEB-377/384: revalidate hooks throw outside a request context, so
// the disableRevalidate context is passed and the outer catch still swallows that specific error.
const ensureHomePage = async () => {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const data = { title: 'Home', slug: 'home', layout: [], _status: 'published' as const }
  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
      context: { disableRevalidate: true },
    })
    payload.logger.info('CI seed: home Page already existed — ensured published.')
  } else {
    await payload.create({ collection: 'pages', data, context: { disableRevalidate: true } })
    payload.logger.info('CI seed: created published home Page.')
  }
}

try {
  // seed() only reads req for logging context; a minimal stub is sufficient here.
  await seed({ payload, req: {} as PayloadRequest })
  await ensureHomePage()
  payload.logger.info('CI seed complete.')
  process.exit(0)
} catch (err) {
  // The global afterChange hooks call Next's revalidateTag(), which throws outside a
  // request context. The DB writes have already committed by then, so for CI seeding
  // this is non-fatal. (Proper fix — honor context.disableRevalidate — is WEB-377/384.)
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('revalidateTag') || message.includes('static generation store')) {
    payload.logger.warn('CI seed: ignoring revalidateTag-outside-request error (data already written).')
    process.exit(0)
  }
  payload.logger.error({ err }, 'CI seed failed')
  process.exit(1)
}
