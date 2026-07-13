// Link each solutionsEngage card to its Model record, so the card panel renders the model's
// thumbnail instead of a bare gradient.
//
// Cards are matched to models by title: "Frame™" → model slug `frame`, etc. (the card uses ™, the
// model record uses ℠, so compare on the leading word only).
//
// The card's `model` field is NOT localized, so a single `en` write sets it for both locales. We
// still send the en-read layout back so the en localized values round-trip unchanged, and we never
// touch the bn doc — writing bn from an en layout would overwrite Bengali copy with English.
//
// Also reports the alt text on each linked thumbnail per locale: Media.alt is required + localized,
// and Payload's `fallback: true` means a missing bn alt silently serves the English string.
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/link-engage-models.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/link-engage-models.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const payload: Payload = await getPayload({ config })
payload.logger.info(`Link solutionsEngage cards → model ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

// --- Models, keyed by slug ---
const models = await payload.find({ collection: 'model', depth: 1, locale: 'en', limit: 50, overrideAccess: true })
const bySlug = new Map<string, any>()
for (const m of models.docs as any[]) bySlug.set(String(m.slug), m)
payload.logger.info(`  models: ${[...bySlug.keys()].join(', ')}`)

/** "Frame™" / "Frame℠" / "Frame" → "frame" */
const key = (title: unknown): string =>
  String(title ?? '')
    .replace(/[™℠®©]/g, '')
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()

// --- Alt-text audit on the thumbnails we're about to surface ---
for (const [slug, m] of bySlug) {
  const thumbId = typeof m.thumbnail === 'object' ? m.thumbnail?.id : m.thumbnail
  if (!thumbId) {
    payload.logger.warn(`  model ${slug}: no thumbnail — its card will fall back to the gradient`)
    continue
  }
  for (const loc of ['en', 'bn'] as const) {
    const media: any = await payload.findByID({
      collection: 'media',
      id: String(thumbId),
      locale: loc,
      fallbackLocale: false,
      overrideAccess: true,
    })
    const alt = media?.alt
    payload.logger.info(`  model ${slug} thumbnail alt [${loc}]: ${alt ? `"${alt}"` : '*** UNSET ***'}`)
  }
}

// --- Link the cards ---
const raw = await payload.db.connection.collection('pages').find({ 'layout.blockType': 'solutionsEngage' }).toArray()

for (const r of raw) {
  const id = String(r._id)
  const doc: any = await payload.findByID({
    collection: 'pages',
    id,
    depth: 0, // ids only — we write ids back, not populated objects
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  })

  let linked = 0
  const layout = (doc.layout ?? []).map((b: any) => {
    if (b.blockType !== 'solutionsEngage') return b
    const cards = (b.cards ?? []).map((c: any) => {
      const model = bySlug.get(key(c.title))
      if (!model) {
        payload.logger.warn(`    card "${c.title}": no model matched (looked for slug "${key(c.title)}")`)
        return c
      }
      linked++
      payload.logger.info(`    card "${c.title}" → model ${model.slug}`)
      return { ...c, model: String(model.id) }
    })
    return { ...b, cards }
  })

  if (linked === 0 || DRY) continue

  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id,
      locale: 'en',
      data: { title: doc.title || doc.slug, layout, _status: 'published' } as never,
      context: { disableRevalidate: true },
    }),
  )
  payload.logger.info(`  page ${doc.slug}: linked ${linked} card(s), published`)
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Link complete.')
process.exit(0)
