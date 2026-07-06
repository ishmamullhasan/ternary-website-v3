// Seed the CANONICAL marketing content (capabilities, scales, models, insights, press
// releases) from scripts/content/*.json, delete the placeholder/junk docs, and re-wire the
// homepage section relationships to the new docs (incl. a prepended StoriesArchive featured-8).
// Stories + team are left intact (already canonical); only their junk dupes are removed.
//
// Order: upsert canonical -> wire home -> delete non-canonical (so the home never references a
// deleted-but-not-yet-replaced doc). DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/seed-content.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/seed-content.ts # apply
import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const DIR = join(dirname(fileURLToPath(import.meta.url)), 'content')
const ctx = { disableRevalidate: true }

const read = (file: string): any[] => JSON.parse(readFileSync(join(DIR, file), 'utf8'))

// ---- Lexical richText (same shape as scripts/seed-deck-content.ts) -------
const txt = (text: string) => ({ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  textStyle: '',
  children: [txt(text)],
})
const heading = (text: string) => ({
  type: 'heading',
  tag: 'h3',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [txt(text)],
})
type CB = { heading?: string; paras?: string[] }
const toLexical = (blocks: CB[]) => {
  const children: unknown[] = []
  for (const b of blocks || []) {
    if (b.heading) children.push(heading(b.heading))
    for (const p of b.paras || []) children.push(para(p))
  }
  if (!children.length) children.push(para(''))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children } }
}

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed canonical content ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'} — dir ${DIR}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; the DB write
// commits first, so swallow only that specific error (same handling as the deck seed).
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const findIdBySlug = async (collection: string, slug: string): Promise<string | number | null> => {
  const r = await payload.find({
    collection: collection as any,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return r.docs[0]?.id ?? null
}

const upsertBySlug = async (
  collection: string,
  slug: string,
  data: Record<string, unknown>,
): Promise<string | number | null> => {
  const existing = await findIdBySlug(collection, slug)
  if (DRY) return existing ?? `dry-${slug}`
  await ignoreRevalidate(() =>
    existing
      ? payload.update({ collection: collection as any, id: existing, data, context: ctx })
      : payload.create({ collection: collection as any, data: { slug, ...data }, context: ctx }),
  )
  return (await findIdBySlug(collection, slug)) ?? null
}

// ---- Team lookup (by name; not modified) --------------------------------
const teamByName = new Map<string, string | number>()
{
  const r = await payload.find({ collection: 'team', limit: 200, depth: 0, locale: 'en', overrideAccess: true })
  for (const d of r.docs as any[]) if (d.name) teamByName.set(d.name, d.id)
}
const resolveMember = (name?: string) => (name ? (teamByName.get(name) ?? null) : null)

// ========================================================================
// 1) UPSERT CANONICAL
// ========================================================================

// Scales
const scales = read('scales.json')
for (const s of scales) {
  const { slug, ...rest } = s
  await upsertBySlug('scale', slug, rest)
}
payload.logger.info(`  scale: ${scales.length} upserted`)

// Models (contentBlocks -> richText content)
const models = read('models.json')
for (const m of models) {
  await upsertBySlug('model', m.slug, { title: m.title, excerpts: m.excerpts, content: toLexical(m.contentBlocks) })
}
payload.logger.info(`  model: ${models.length} upserted (Orchestra redefined: multi-program)`)

// Insights (resolve author by name; contentBlocks -> content)
const insights = read('insights.json')
for (const i of insights) {
  const { slug, authorName, contentBlocks, ...rest } = i
  await upsertBySlug('insight', slug, { ...rest, author: resolveMember(authorName), content: toLexical(contentBlocks) })
}
payload.logger.info(`  insight: ${insights.length} upserted`)

// Press releases (contentBlocks -> content)
const pressReleases = read('pressReleases.json')
for (const p of pressReleases) {
  const { slug, contentBlocks, ...rest } = p
  await upsertBySlug('pressRelease', slug, { ...rest, content: toLexical(contentBlocks) })
}
payload.logger.info(`  pressRelease: ${pressReleases.length} upserted`)

// Capabilities — pass 1 (everything except relatedCapabilities), pass 2 (relatedCapabilities).
const capabilities = read('capabilities.json')
const capIdBySlug = new Map<string, string | number>()
for (const c of capabilities) {
  const { slug, practiceLead, relatedCapabilities: _rc, ...rest } = c
  const pl = { ...practiceLead, member: resolveMember(practiceLead?.memberName) }
  delete (pl as any).memberName
  const id = await upsertBySlug('capability', slug, { ...rest, practiceLead: pl })
  if (id) capIdBySlug.set(slug, id)
}
for (const c of capabilities) {
  const rc = c.relatedCapabilities
  if (!rc) continue
  const capabilitiesIds = (rc.capabilitySlugs || []).map((s: string) => capIdBySlug.get(s)).filter(Boolean)
  const id = capIdBySlug.get(c.slug)
  if (!DRY && id) {
    await ignoreRevalidate(() =>
      payload.update({
        collection: 'capability',
        id,
        data: {
          relatedCapabilities: { sectionLabel: rc.sectionLabel, heading: rc.heading, capabilities: capabilitiesIds },
        },
        context: ctx,
      }),
    )
  }
}
payload.logger.info(`  capability: ${capabilities.length} upserted (+ relatedCapabilities wired)`)

// ========================================================================
// 2) WIRE HOMEPAGE
// ========================================================================
const CANON = {
  capability: ['enterprise-transformation', 'product-development', 'engineering-augmentation', 'managed-systems'],
  scale: ['startups-and-scale-ups', 'mid-market-and-enterprise', 'public-sector'],
  model: ['frame', 'flow', 'orchestra'],
  story: [
    'counterfoil-continuum',
    'turfly',
    'alley-analytix',
    'flex5',
    'farogl-odoo-erp',
    'doyouwork',
    'hissho-sushiops360',
    'lankabangla-securities',
  ],
  insight: ['production-responsibility', 'air-gapped-ai-for-regulated-industries'],
  pressRelease: ['dual-hub-delivery-model', 'engagement-framework-frame-flow-orchestra'],
}

const idsForSlugs = async (collection: string, slugs: string[]): Promise<(string | number)[]> => {
  const out: (string | number)[] = []
  for (const s of slugs) {
    const id = await findIdBySlug(collection, s)
    if (id) out.push(id)
  }
  return out
}

const capIds = await idsForSlugs('capability', CANON.capability)
const scaleIds = await idsForSlugs('scale', CANON.scale)
const modelIds = await idsForSlugs('model', CANON.model)
const orchestraId = await findIdBySlug('model', 'orchestra')
// Featured-8: 4 stories + 2 insights as `items`, 2 press releases as `pressRelease`.
const featuredStorySlugs = ['farogl-odoo-erp', 'counterfoil-continuum', 'doyouwork', 'lankabangla-securities']
const featuredStoryIds = await idsForSlugs('story', featuredStorySlugs)
const featuredInsightIds = await idsForSlugs('insight', CANON.insight)
const pressIds = await idsForSlugs('pressRelease', CANON.pressRelease)

const poly = (relationTo: string, id: string | number) => ({ relationTo, value: id })

const storiesArchiveBlock = {
  blockType: 'storiesArchive',
  heading: 'Featured work',
  description: 'Selected stories, insights, and announcements from across our engagements.',
  items: [...featuredStoryIds.map((id) => poly('story', id)), ...featuredInsightIds.map((id) => poly('insight', id))],
  pressRelease: pressIds,
}

// aboutSection.items: a curated "what we do" mix (4 capabilities + 3 scales + Orchestra) = 8 cards.
// Bento rows: { item, size }. Default pattern fills a 4-col dense grid with no holes for 8 cards:
// large(2×2) + 2 standard stacked beside it, then a wide(2×1) row, then standards backfill.
const BENTO_PATTERN = ['large', 'standard', 'standard', 'standard', 'standard', 'wide', 'standard', 'standard']
const aboutItems = [
  ...capIds.map((id) => poly('capability', id)),
  ...scaleIds.map((id) => poly('scale', id)),
  ...(orchestraId ? [poly('model', orchestraId)] : []),
].map((rel, i) => ({ item: rel, size: BENTO_PATTERN[i] ?? 'standard' }))

const home = (
  await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: true,
  })
).docs[0] as any

