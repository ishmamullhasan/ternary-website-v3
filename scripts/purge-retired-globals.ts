// Purge orphaned global documents left behind when the per-page globals were retired into the
// `pages` collection (Epic A). These globalTypes are no longer registered in the Payload config,
// so Payload ignores them — they are inert dead data. We delete by an explicit allow-list (never
// "everything not registered") so a live-but-renamed global can never be caught by accident.
//
//   PURGE_DRY=1 pnpm payload run ./scripts/purge-retired-globals.ts   # preview (no writes)
//   pnpm payload run ./scripts/purge-retired-globals.ts               # delete
//
// Operates on whatever DATABASE_URI points at. For the gated prod run, point DATABASE_URI at the
// Ternary-v3 production DB and run with explicit sign-off.
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

// The retired per-page globals (now served from the `pages` collection). NOTE: `legal-center` is
// deliberately NOT here — it still holds live legal copy and is a slug mismatch with the registered
// `legalCenter` global, which is a separate issue to resolve, not a retired-page orphan.
const RETIRED = [
  'homepage',
  'homePage',
  'about',
  'aboutPage',
  'scales',
  'scalesPage',
  'industriesPage',
  'solutionsPage',
  'storiesPage',
  'contact',
  'contactPage',
  'careersPage',
]

const DRY = process.env.PURGE_DRY === '1'
const payload: Payload = await getPayload({ config })
const db = (payload.db as any).connection.db
const coll = db.collection('globals')

const present = (await coll.find({ globalType: { $in: RETIRED } }, { projection: { globalType: 1 } }).toArray()).map(
  (d: any) => d.globalType,
)
console.log(
  `${DRY ? '[DRY] would delete' : 'deleting'} ${present.length} orphaned global docs: ${present.join(', ') || '(none)'}`,
)
if (!DRY && present.length) {
  const res = await coll.deleteMany({ globalType: { $in: RETIRED } })
  console.log(`deleted ${res.deletedCount}`)
}
const remaining = (await coll.find({}, { projection: { globalType: 1 } }).toArray()).map((d: any) => d.globalType)
console.log(`remaining globals: ${remaining.sort().join(', ')}`)
