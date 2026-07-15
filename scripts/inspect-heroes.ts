// Read-only discovery for the hero-consolidation migration:
//   - the user id/email/role for ashemul@ternary.solutions (activity-log attribution)
//   - every `pages` doc: slug + the ordered blockTypes in its layout, per locale, with the
//     heading text of each hero-ish block so we can see what data would migrate.
//
//   pnpm payload run ./scripts/inspect-heroes.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const LOCALES = ['en', 'bn'] as const
const HERO_SLUGS = new Set([
  'storiesHero',
  'aboutHero',
  'scalesHero',
  'industriesHero',
  'careersHero',
  'solutionsHero',
  'contactHero',
  'heroFeatured',
])

const payload = await getPayload({ config })

// 1) The actor account for activity-log attribution.
const users = (await payload.find({
  collection: 'users' as never,
  where: { email: { equals: 'ashemul@ternary.solutions' } } as never,
  depth: 0,
  limit: 1,
  overrideAccess: true,
})) as any
const actor = users.docs?.[0]
console.log(
  'ACTOR ashemul@ternary.solutions:',
  actor ? { id: actor.id, email: actor.email, name: actor.name, role: actor.role } : 'NOT FOUND',
)

// 2) Every page's layout, per locale.
for (const locale of LOCALES) {
  const res = (await payload.find({
    collection: 'pages' as never,
    locale: locale as never,
    fallbackLocale: false as never,
    draft: true,
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })) as any
  console.log(`\n===== PAGES [${locale}] (${res.docs.length}) =====`)
  for (const doc of res.docs) {
    const blocks = (doc.layout ?? []) as any[]
    const summary = blocks
      .map((b, i) => {
        const isHero = HERO_SLUGS.has(b.blockType)
        const head = typeof b.heading === 'string' ? b.heading : b.heading ? '[rich]' : ''
        return `${i}:${b.blockType}${isHero ? `  <== HERO heading="${head}"` : ''}`
      })
      .join('\n    ')
    console.log(`- ${doc.slug} (id=${doc.id}) _status=${doc._status}\n    ${summary}`)
  }
}

process.exit(0)
