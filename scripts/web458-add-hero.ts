// WEB-458 — add the `heroFeatured` block as the FIRST block of the home page (prod), now that the
// block code is deployed. Seeds curation the way the old hardcoded hero did (newest stories/insights/
// press, placeholder-titled skipped, interleaved, capped at 8) so the live hero matches what shipped;
// editors can re-curate in admin afterward. Idempotent: re-running updates the existing hero block in
// place rather than prepending a duplicate. Localized thesis/headline.
//
//   DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-add-hero.ts        # DRY (default)
//   DRY=0 DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-add-hero.ts  # APPLY
import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types
const uri = process.env.DATABASE_URI
if (!uri) throw new Error('Set DATABASE_URI inline.')
const DRY = process.env.DRY !== '0'

const txt = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? String((v as Record<string, unknown>).en ?? (v as Record<string, unknown>).bn ?? '')
    : String(v ?? '')

const THESIS = { en: 'AI agents do the work. Human orchestrators own the outcome.' }
const HEADLINE = { en: 'Agentic Engineering.\nHuman Orchestration.', bn: 'এজেন্টিক ইঞ্জিনিয়ারিং\nমানব অর্কেস্ট্রেশন।' }
const PLACEHOLDER = /^(title|untitled)(\s*\d+)?$/i

const run = async () => {
  console.log(`\n${DRY ? '🟡 DRY-RUN (no writes)' : '🔴 APPLY (writing)'}   host: ${uri.replace(/\/\/[^@]*@/, '//***@')}`)
  const conn = await mongoose.createConnection(uri).asPromise()
  const db = conn.db!

  // Build featured lanes (newest first), skip placeholder-titled, interleave, cap 8.
  const lane = async (coll: string) => {
    const docs = await db.collection(coll).find({}).sort({ createdAt: -1 }).toArray()
    return docs.filter((d) => d.slug && txt(d.title) && !PLACEHOLDER.test(txt(d.title).trim()))
  }
  const lanes = {
    story: (await lane('stories')).slice(0, 8),
    insight: (await lane('insights')).slice(0, 3),
    pressRelease: (await lane('pressreleases')).slice(0, 2),
  } as const

  const items: { relationTo: string; value: unknown; id: string }[] = []
  const order = ['story', 'insight', 'pressRelease'] as const
  for (let i = 0; items.length < 8 && order.some((k) => lanes[k][i]); i++) {
    for (const k of order) {
      const d = lanes[k][i]
      if (d && items.length < 8) items.push({ relationTo: k, value: d._id, id: new ObjectId().toString() })
    }
  }
  console.log(`\nCurated ${items.length} items:`)
  for (const it of items) {
    const collName = { story: 'stories', insight: 'insights', pressRelease: 'pressreleases' }[it.relationTo]!
    const d = await db.collection(collName).findOne({ _id: it.value as InstanceType<typeof ObjectId> })
    console.log(`  ${it.relationTo.padEnd(13)} ${txt(d?.title)}`)
  }

  const home = await db.collection('pages').findOne({ slug: 'home' })
  if (!home) throw new Error('home page not found')
  const layout = [...((home.layout as Record<string, unknown>[]) ?? [])]

  const heroBlock = {
    blockType: 'heroFeatured',
    thesis: THESIS,
    headline: HEADLINE,
    items: items.map((it) => ({ relationTo: it.relationTo, value: it.value, id: it.id })),
    id: new ObjectId().toString(),
  }

  if (layout[0]?.blockType === 'heroFeatured') {
    console.log('\nℹ️  hero block already first — updating it in place (idempotent).')
    layout[0] = { ...heroBlock, id: (layout[0] as { id?: string }).id ?? heroBlock.id }
  } else {
    console.log('\n➕ prepending heroFeatured as layout[0] (aboutSection moves to [1]).')
    layout.unshift(heroBlock)
  }
  console.log(`   new layout order: ${layout.map((b) => b.blockType).join(' → ')}`)

  if (!DRY) {
    await db.collection('pages').updateOne({ _id: home._id }, { $set: { layout } })
    console.log('\n✅ home page updated.')
  } else {
    console.log('\n🟡 DRY-RUN complete — re-run with DRY=0 to apply.')
  }

  await conn.close()
  process.exit(0)
}

run().catch((e) => {
  console.error('ADD-HERO ERROR:', e)
  process.exit(1)
})
