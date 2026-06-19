// Restore en {name, position, excerpt, description} for team docs from deck team.json, matched by
// SLUG (stable, non-localized) — the deck seed matches by name, which is empty in en here and so
// fails with a slug collision. Update-only; never creates.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/restore-team-en.ts
import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const ctx = { disableRevalidate: true }
const DIR = join(dirname(fileURLToPath(import.meta.url)), 'deck-content')
const team = JSON.parse(readFileSync(join(DIR, 'team.json'), 'utf8')) as any[]
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const payload = await getPayload({ config })
const ignoreRevalidate = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

let updated = 0,
  missing = 0
for (const r of team) {
  const slug = slugify(r.name)
  const found = await payload.find({
    collection: 'team',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!found.docs[0]) {
    console.log(`  ! no team doc for slug "${slug}" (${r.name})`)
    missing++
    continue
  }
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'team',
      id: found.docs[0].id,
      locale: 'en',
      data: { name: r.name, position: r.position, excerpt: r.excerpt, description: r.description },
      context: ctx,
      overrideAccess: true,
    } as any),
  )
  updated++
}
console.log(`restore-team-en: ${updated} updated, ${missing} missing (of ${team.length} deck entries)`)
process.exit(0)
