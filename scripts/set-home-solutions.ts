// Home solutionsSection — pick all FOUR solutions, in lane order, and refresh the section copy.
//
// The block was picking three ids, one of which (6a32eee619ce00b7d5be8572) is a DANGLING reference
// to a solution that no longer exists — that is the blank card on the live homepage. The animated
// frame draws one lane per picked solution, so the fourth gesture (Managed — the sweep that never
// resolves) never rendered.
//
// Order matters: it is the left-to-right lane order in the frame.
//   01 Product Development  → a point becomes a product
//   02 Enterprise Transformation → mass crossing, nothing dropped
//   03 Engineering Augmentation → the team, plus one
//   04 Managed Systems → it never resolves; it watches
//
// Writes locale 'en' only — 'bn' is left alone (localization has fallback:true, so an unset bn
// value serves the en string rather than going blank).
//
// DRY by default; set SEED_DRY=0 to apply.
//   pnpm payload run ./scripts/set-home-solutions.ts             # preview
//   SEED_DRY=0 pnpm payload run ./scripts/set-home-solutions.ts  # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const payload: Payload = await getPayload({ config })
payload.logger.info(`Home solutionsSection → 4 lanes ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; swallow only that.
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const lexical = (text: string): unknown => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
      },
    ],
  },
})

// Lane order + the card body copy for each. Keyed by slug so a title edit can't silently reorder.
const LANES: { slug: string; excerpts: string }[] = [
  {
    slug: 'product-development',
    excerpts:
      'End-to-end product engineering from conception to scale. We design, build, and launch digital products that users love and businesses depend on.',
  },
  {
    slug: 'enterprise-transformation',
    excerpts:
      'The systems your organization has outgrown, rebuilt for what comes next — without stopping the business that runs on them.',
  },
  {
    slug: 'engineering-augmentation',
    excerpts:
      'Extending your team with specialized talent. Experienced engineers who integrate seamlessly into your workflows and culture.',
  },
  {
    slug: 'managed-systems',
    excerpts:
      'We stay after launch. Continuous monitoring, maintenance, and improvement so what we built keeps earning its place.',
  },
]

const DESCRIPTION =
  'Four ways to engage us, one standard of ownership. We design and build new products, transform the systems organizations have outgrown, extend established teams with senior engineering talent, and stay on to run what we ship.'

const sols = await payload.find({ collection: 'solution', limit: 100, depth: 0, locale: 'en', overrideAccess: true })
const bySlug = new Map(sols.docs.map((d) => [String((d as Record<string, unknown>).slug), d as Record<string, unknown>]))

const ordered: string[] = []
for (const lane of LANES) {
  const doc = bySlug.get(lane.slug)
  if (!doc) {
    payload.logger.error(`  MISSING solution slug "${lane.slug}" — aborting so the block isn't left short.`)
    process.exit(1)
  }
  ordered.push(String(doc.id))

  const current = String(doc.excerpts ?? '')
  if (current.trim() === lane.excerpts) {
    payload.logger.info(`  = ${lane.slug}: excerpt already current`)
  } else {
    payload.logger.info(`  → ${lane.slug}: excerpt "${current.slice(0, 48)}…" ⇒ "${lane.excerpts.slice(0, 48)}…"`)
    if (!DRY) {
      await ignoreRevalidate(() =>
        payload.update({
          collection: 'solution',
          id: String(doc.id),
          locale: 'en',
          data: { excerpts: lane.excerpts },
          overrideAccess: true,
          context: { disableRevalidate: true },
        }),
      )
    }
  }
}

const pages = await payload.find({ collection: 'pages', limit: 50, depth: 0, locale: 'en', overrideAccess: true })
const home = pages.docs.find((p) => String((p as Record<string, unknown>).slug) === 'home')
if (!home) {
  payload.logger.error('No "home" page found.')
  process.exit(1)
}

const h = home as Record<string, unknown>
const layout = (h.layout ?? []) as Record<string, unknown>[]
let touched = 0
const nextLayout = layout.map((b) => {
  if (String(b.blockType) !== 'solutionsSection') return b
  touched++
  const before = JSON.stringify(b.items)
  payload.logger.info(`  → home solutionsSection.items ${before} ⇒ ${JSON.stringify(ordered)}`)
  payload.logger.info(`  → home solutionsSection.description ⇒ "${DESCRIPTION.slice(0, 60)}…"`)
  return { ...b, items: ordered, description: lexical(DESCRIPTION) }
})

if (touched === 0) {
  payload.logger.error('No solutionsSection block on the home page.')
  process.exit(1)
}

if (!DRY) {
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id: String(h.id),
      locale: 'en',
      data: { layout: nextLayout },
      overrideAccess: true,
      context: { disableRevalidate: true },
    }),
  )
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Done.')
process.exit(0)
