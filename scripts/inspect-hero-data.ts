// Dump the actor id + the exact heading/description of every SIMILAR hero we're about to migrate.
//   pnpm payload run ./scripts/inspect-hero-data.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const LOCALES = ['en', 'bn'] as const
const TARGETS = ['insights', 'capabilities', 'stories', 'about', 'industries'] as const

const payload = await getPayload({ config })

const users = (await payload.find({
  collection: 'users' as never,
  where: { email: { equals: 'ashemul@ternary.solutions' } } as never,
  depth: 0,
  limit: 1,
  overrideAccess: true,
})) as any
const actor = users.docs?.[0]
console.log(
  'ACTOR:',
  actor ? JSON.stringify({ id: actor.id, email: actor.email, name: actor.name, role: actor.role }) : 'NOT FOUND',
)

const descText = (d: any): string => {
  try {
    const kids = d?.root?.children ?? []
    const walk = (n: any): string => (n?.text ?? '') + (n?.children ?? []).map(walk).join('')
    return kids.map(walk).join(' ⏎ ').slice(0, 120)
  } catch {
    return '[unparseable]'
  }
}

for (const slug of TARGETS) {
  console.log(`\n===== ${slug} =====`)
  for (const locale of LOCALES) {
    const res = (await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: slug } } as never,
      locale: locale as never,
      fallbackLocale: false as never,
      draft: false,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
    const doc = res.docs?.[0]
    const hero = (doc?.layout ?? [])[0]
    console.log(`  [${locale}] block=${hero?.blockType} id=${hero?.id}`)
    console.log(`        heading=${JSON.stringify(hero?.heading)}`)
    console.log(`        desc="${descText(hero?.description)}"`)
  }
}

process.exit(0)
