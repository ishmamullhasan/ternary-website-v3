// Verify the hero migration produced activity-log rows attributed to ashemul@ternary.solutions.
//   pnpm payload run ./scripts/check-hero-audit.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const res = (await payload.find({
  collection: 'activityLog' as never,
  where: { slug: { equals: 'pages' } } as never,
  sort: '-timestamp',
  depth: 0,
  limit: 12,
  overrideAccess: true,
})) as any

for (const r of res.docs ?? []) {
  console.log(
    `${r.timestamp} | ${r.action} | ${r.summary} | user=${r.userEmail} | source=${r.source} | fields=${r.fieldsChanged}`,
  )
}
process.exit(0)
