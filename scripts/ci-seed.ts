// Headless seed for CI (Lighthouse) — populates header/footer/homepage globals + a demo
// user so the homepage renders for auditing. Run via: pnpm payload run ./scripts/ci-seed.ts
// Uses top-level await so `payload run` blocks on the async work before exiting.
import config from '@payload-config'
import { getPayload, type PayloadRequest } from 'payload'

import { seed } from '@/endpoints/seed'

const payload = await getPayload({ config })

try {
  // seed() only reads req for logging context; a minimal stub is sufficient here.
  await seed({ payload, req: {} as PayloadRequest })
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