if (!home) {
  payload.logger.error('  home page not found — skipping home wiring')
} else {
  const existing = Array.isArray(home.layout) ? home.layout : []
  const rewired = existing.map((b: any) => {
    switch (b.blockType) {
      case 'capabilitiesSection':
        return { ...b, capability: capIds }
      case 'scalesSection':
        return { ...b, scales: scaleIds }
      case 'engagementSection':
        return { ...b, model: modelIds }
      case 'aboutSection':
        return { ...b, items: aboutItems }
      default:
        return b
    }
  })
  // Prepend the featured-8 StoriesArchive as the new first section (unless one already exists).
  const hasArchive = rewired.some((b: any) => b.blockType === 'storiesArchive')
  const newLayout = hasArchive
    ? rewired.map((b: any) => (b.blockType === 'storiesArchive' ? { ...b, ...storiesArchiveBlock } : b))
    : [storiesArchiveBlock, ...rewired]

  payload.logger.info(
    `  home wiring: storiesArchive(items=${storiesArchiveBlock.items.length}, press=${pressIds.length}) | capabilities=${capIds.length} scales=${scaleIds.length} models=${modelIds.length} about=${aboutItems.length} | layout ${existing.length} -> ${newLayout.length}`,
  )
  if (!DRY) {
    // Pages.title is required+localized; the home doc has no en title, so an update that omits it
    // fails re-validation. Preserve the existing title, falling back to 'Home' (as ci-seed.ts uses).
    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id: home.id,
        data: { title: home.title || 'Home', layout: newLayout, _status: 'published' },
        context: ctx,
      }),
    )
  }
}
// NOTE: the /stories page's storiesArchive also references the (now-deleted) junk press releases,
// but its other blocks (featureCaseStudy, subscribe) carry pre-existing empty *required* sub-fields
// that only fail under strict publish validation — so a full-layout rewrite of /stories is rejected.
// Payload has no partial-block update, so fixing /stories' press refs is left as a follow-up (edit
// that block in the admin, or fill the unrelated blocks' required fields first). Home is unaffected.

