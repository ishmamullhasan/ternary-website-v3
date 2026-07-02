// Seed the bespoke panel data onto the REAL scale docs (Payload collection 'scale' → mongo
// collection `scales`; mongoose pluralizes the slug). Updates by slug via Local API per-locale
// (en then bn) so locales aren't wiped; scale has no drafts so writes are live. Then wires the
// Scales page `scaleShowcase` to the real ids (per-locale publish) and drops the stray singular
// `scale` collection that an earlier wrong-target seed created. afterChange revalidateTag throws
// outside a Next request — it fires after the commit, so we swallow it.
//   pnpm payload run ./scripts/seed-scale-panels.ts
import config from '@payload-config'
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'
import { TIERS } from './content/scale-panels.data'

const PAGE_ID = '6a32be5d0e362afdc192f10b'
const LOCALES = ['en', 'bn'] as const
const out: string[] = []
const log = (s: string) => {
  out.push(s)
  writeFileSync('./scratch-seed.txt', out.join('\n') + '\n')
}
const tryUpdate = async (fn: () => Promise<unknown>, tag: string) => {
  try {
    await fn()
    log(`  ${tag}: OK`)
  } catch (e: any) {
    log(`  ${tag}: threw post-commit (expected): ${String(e?.message).slice(0, 70)}`)
  }
}

const payload = await getPayload({ config })

// 1) resolve real scale ids by slug + update each tier's panel data, per locale
const idBySlug: Record<string, string> = {}
for (const tier of TIERS) {
  const found = (await payload.find({
    collection: 'scale' as never,
    where: { slug: { equals: tier.slug } } as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })) as any
  const id = found.docs?.[0]?.id
  if (!id) {
    log(`!! scale slug ${tier.slug} not found — skipping`)
    continue
  }
  idBySlug[tier.slug] = String(id)
  const { slug, ...rest } = tier as any
  // Write BOTH locales in one shot with locale:'all' so localized subfields inside arrays
  // (title/subtext/value/phase…) keep stable row ids across locales. Per-locale writes without
  // stable ids drop array-nested localized subfields. scale has no drafts, so locale:'all' is safe.
  await tryUpdate(
    () =>
      payload.update({ collection: 'scale' as never, id, locale: 'all' as never, data: rest, overrideAccess: true }),
    `scale[${tier.slug}][all]`,
  )
}

// 2) wire the Scales page scaleShowcase -> real ids, per-locale publish
const SCALE_IDS = TIERS.map((t) => idBySlug[t.slug]).filter(Boolean)
log(`\nwiring scaleShowcase -> ${JSON.stringify(SCALE_IDS)}`)
for (const locale of LOCALES) {
  const page = (await payload.findByID({
    collection: 'pages' as never,
    id: PAGE_ID,
    locale: locale as never,
    draft: true,
    depth: 0,
  })) as any
  const layout = (page.layout ?? []).map((b: any) =>
    b.blockType === 'scaleShowcase' ? { ...b, scales: SCALE_IDS } : b,
  )
  await tryUpdate(
    () =>
      payload.update({
        collection: 'pages' as never,
        id: PAGE_ID,
        locale: locale as never,
        draft: false,
        data: { layout, _status: 'published' } as never,
      }),
    `page[${locale}]`,
  )
}

// 3) verify via published reads (bypasses Next cache)
for (const locale of LOCALES) {
  const r = (await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'scales' } } as never,
    draft: false,
    locale: locale as never,
    overrideAccess: true,
    depth: 2,
    limit: 5,
  })) as any
  const sc = (r.docs[0]?.layout ?? []).find((b: any) => b.blockType === 'scaleShowcase')
  const resolved = (sc?.scales ?? []).map((s: any) =>
    typeof s === 'object' ? `${s.subTitle}/${s.panelType}` : `UNRESOLVED:${s}`,
  )
  log(`verify[${locale}]: ${JSON.stringify(resolved)}`)
}
process.exit(0)
