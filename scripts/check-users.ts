import config from '@payload-config'
import { getPayload } from 'payload'
const payload = await getPayload({ config })
const r = await payload.find({ collection: 'users', limit: 50, depth: 0, overrideAccess: true })
console.log(`USERS_TOTAL=${r.totalDocs}`)
for (const u of r.docs as any[]) console.log(`  - ${u.email}  (name=${u.name ?? ''})`)
process.exit(0)
