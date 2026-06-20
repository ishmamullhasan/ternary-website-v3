import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })
  const page = (await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'home' } } as never, locale: 'en', depth: 0, limit: 1 })).docs?.[0] as { layout?: { blockType?: string }[] } | undefined
  console.log('\n=== home layout order (index : blockType) ===')
  ;(page?.layout ?? []).forEach((b, i) => console.log(`  [${i}] ${b.blockType}`))

  const h = (await payload.findGlobal({ slug: 'header' as never, locale: 'en', depth: 0 })) as { menu?: { label?: string; link?: string; subItems?: unknown[] }[]; button?: { label?: string; link?: string }; siteName?: string; logo?: unknown }
  console.log('\n=== EN header global ===')
  console.log('  siteName:', h.siteName, '| logo:', h.logo ? 'set' : 'none', '| button:', JSON.stringify(h.button))
  console.log('  menu:')
  for (const m of h.menu ?? []) console.log(`    - "${m.label}" link="${m.link}" subItems=${m.subItems?.length ?? 0}`)
  await new Promise((r) => setTimeout(r, 300))
  process.exit(0)
}
try { await run() } catch (e) { console.error('ERR', e); await new Promise((r) => setTimeout(r, 300)); process.exit(1) }
