// Seed the bn (Bangla) locale from the AI translations in /tmp/bn-trans-*.json.
// Reads the full EN doc, overlays the bn values onto the localized leaf paths, and
// writes at locale:'bn' via payload.update — English is untouched (separate locale layer).
// DRY by default (SEED_DRY!=='0'): prints a sample + counts, writes nothing.
//   DATABASE_URI=<uri> SEED_DRY=1 pnpm payload run ./scripts/seed-bn.ts   # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/seed-bn.ts   # apply
import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

type Leaf = { path: string; type: string; value: string; bn?: string }
type Doc = { kind: 'collection' | 'global'; slug: string; id?: string | number; title?: string; leaves: Leaf[] }

// Set a value at a path like "layout[0].buttons[1].label" inside obj (in place).
function setByPath(obj: any, path: string, value: unknown): boolean {
  const parts = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur == null) return false
    cur = cur[parts[i]]
  }
  if (cur == null) return false
  cur[parts[parts.length - 1]] = value
  return true
}

function loadTranslations(): Doc[] {
  const docs: Doc[] = []
  for (let i = 0; i < 10; i++) {
    try {
      docs.push(...(JSON.parse(readFileSync(`/tmp/bn-trans-${i}.json`, 'utf8')) as Doc[]))
    } catch {
      /* missing batch — skip */
    }
  }
  return docs
}

async function run() {
  const payload = await getPayload({ config })
  const docs = loadTranslations()
  let totalFields = 0,
    written = 0,
    skipped = 0,
    samples = 0
  console.log(`MODE: ${DRY ? 'DRY-RUN (no writes)' : 'APPLY (writing bn locale)'} — ${docs.length} docs\n`)

  for (const doc of docs) {
    const translated = doc.leaves.filter((l) => l.bn && l.bn !== l.value)
    if (!translated.length) {
      skipped++
      continue
    }
    totalFields += translated.length

    // Pull the full EN doc and overlay bn values onto the localized leaf paths.
    let base: any
    try {
      base =
        doc.kind === 'global'
          ? await payload.findGlobal({ slug: doc.slug as any, locale: 'en', depth: 0 })
          : ((await payload.findByID({
              collection: doc.slug as any,
              id: doc.id as any,
              locale: 'en',
              depth: 0,
            })) as any)
    } catch (e) {
      console.log(`  ! could not load ${doc.slug} ${doc.id ?? ''}: ${(e as Error).message}`)
      continue
    }
    const data = JSON.parse(JSON.stringify(base))
    let applied = 0
    for (const l of translated) if (setByPath(data, l.path, l.bn)) applied++

    if (DRY) {
      if (samples < 12) {
        console.log(`[${doc.kind}/${doc.slug}${doc.id ? ' ' + doc.id : ''}] ${applied} fields, e.g.:`)
        for (const l of translated.slice(0, 2))
          console.log(`    ${JSON.stringify(l.value).slice(0, 48)} -> ${JSON.stringify(l.bn).slice(0, 60)}`)
        samples++
      }
      written += applied
    } else {
      try {
        if (doc.kind === 'global') {
          await payload.updateGlobal({
            slug: doc.slug as any,
            locale: 'bn',
            data,
            depth: 0,
            overrideAccess: true,
          } as any)
        } else {
          await payload.update({
            collection: doc.slug as any,
            id: doc.id as any,
            locale: 'bn',
            data,
            depth: 0,
            overrideAccess: true,
          } as any)
        }
        written += applied
      } catch (e) {
        const msg = (e as Error).message || ''
        // The DB write commits before the afterChange revalidateTag hook runs; that hook
        // throws outside a Next request context (`payload run`), but the bn values are
        // already persisted. Treat it as success; surface anything else as a real failure.
        if (msg.includes('revalidateTag') || msg.includes('static generation store')) {
          written += applied
        } else {
          console.log(`  ! update failed ${doc.slug} ${doc.id ?? ''}: ${msg}`)
        }
      }
    }
  }

  console.log(
    `\n${DRY ? 'WOULD WRITE' : 'WROTE'} ${written} bn fields across ${docs.length - skipped} docs (${totalFields} translated, ${skipped} docs with nothing to write).`,
  )
  if (DRY) console.log('Re-run with SEED_DRY=0 to apply.')
  process.exit(0)
}
await run()
