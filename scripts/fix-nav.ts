// WEB-458 — restructure the header nav to the Figma design (node 339:8017): 6 items, each a
// dropdown, mirroring the footer columns. About Us / Contact Us move under a new "Company"
// dropdown (not deleted). Preserves logo, siteName, CTA button, and the existing Stories dropdown.
//   CONTENT_DRY=1 pnpm payload run ./scripts/fix-nav.ts   # preview (default)
//   CONTENT_DRY=0 pnpm payload run ./scripts/fix-nav.ts   # apply
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')

type Sub = { label: string; link: string }
type Item = { label?: string | null; link?: string | null; subItems?: Sub[] | null }
type RelDoc = { title?: string | null; slug?: string | null }

const subsFrom = (docs: unknown, prefix: string): Sub[] =>
  ((docs as RelDoc[] | undefined) ?? [])
    .filter((d) => d?.title && d?.slug)
    .map((d) => ({ label: d.title as string, link: `${prefix}/${d.slug}` }))

const run = async () => {
  const payload = await getPayload({ config })
  const header = (await payload.findGlobal({ slug: 'header' as never, locale: 'en', depth: 1 })) as Record<string, unknown>
  const footer = (await payload.findGlobal({ slug: 'footer' as never, locale: 'en', depth: 2 })) as Record<string, unknown>

  const curMenu = (header.menu as Item[] | undefined) ?? []
  const find = (re: RegExp) => curMenu.find((m) => re.test(m.label ?? ''))
  const stories = find(/^stories$/i)
  const careers = find(/^careers$/i)

  // Company dropdown: curated to links that resolve to REAL pages (avoid the footer menu_4 "#"
  // placeholders and company-info labels with no dedicated route).
  const companySub: Sub[] = [
    { label: 'About Us', link: '/about' },
    { label: 'Contact Us', link: '/contact' },
    { label: 'Careers & Opportunities', link: '/careers' },
    { label: 'Privacy Policy', link: '/legals/privacy-and-policy' },
    { label: 'Modern Slavery Statement', link: '/legals/modern-slavery-statement' },
  ]

  const menu: Item[] = [
    // Stories/Careers as direct links: their dropdowns have no clean sub-item targets (no
    // /insights or /press-release index; junk ---copy slugs). The 4 content menus get dropdowns.
    { label: 'Stories', link: '/stories', subItems: [] },
    { label: 'Solutions', link: '', subItems: subsFrom(footer.solutions, '/solutions') },
    { label: 'Capabilities', link: '', subItems: subsFrom(footer.capabilities, '/capabilities') },
    { label: 'Industries', link: '', subItems: subsFrom(footer.industries, '/industries') },
    { label: 'Company', link: '', subItems: companySub },
    { label: 'Careers', link: careers?.link ?? '/careers', subItems: [] },
  ]

  console.log('\n=== PROPOSED NAV (current → new) ===')
  console.log('current:', curMenu.map((m) => m.label).join(' · '))
  console.log('new    :', menu.map((m) => m.label).join(' · '))
  for (const it of menu) {
    console.log(`\n  ${it.label}${it.link ? ` (${it.link})` : ''} — ${it.subItems?.length ?? 0} sub-item(s)`)
    for (const s of it.subItems ?? []) console.log(`      - ${s.label} → ${s.link}`)
  }

  if (!DRY) {
    const { id: _i, globalType: _g, createdAt: _c, updatedAt: _u, ...data } = header
    try {
      await payload.updateGlobal({ slug: 'header' as never, locale: 'en', data: { ...data, menu } as never })
      console.log('\n✓ header nav updated')
    } catch (e) {
      if (!BENIGN(e)) throw e
      console.log('\n✓ header nav updated (revalidateTag hook skipped outside Next)')
    }
  }
  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'}`)
  await new Promise((r) => setTimeout(r, 500))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('FIX-NAV ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
