// WEB-458 content pass — surgical, idempotent corrections to CMS data (globals + collections).
// Reads each doc, applies ONLY exact string fixes (logs every before→after), writes the whole
// modified object back so nothing else is disturbed. Idempotent (re-run = no-op once applied).
// Tolerates the benign `revalidateTag` invariant thrown by afterChange hooks when run outside a
// Next request — the data write commits before the hook fires, so we log + continue.
//   DATABASE_URI from .env (tunnel). DRY by default:
//     CONTENT_DRY=1 pnpm payload run ./scripts/fix-cms-content.ts   # preview (default)
//     CONTENT_DRY=0 pnpm payload run ./scripts/fix-cms-content.ts   # apply
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'

const RULES: { find: string; replace: string; whole?: boolean; note: string }[] = [
  { find: 'Comsumer', replace: 'Consumer', note: 'typo' },
  { find: 'Mordern', replace: 'Modern', note: 'typo' },
  { find: 'Career & Opportunities', replace: 'Careers & Opportunities', note: 'label' },
  {
    find: 'Agentic Engineering Human Orchestration',
    replace: 'Agentic Engineering.\nHuman Orchestration.',
    note: 'tagline',
  },
  {
    find: 'Copyright',
    whole: true,
    replace: '© Ternary Solutions, Inc. All Rights Reserved.',
    note: 'copyright placeholder',
  },
  { find: 'Solution', whole: true, replace: 'Solutions', note: 'nav label singular→plural' },
]

type Change = { where: string; path: string; before: string; after: string; note: string }
const changes: Change[] = []

function walk(node: unknown, path: string, where: string): unknown {
  if (typeof node === 'string') {
    let next = node
    for (const r of RULES) {
      if (r.whole) {
        if (next === r.find) next = r.replace
      } else if (next.includes(r.find)) next = next.split(r.find).join(r.replace)
    }
    if (next !== node) {
      const rule = RULES.find((r) => (r.whole ? node === r.find : node.includes(r.find)))
      changes.push({ where, path, before: node, after: next, note: rule?.note ?? '' })
    }
    return next
  }
  if (Array.isArray(node)) return node.map((v, i) => walk(v, `${path}[${i}]`, where))
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>))
      out[k] = walk(v, path ? `${path}.${k}` : k, where)
    return out
  }
  return node
}

const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')

const run = async () => {
  const payload = await getPayload({ config })

  // --- globals ---
  for (const slug of ['footer', 'header'] as const) {
    const doc = (await payload.findGlobal({ slug: slug as never, locale: 'en', depth: 0 })) as Record<string, unknown>
    const { id: _id, globalType: _gt, createdAt: _c, updatedAt: _u, ...data } = doc
    const before = changes.length
    const fixed = walk(data, '', `global:${slug}`) as Record<string, unknown>
    if (changes.length > before && !DRY) {
      try {
        await payload.updateGlobal({ slug: slug as never, locale: 'en', data: fixed as never })
      } catch (e) {
        if (!BENIGN(e)) throw e
      }
    }
  }

  // --- collections: scan title/label-style string fields for the typo rules ---
  for (const slug of ['industry'] as const) {
    const res = await payload.find({ collection: slug as never, locale: 'en', depth: 0, limit: 200, pagination: false })
    for (const d of res.docs as Record<string, unknown>[]) {
      const { id, globalType: _gt, createdAt: _c, updatedAt: _u, ...data } = d
      const before = changes.length
      const fixed = walk(data, '', `${slug}:${(d as { slug?: string }).slug ?? id}`) as Record<string, unknown>
      if (changes.length > before && !DRY) {
        try {
          await payload.update({ collection: slug as never, id: id as never, locale: 'en', data: fixed as never })
        } catch (e) {
          if (!BENIGN(e)) throw e
        }
      }
    }
  }

  // --- contact-page route emails: title-keyed (New business + hero "Email us" stay hello@) ---
  // NOTE: partnerships@/careers@ must be deliverable aliases in Google Workspace.
  const EMAIL_MAP: Record<string, string> = {
    Partnerships: 'partnerships@ternary.solutions',
    Careers: 'careers@ternary.solutions',
  }
  const cp = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'contact' } } as never,
    locale: 'en',
    depth: 0,
    limit: 1,
  })
  const cdoc = cp.docs?.[0] as
    | { id?: unknown; layout?: Record<string, unknown>[]; createdAt?: unknown; updatedAt?: unknown }
    | undefined
  if (cdoc?.layout) {
    let changed = false
    for (const block of cdoc.layout) {
      if (block.blockType === 'contactRoutes' && Array.isArray(block.items)) {
        for (const it of block.items as { title?: string; email?: string }[]) {
          const want = it.title ? EMAIL_MAP[it.title] : undefined
          if (want && it.email !== want) {
            changes.push({
              where: 'pages:contact',
              path: `contactRoutes["${it.title}"].email`,
              before: it.email ?? '',
              after: want,
              note: 'route email',
            })
            it.email = want
            changed = true
          }
        }
      }
    }
    if (changed && !DRY) {
      const { id, createdAt: _c, updatedAt: _u, ...data } = cdoc
      try {
        await payload.update({ collection: 'pages' as never, id: id as never, locale: 'en', data: data as never })
      } catch (e) {
        if (!BENIGN(e)) throw e
      }
    }
  }

  // --- print changes ---
  const byWhere = new Map<string, Change[]>()
  for (const c of changes) byWhere.set(c.where, [...(byWhere.get(c.where) ?? []), c])
  for (const [where, cs] of byWhere) {
    console.log(`\n=== ${where} — ${cs.length} change(s) ===`)
    for (const c of cs)
      console.log(`  • [${c.note}] ${c.path}\n      - ${JSON.stringify(c.before)}\n      + ${JSON.stringify(c.after)}`)
  }
  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'} Total changes: ${changes.length}`)
  await new Promise((r) => setTimeout(r, 500))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('FIX-CMS ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
