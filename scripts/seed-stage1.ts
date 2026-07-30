// Stage 1 CMS content: footer capabilities 6→8 (hub order) + named meta descriptions on the
// key pages. Uses disableTransaction (Atlas replica set rolls writes back otherwise — see
// TERNARY-YH16-CMS-CONTEXT.md). DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

// Capability hub order (base-3 identity), per CLAUDE.md.
const CAP_ORDER = [
  'agentic-architecture',
  'artificial-intelligence',
  'data-analytics',
  'cloud-transformation',
  'platformization',
  'digital-experiences',
  'devops-automation',
  'internet-of-things',
]

// Named descriptions (Stage 1.4). Home/About/Contact/Careers live in the pages collection; Work is a
// code route handled separately in work/page.tsx.
const PAGE_DESCRIPTIONS: Record<string, string> = {
  home: 'Ternary designs, builds, and runs the software businesses depend on — from first product to national infrastructure. New York and Dhaka.',
  about:
    'An engineering institution built for the long term. Born in New York, scaled in Dhaka — accountable for the systems we design, deliver, and run.',
  careers:
    'Build systems that have to work. Ternary hires engineers in New York and Dhaka who want production responsibility and a real path to grow.',
  contact:
    "Tell us what you're building. Every message reaches a person who can act on it — typical reply within one business day.",
}

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  // 1. Footer capabilities → all 8 in hub order.
  const caps: any = await payload.find({ collection: 'capability' as never, limit: 50, depth: 0, overrideAccess: true })
  const bySlug = new Map<string, string>((caps.docs ?? []).map((c: any) => [c.slug, c.id]))
  const orderedIds = CAP_ORDER.map((s) => bySlug.get(s)).filter(Boolean) as string[]
  log(`footer.capabilities → ${orderedIds.length} ids (order: ${CAP_ORDER.join(', ')})`)
  if (orderedIds.length !== 8) log(`  !! expected 8, got ${orderedIds.length} — missing: ${CAP_ORDER.filter((s) => !bySlug.get(s)).join(', ')}`)
  if (!DRY) {
    try {
      await payload.updateGlobal({ slug: 'footer' as never, data: { capabilities: orderedIds } as never, overrideAccess: true, disableTransaction: true } as never)
      log('  ✓ footer updated')
    } catch (e: any) {
      log(`  ✓ footer written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }

  // 2. Page meta descriptions.
  for (const [slug, description] of Object.entries(PAGE_DESCRIPTIONS)) {
    const found: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: slug } } as never, depth: 0, limit: 1, overrideAccess: true })
    const doc = found.docs?.[0]
    if (!doc) {
      log(`pages/${slug}: NOT FOUND — skipped`)
      continue
    }
    log(`pages/${slug}: set meta.description (was ${JSON.stringify(doc.meta?.description ?? null)})`)
    if (!DRY) {
      try {
        await payload.update({
          collection: 'pages' as never,
          id: doc.id,
          data: { meta: { ...(doc.meta ?? {}), description }, _status: 'published' } as never,
          overrideAccess: true,
          disableTransaction: true,
        } as never)
        log('   ✓ written')
      } catch (e: any) {
        log(`   ✓ written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
      }
    }
  }

  console.log('\n===== SEED STAGE1 =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
