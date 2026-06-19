// READ-ONLY: confirm bn landed on the new docs. Show bn samples + Bengali codepoint counts.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const bengali = (s: string) => [...(s || '')].filter((c) => c >= 'ঀ' && c <= '৿').length
const richText = (v: any): string => {
  let out = ''
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return
    if (typeof n.text === 'string') out += n.text + ' '
    for (const c of n.children || []) walk(c)
  }
  walk(v?.root)
  return out
}

const checks: [string, any, string][] = [
  ['capability', { slug: { equals: 'enterprise-transformation' } }, 'excerpts'],
  ['scale', { slug: { equals: 'startups-and-scale-ups' } }, 'subTitle'],
  ['insight', { slug: { equals: 'production-responsibility' } }, 'leadParagraph'],
  ['pressRelease', { slug: { equals: 'dual-hub-delivery-model' } }, 'excerpts'],
]
for (const [c, where, field] of checks) {
  const r = await payload.find({ collection: c as any, where, limit: 1, depth: 0, locale: 'bn', overrideAccess: true })
  const v = String((r.docs[0] as any)?.[field] ?? '')
  console.log(`  ${c}.${field} [bn ${bengali(v)} chars]: ${v.slice(0, 70)}`)
}
// richText body (model orchestra content)
const m = await payload.find({
  collection: 'model',
  where: { slug: { equals: 'orchestra' } },
  limit: 1,
  depth: 0,
  locale: 'bn',
  overrideAccess: true,
})
const body = richText((m.docs[0] as any)?.content)
console.log(`  model.content(orchestra) [bn ${bengali(body)} chars]: ${body.slice(0, 90)}`)
process.exit(0)
