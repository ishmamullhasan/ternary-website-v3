// ONE-OFF: `team` just became orderable and gained a required `category`. Existing docs have no
// `_order`, so the admin list and any `sort: '_order'` read would come back in arbitrary order until
// someone drags every row — seed `_order` with valid fractional-indexing keys ('a0', 'a1', … — the
// same shape Payload generates) in the current alphabetical (name) order. Docs also lack `category`
// (defaultValue only applies going forward), which would exclude them from category-filtered
// queries — backfill 'general'. IDEMPOTENT: values already present are skipped.
//   CONTENT_DRY=1 pnpm payload run ./scripts/init-team-order.ts   # preview (default)
//   CONTENT_DRY=0 pnpm payload run ./scripts/init-team-order.ts   # apply
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
// afterChange hooks call revalidateTag, which throws outside a Next request — the write commits first.
const BENIGN = (e: unknown) => {
  const m = String((e as Error)?.message || e)
  return m.includes('static generation store missing') || m.includes('revalidateTag')
}

// Integer fractional-indexing keys, matching the 'fractional-indexing' lib Payload uses:
// 'a' + one base62 digit covers the first 62 positions — plenty for the team roster.
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const orderKey = (i: number): string => {
  if (i >= DIGITS.length) throw new Error(`orderKey only supports ${DIGITS.length} docs; got index ${i}`)
  return `a${DIGITS[i]}`
}

const run = async () => {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'team', depth: 0, limit: 200, pagination: false, sort: 'name' })

  let i = 0
  let writes = 0
  for (const doc of res.docs as { id: string; name?: string; _order?: string; category?: string }[]) {
    const data: Record<string, string> = {}
    if (doc._order) {
      console.log(`  skip _order (has ${doc._order}): ${doc.name}`)
    } else {
      data._order = orderKey(i++)
    }
    if (!doc.category) data.category = 'general'

    if (Object.keys(data).length === 0) continue
    writes++
    console.log(
      `  ${doc.name}  ←  ${Object.entries(data)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')}`,
    )
    if (!DRY) {
      try {
        await payload.update({ collection: 'team', id: doc.id, data: data as never })
      } catch (e) {
        if (!BENIGN(e)) throw e
      }
    }
  }

  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'} Docs ${DRY ? 'to update' : 'updated'}: ${writes}`)
  await new Promise((r) => setTimeout(r, 500))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('INIT-TEAM-ORDER ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
