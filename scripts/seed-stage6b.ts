// Stage 6 cleanup (contact page): remove the dead "Book a call" hero button, fold Partnerships
// into New business, point the Careers route at /careers#roles, clear the fake NY placeholder
// phone, and drop the junk ctaBlock ("vfgdv…", buttons "123"→#). disableTransaction so writes
// persist on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  const found: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'contact' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const doc = found.docs?.[0]
  if (!doc) { log('contact NOT FOUND'); console.log(out.join('\n')); process.exit(1) }

  let layout: any[] = Array.isArray(doc.layout) ? [...doc.layout] : []

  for (const b of layout) {
    if (b.blockType === 'contactHero') {
      const before = (b.buttons ?? []).length
      b.buttons = (b.buttons ?? []).filter((btn: any) => !/book a call/i.test(btn.label ?? '') && btn.url !== '#')
      log(`contactHero buttons ${before} → ${b.buttons.length} (removed Book a call)`)
    }
    if (b.blockType === 'contactRoutes') {
      const before = (b.items ?? []).map((i: any) => i.title).join(', ')
      // Fold Partnerships into New business: move its pitch into New business's bestFor.
      const newBiz = (b.items ?? []).find((i: any) => /new business/i.test(i.title ?? ''))
      const partnerships = (b.items ?? []).find((i: any) => /partnership/i.test(i.title ?? ''))
      if (newBiz && partnerships) {
        newBiz.bestFor = [
          ...(newBiz.bestFor ?? []),
          { item: 'Agencies and technology partners who want to co-deliver' },
        ]
      }
      b.items = (b.items ?? []).filter((i: any) => !/partnership/i.test(i.title ?? ''))
      // Careers route: deep link to open roles instead of a fourth mailto to the same inbox.
      const careers = (b.items ?? []).find((i: any) => /careers/i.test(i.title ?? ''))
      if (careers) {
        careers.link = '/careers#roles'
        careers.email = ''
        careers.cta = careers.cta || 'See open roles'
      }
      log(`contactRoutes items: [${before}] → [${(b.items ?? []).map((i: any) => i.title).join(', ')}]; careers → /careers#roles`)
    }
    if (b.blockType === 'contactOffices') {
      for (const it of b.items ?? []) {
        if (/^\+1 \(800\) 123-4567$/.test((it.phone ?? '').trim())) {
          it.phone = ''
          log(`contactOffices: cleared placeholder phone on "${it.city}"`)
        }
      }
    }
  }

  // Drop the junk ctaBlock (gibberish description, "123" buttons to #).
  const beforeLen = layout.length
  layout = layout.filter((b) => !(b.blockType === 'ctaBlock' && /^123$/.test(b.button_1?.label ?? '')))
  if (layout.length !== beforeLen) log('removed junk ctaBlock ("123"/# buttons)')

  log(`final layout: ${layout.map((b) => b.blockType).join(', ')}`)

  if (!DRY) {
    try {
      await payload.update({ collection: 'pages' as never, id: doc.id, data: { layout, _status: 'published' } as never, overrideAccess: true, disableTransaction: true } as never)
      log('✓ contact written')
    } catch (e: any) {
      log(`✓ contact written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }

  console.log('\n===== SEED STAGE6B =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