// ========================================================================
// 3) DELETE NON-CANONICAL (placeholders / junk dupes)
// ========================================================================
const cleanup: Record<string, string[]> = {
  capability: CANON.capability,
  scale: CANON.scale,
  story: CANON.story,
  insight: CANON.insight,
  pressRelease: CANON.pressRelease,
  // model + team are NOT cleaned (frame/flow/orchestra canonical; team left intact).
}
for (const [collection, keep] of Object.entries(cleanup)) {
  const keepSet = new Set(keep)
  const r = await payload.find({
    collection: collection as any,
    limit: 500,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })
  const doomed = (r.docs as any[]).filter((d) => !keepSet.has(d.slug))
  payload.logger.info(
    `  cleanup ${collection}: ${doomed.length} to delete -> [${doomed.map((d) => d.slug).join(', ')}]`,
  )
  if (!DRY) {
    for (const d of doomed) {
      try {
        await ignoreRevalidate(() => payload.delete({ collection: collection as any, id: d.id, context: ctx }))
      } catch (e) {
        payload.logger.warn(`    ! could not delete ${collection}/${d.slug}: ${(e as Error).message}`)
      }
    }
  }
}

payload.logger.info(
  `Seed canonical content ${DRY ? 'DRY RUN complete (re-run with SEED_DRY=0 to apply).' : 'complete.'}`,
)
process.exit(0)
