// Stage 1 inspection: capability slugs/order, footer relationships, pages meta, banking related verticals.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })
  const out: string[] = []
  const log = (s: string) => out.push(s)

  const caps: any = await payload.find({ collection: 'capability' as never, limit: 50, depth: 0, overrideAccess: true })
  log(`capabilities (${caps.totalDocs}): ` + (caps.docs ?? []).map((c: any) => `${c.slug}${c.title ? `="${c.title}"` : ''}`).join(', '))

  const footer: any = await payload.findGlobal({ slug: 'footer' as never, depth: 0, overrideAccess: true } as never)
  for (const k of ['capabilities', 'solutions', 'industries', 'stories', 'insights']) {
    log(`footer.${k} = ${JSON.stringify(footer?.[k])}`)
  }

  for (const slug of ['home', 'about', 'contact', 'careers']) {
    const p: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: slug } } as never, depth: 0, limit: 1, overrideAccess: true })
    const d = p.docs?.[0]
    log(`pages/${slug}: ${d ? `id=${d.id} meta.description=${JSON.stringify(d.meta?.description ?? null)} meta.canonical=${JSON.stringify(d.meta?.canonical ?? null)}` : 'NOT FOUND'}`)
  }

  const bank: any = await payload.find({ collection: 'industry' as never, where: { slug: { equals: 'banking-capital-markets' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const b = bank.docs?.[0]
  log(`industry/banking keys: ${b ? Object.keys(b).join(',') : 'NONE'}`)
  if (b) log(`  banking relatedVerticals/related: ${JSON.stringify(b.relatedVerticals ?? b.related ?? b.relatedIndustries ?? null)}`)

  console.log('\n===== STAGE1 =====\n' + out.join('\n') + '\n')
  process.exit(0)
}
await run()
