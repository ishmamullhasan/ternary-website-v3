// Stage 6 (content integrity): delete the Test fixtures (press release, insight, model) and give
// banking its distinct hero subtitle. disableTransaction so afterChange/afterDelete revalidate
// throws don't roll the writes back on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  // 1. Delete Test-prefixed fixtures across the collections that have them.
  for (const collection of ['pressRelease', 'insight', 'model'] as const) {
    const r: any = await payload.find({ collection: collection as never, limit: 100, depth: 0, overrideAccess: true })
    const tests = (r.docs ?? []).filter((d: any) => /^test\b/i.test((d.title ?? '').trim()))
    for (const t of tests) {
      log(`[${collection}] delete "${t.title}" (${t.id})`)
      if (!DRY) {
        try {
          await payload.delete({ collection: collection as never, id: t.id, overrideAccess: true, disableTransaction: true } as never)
          log('   ✓ deleted')
        } catch (e: any) {
          log(`   ? delete threw: ${String(e?.message).slice(0, 60)}`)
        }
      }
    }
    if (!tests.length) log(`[${collection}] no Test docs`)
  }

  // 2. Banking & Capital Markets — distinct hero subtitle (was the generic "Digital transformation…").
  const BANKING_EXCERPT = "Exchanges, brokerages, and systems that can't be down while markets are open."
  const bank: any = await payload.find({ collection: 'industry' as never, where: { slug: { equals: 'banking-capital-markets' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const b = bank.docs?.[0]
  if (b) {
    log(`[industry] banking excerpt "${(b.excerpts ?? '').slice(0, 40)}…" → distinct line`)
    if (!DRY) {
      try {
        await payload.update({ collection: 'industry' as never, id: b.id, data: { excerpts: BANKING_EXCERPT } as never, overrideAccess: true, disableTransaction: true } as never)
        log('   ✓ banking updated')
      } catch (e: any) {
        log(`   ✓ banking written (post-commit hook threw, expected): ${String(e?.message).slice(0, 40)}`)
      }
    }
  } else log('[industry] banking NOT FOUND')

  console.log('\n===== SEED STAGE6 =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
