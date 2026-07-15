// Confirm relationship-bearing blocks on the migrated pages still hold their references after the
// depth-0 layout round-trip (the audit diff flagged layout.items/capability/etc. as "changed").
//   pnpm payload run ./scripts/verify-hero-relations.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const check = async (slug: string) => {
  const doc = (
    (await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: slug } } as never,
      locale: 'en' as never,
      draft: false,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
  ).docs?.[0]
  const lines: string[] = []
  for (const b of (doc?.layout ?? []) as any[]) {
    const relKeys = ['items', 'capability', 'capabilities', 'industry', 'pressRelease', 'models', 'member', 'members']
    const parts = relKeys
      .filter((k) => b[k] !== undefined)
      .map((k) => `${k}=${Array.isArray(b[k]) ? b[k].length : b[k] ? 1 : 0}`)
    lines.push(`  ${b.blockType}${parts.length ? ' [' + parts.join(', ') + ']' : ''}`)
  }
  console.log(`${slug}:\n${lines.join('\n')}`)
}

for (const s of ['insights', 'capabilities', 'stories', 'industries', 'about']) await check(s)
process.exit(0)
