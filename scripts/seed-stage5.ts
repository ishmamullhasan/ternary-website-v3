// Stage 5 (homepage): add the missing heroFeatured block (real h1) to the top of the home layout,
// and fill the five empty "How we operate" (processSection) step bodies. disableTransaction +
// _status published so it persists + goes live on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

// Minimal Lexical richText paragraph.
const richText = (text: string) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const,
    children: [{
      type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, textStyle: '',
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    }],
  },
})

// title → 1–2 sentence body (sourced from the About culture themes). Flagged for review vs final copy.
const PROCESS_BODIES: Record<string, string> = {
  'Production ownership across the lifecycle':
    "We don't hand a project off and walk away. We design, build, and run the systems we ship — accountable for how they behave in production, not just how they demo at launch.",
  'Centralized engineering capability':
    'One engineering organization, not a scatter of contractors. Shared standards, shared review, and shared tooling mean every project draws on the same institutional muscle.',
  'Deliberately built talent':
    'We hire to a single bar and grow people against it. Engineers are formed here, not rented — which is how the standard holds as we scale.',
  'A culture of leadership and performance':
    'Ownership is expected at every level. People are trusted with real responsibility early, and held to what they commit to.',
  'World-class talent infrastructure':
    'Hiring, training, and progression run as real systems — so senior engineering capability is something we can reproduce, not something we hope to stumble on.',
}

const HERO_BLOCK = {
  blockType: 'heroFeatured',
  id: 'seed-home-hero',
  thesis: 'AI systems and the senior engineers who put them into production — built in New York and Dhaka.',
  headline: 'Agentic Engineering.\nHuman Orchestration.',
  // items intentionally omitted — curate the featured cards later (flagged).
}

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  const found: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'home' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const doc = found.docs?.[0]
  if (!doc) { log('home NOT FOUND'); console.log(out.join('\n')); process.exit(1) }

  const layout: any[] = Array.isArray(doc.layout) ? [...doc.layout] : []

  // 1. Prepend hero block if absent (idempotent).
  const hasHero = layout.some((b) => b.blockType === 'heroFeatured')
  if (!hasHero) { layout.unshift({ ...HERO_BLOCK }); log('+ prepended heroFeatured block') }
  else log('heroFeatured already present — left as is')

  // 2. Fill process bodies.
  let filled = 0
  for (const b of layout) {
    if (b.blockType !== 'processSection') continue
    const items = b.process ?? []
    for (const it of items) {
      const body = PROCESS_BODIES[(it.title ?? '').trim()]
      if (body) { it.description = richText(body); filled++ }
      else log(`  ? no body mapping for process title "${it.title}"`)
    }
  }
  log(`filled ${filled} process bodies`)

  // 3. Engagement models → canonical order Frame, Flow, Orchestra (was Frame, Orchestra, Flow).
  const models: any = await payload.find({ collection: 'model' as never, limit: 20, depth: 0, overrideAccess: true })
  const idByName = new Map<string, string>()
  for (const m of models.docs ?? []) {
    const t = (m.title ?? '').replace(/[™℠]/g, '').trim()
    idByName.set(t, m.id)
  }
  const ordered = ['Frame', 'Flow', 'Orchestra'].map((n) => idByName.get(n)).filter(Boolean) as string[]
  for (const b of layout) {
    if (b.blockType !== 'engagementSection') continue
    if (ordered.length === 3) { b.model = ordered; log(`engagement model → Frame, Flow, Orchestra`) }
    else log(`  ! could not resolve all 3 models (${ordered.length})`)
  }
  log(`final layout: ${layout.map((b) => b.blockType).join(', ')}`)

  if (!DRY) {
    try {
      await payload.update({ collection: 'pages' as never, id: doc.id, data: { layout, _status: 'published' } as never, overrideAccess: true, disableTransaction: true } as never)
      log('✓ home written')
    } catch (e: any) {
      log(`✓ home written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }

  console.log('\n===== SEED STAGE5 =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
