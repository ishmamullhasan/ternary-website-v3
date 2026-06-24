// WEB-458 — repoint the footer `industries` relationship from the 7 mis-slugged duplicate docs
// to the clean canonical docs (so footer + nav links use real slugs like /industries/healthcare).
// No deletions. Idempotent. CONTENT_DRY=1 preview (default) / CONTENT_DRY=0 apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')

// Clean canonical industry slugs, in the order they should appear in the footer/nav.
const CLEAN = [
  'healthcare',
  'banking-capital-markets',
  'consumer-goods',
  'hospitality-travel',
  'sports-entertainment',
  'advanced-manufacturing',
  'technology-platforms',
]

const run = async () => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'industry' as never,
    locale: 'en',
    depth: 0,
    limit: 200,
    pagination: false,
  })
  const bySlug = new Map((res.docs as { id: string; slug?: string; title?: string }[]).map((d) => [d.slug, d]))

  const ids: string[] = []
  console.log('\n=== repoint footer.industries → clean docs ===')
  for (const slug of CLEAN) {
    const d = bySlug.get(slug)
    if (d) {
      ids.push(d.id)
      console.log(`  ✓ ${slug.padEnd(26)} → ${d.title} (${String(d.id).slice(-6)})`)
    } else {
      console.log(`  ⚠️ MISSING clean doc for slug "${slug}" — skipped`)
    }
  }

  const footer = (await payload.findGlobal({ slug: 'footer' as never, locale: 'en', depth: 0 })) as Record<
    string,
    unknown
  >
  const current = (footer.industries as { toString(): string }[] | undefined)?.map((x) => String(x)) ?? []
  console.log(`\ncurrent footer.industries ids: ${current.map((x) => x.slice(-6)).join(', ') || '(none)'}`)
  console.log(`new     footer.industries ids: ${ids.map((x) => x.slice(-6)).join(', ')}`)

  if (!DRY) {
    const { id: _i, globalType: _g, createdAt: _c, updatedAt: _u, ...data } = footer
    try {
      await payload.updateGlobal({ slug: 'footer' as never, locale: 'en', data: { ...data, industries: ids } as never })
      console.log('\n✓ footer.industries repointed')
    } catch (e) {
      if (!BENIGN(e)) throw e
      console.log('\n✓ footer.industries repointed (revalidateTag hook skipped outside Next)')
    }
  }
  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'}`)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('REPOINT ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
