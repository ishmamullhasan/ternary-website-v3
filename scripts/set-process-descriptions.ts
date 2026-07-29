// Home processSection — fill the five empty step descriptions.
//
// All five `description` fields are empty in the CMS, which is why the section reserved
// space for copy that was not there. The stage now renders a principle plus one short
// supporting line, so these are the sentences that make it work.
//
// THESE ARE DRAFTS, WRITTEN TO BE REPLACED. They restate each title in the site's
// existing register and deliberately claim nothing specific — no numbers, no named
// clients, no certifications, nothing that could be wrong. Anyone at Ternary can say
// more, and should: edit them in the admin, this script does not need to run again.
//
// Writes locale 'en' only — 'bn' is left alone (localization has fallback:true, so an
// unset bn value serves the en string rather than going blank).
//
// DRY by default; set SEED_DRY=0 to apply.
//   pnpm payload run ./scripts/set-process-descriptions.ts             # preview
//   SEED_DRY=0 pnpm payload run ./scripts/set-process-descriptions.ts  # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const payload: Payload = await getPayload({ config })
payload.logger.info(`Home processSection → step descriptions ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// Keyed on the step title so a reorder in the CMS cannot misalign the copy.
const COPY: Record<string, string> = {
  'Centralized engineering capability':
    'One engineering organisation rather than a team per project, so standards, tooling and review are shared across every engagement.',
  'Deliberately built talent':
    'Engineers are hired and developed against a defined bar rather than sourced per contract, and the people who build a system stay with it.',
  'A culture of leadership and performance':
    'Ownership sits with the people doing the work, and performance is judged on what reaches production and keeps running there.',
  'World-class talent infrastructure':
    'The support behind the people — onboarding, mentoring and progression — so senior engineers spend their time on senior work.',
  'Production ownership across the lifecycle':
    'We stay responsible after launch: monitoring, maintenance and the unglamorous work of keeping software current.',
}

const richText = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

// afterChange hooks call revalidateTag(), which throws outside a request context.
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (!/revalidate|static generation store/i.test(m)) throw e
    payload.logger.warn('  (ignored revalidateTag outside request context)')
  }
}

const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  locale: 'en',
  overrideAccess: true,
  depth: 0,
  limit: 1,
})
const home = docs[0]
if (!home) throw new Error('home page not found')

type Layout = { blockType?: string; process?: { title?: string | null; description?: unknown }[] }[]
const layout = (home.layout ?? []) as Layout
const block = layout.find((b) => b.blockType === 'processSection')
if (!block?.process?.length) throw new Error('processSection block or its steps not found')

let filled = 0
let skipped = 0
for (const step of block.process) {
  const title = (step.title ?? '').trim()
  const text = COPY[title]
  if (!text) {
    payload.logger.warn(`  SKIP  "${title}" — no draft for this title`)
    skipped++
    continue
  }
  // Never overwrite copy someone has already written.
  if (step.description) {
    payload.logger.info(`  KEEP  "${title}" — already has a description`)
    skipped++
    continue
  }
  step.description = richText(text)
  payload.logger.info(`  SET   "${title}" → ${text}`)
  filled++
}

if (!DRY && filled > 0) {
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'en',
      overrideAccess: true,
      data: { layout: layout as never },
    }),
  )
  payload.logger.info(`Wrote ${filled} description(s).`)
} else {
  payload.logger.info(`${DRY ? 'DRY RUN' : 'Nothing to write'} — ${filled} would be set, ${skipped} skipped.`)
}
process.exit(0)
