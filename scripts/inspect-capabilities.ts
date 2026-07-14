// Throwaway: verify the animation assignment, both locales, and the audit attribution.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

for (const locale of ['en', 'bn'] as const) {
  payload.logger.info(`--- capability [${locale}] ---`)
  const caps = await payload.find({
    collection: 'capability',
    limit: 100,
    depth: 0,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  })
  for (const c of caps.docs) {
    const r = c as Record<string, unknown>
    payload.logger.info(`  ${String(r.animation ?? '—').padEnd(10)} ${String(r.slug).padEnd(24)} ${String(r.title)}`)
  }
}

payload.logger.info('--- activityLog: capability + pages, most recent 12 ---')
const log = await payload.find({
  collection: 'activityLog',
  where: { slug: { in: ['capability', 'pages'] } },
  limit: 12,
  depth: 0,
  sort: '-timestamp',
  overrideAccess: true,
})
for (const e of log.docs) {
  const r = e as Record<string, unknown>
  payload.logger.info(`  [${String(r.source)}] ${String(r.userEmail ?? 'NO USER')} — ${String(r.summary)}`)
}

process.exit(0)
