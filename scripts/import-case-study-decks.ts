/**
 * Import the six client-deck write-ups (Frame 427322179–184) into the `story` collection, with the
 * mockup that ships with each deck.
 *
 * Run:  npx cross-env NODE_OPTIONS=--no-deprecation tsx scripts/import-case-study-decks.ts
 *       add --dry to print what would change and write nothing.
 *
 * Goes through Payload's local API rather than raw mongo, so the media upload gets its S3 object,
 * sizes and mimeType, and the story update gets a proper published version snapshot. Writing the
 * documents directly would leave `gallery` pointing at media rows with no file behind them.
 *
 * WRITES ENGLISH ONLY. The decks are English. Payload runs `fallback: true`, so `bn` serves these
 * strings rather than an empty page — a Bengali reader gets English until someone translates them.
 * That is a deliberate, visible gap, not an oversight.
 *
 * Idempotent: re-running replaces the same six write-ups and reuses the media doc it created last
 * time (matched on filename) instead of stacking duplicates in the media library.
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload, type BasePayload } from 'payload'

import { CASE_STUDY_DECKS, type DeckSection } from './content/case-study-decks'

const IMAGE_DIR =
  process.env.DECK_IMAGE_DIR ??
  'C:/Users/User/AppData/Local/Temp/claude/f--GitHub-ternary-website-v3/59345a5d-e5b0-44a9-816b-807585ca3723/scratchpad/cs'

const DRY: boolean = process.argv.includes('--dry') || process.env.DECK_DRY === '1'

// Lexical node shapes, matching what the editor already stores in these documents exactly — same
// keys, same order, same `version: 1`. A hand-rolled node missing `format`/`indent`/`direction`
// loads but re-serialises differently the first time an author touches it.
const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

const heading = (value: string) => ({
  type: 'heading',
  tag: 'h3',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [text(value)],
})

const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [text(value)],
})

const richText = (sections: DeckSection[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: sections.flatMap((s) => [heading(s.heading), paragraph(s.body)]),
  },
})

/**
 * The import itself, taking an injected Payload instance so it can be driven either from the CLI
 * below or from a route handler inside a running dev server.
 *
 * The CLI path needs `payload run`, and on this machine that never finishes loading the config —
 * it stalls before the config module resolves, silently, with a clean exit. Running the same
 * function inside Next, where Payload demonstrably boots, is the reliable path; hence the split.
 */
export const importDecks = async (payload: BasePayload, dry = DRY): Promise<string[]> => {
  const log: string[] = []
  const say = (line: string): void => {
    console.log(line)
    log.push(line)
  }
  let changed = 0

  for (const deck of CASE_STUDY_DECKS) {
    const found = await payload.find({
      collection: 'story',
      where: { slug: { equals: deck.slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })
    const story = found.docs[0]
    if (!story) {
      say(`SKIP  ${deck.slug} — no story with that slug`)
      continue
    }

    // ── the mockup ────────────────────────────────────────────────────────────────────────────
    const file = path.join(IMAGE_DIR, deck.image)
    if (!fs.existsSync(file)) {
      say(`SKIP  ${deck.slug} — image not found: ${file}`)
      continue
    }
    const filename = `case-${deck.slug}-mockup.jpg`

    let mediaId: string | number | undefined
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    if (existingMedia.docs[0]) {
      mediaId = existingMedia.docs[0].id
      if (!dry) {
        // Refresh the alt in case the wording here changed; the file itself is already uploaded.
        await payload.update({ collection: 'media', id: mediaId, locale: 'en', data: { alt: deck.alt } })
      }
    } else if (!dry) {
      const created = await payload.create({
        collection: 'media',
        locale: 'en',
        data: { alt: deck.alt },
        file: {
          data: fs.readFileSync(file),
          name: filename,
          mimetype: 'image/jpeg',
          size: fs.statSync(file).size,
        },
      })
      mediaId = created.id
    }

    // ── the write-up ──────────────────────────────────────────────────────────────────────────
    // `gallery` rows are replaced, not appended: re-running must not grow the showcase. Any row
    // pointing at a DIFFERENT media doc is kept, so a hand-added visual survives the import.
    const keptRows = ((story.gallery ?? []) as { media?: unknown; caption?: string }[]).filter((row) => {
      const id = typeof row.media === 'object' && row.media ? (row.media as { id?: unknown }).id : row.media
      return id != null && String(id) !== String(mediaId)
    })

    const data: Record<string, unknown> = { content: richText(deck.sections) }
    if (mediaId) data.gallery = [{ media: mediaId, caption: deck.caption }, ...keptRows]

    say(
      `${dry ? 'DRY  ' : 'WRITE'} ${deck.slug.padEnd(22)} ${deck.sections.length} sections, ` +
        `image ${existingMedia.docs[0] ? 'reused' : 'uploaded'}${deck.withheld ? `  [withheld: ${deck.withheld}]` : ''}`,
    )

    if (!dry) {
      await payload.update({ collection: 'story', id: story.id, locale: 'en', data })
      changed += 1
    }
  }

  say(dry ? 'Dry run — nothing written.' : `${changed} case studies updated.`)
  return log
}

/** CLI entry, gated so importing this module never runs the import as a side effect. */
const run = async (): Promise<void> => {
  const payload = await getPayload({ config })
  await importDecks(payload)
  process.exit(0)
}

if (process.env.DECK_CLI === '1') void run()
