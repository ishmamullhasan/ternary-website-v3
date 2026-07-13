// Backfill the four SolutionFeature aside panels (the large gradient illustrations) with the values
// that used to be hardcoded in src/blocks/SolutionFeature/Component.tsx, in both locales.
//
// The panel is chosen by the block's `widget` discriminator, so each block gets exactly one of the
// four panel groups filled:
//   trajectory → panelStat        (rings + big stat)
//   none       → panelMigration   (legacy → dual-run → modern, MTTR bars)
//   techStack  → panelCommits     (commit feed + velocity footer)
//   incident   → panelReliability (uptime console)
// `outcomes` (the frosted footer) is filled on every widget except `none`, which has no footer.
//
// Locale handling — the important bit. The panel arrays (legacy/modern items, commits, dips,
// metrics) are NOT localized arrays; they are plain arrays whose *subfields* are localized. Row ids
// are therefore shared across locales. So: write `en` first and let Payload mint the ids, read them
// back, then write `bn` reusing those exact ids. Writing bn with id-less rows would append a second
// set of rows instead of translating the first.
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/seed-solution-panels.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/seed-solution-panels.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

type Locale = 'en' | 'bn'
type Panel = Record<string, unknown>

// --- Content, per widget, per locale -------------------------------------------------------------

const OUTCOMES: Record<Locale, Panel> = {
  en: {
    label: 'Outcomes',
    text: 'Production-ready systems, full test coverage, CI/CD pipelines, and zero technical debt at launch.',
  },
  bn: {
    label: 'ফলাফল',
    text: 'প্রোডাকশন-রেডি সিস্টেম, পূর্ণ টেস্ট কভারেজ, CI/CD পাইপলাইন, এবং লঞ্চেই শূন্য টেকনিক্যাল ডেট।',
  },
}

const PANELS: Record<
  string,
  {
    field: string
    content: Record<Locale, Panel>
    /** Other top-level block fields this panel renders, e.g. the shared `stat` group. */
    extra?: Record<string, Record<Locale, Panel>>
  }
> = {
  trajectory: {
    field: 'panelStat',
    content: {
      en: { label: 'Architecture · Zero-to-One', liveLabel: 'Live' },
      bn: { label: 'আর্কিটেকচার · জিরো-টু-ওয়ান', liveLabel: 'লাইভ' },
    },
    // The big figure lives in the block-level `stat` group (it predates the panel groups). It was
    // never filled, so the panel was rendering the component's English default in both locales —
    // a Bengali reader saw "Scale handled seamlessly". Seed it so bn is genuinely translated.
    extra: {
      stat: {
        en: { value: '10x', caption: 'Scale handled seamlessly' },
        bn: { value: '১০x', caption: 'নির্বিঘ্নে সামলানো স্কেল' },
      },
    },
  },

  none: {
    field: 'panelMigration',
    content: {
      en: {
        label: 'Migration Plan · Reversible at every step',
        connector: 'Dual-run',
        legacy: {
          title: 'Legacy',
          items: [{ label: 'Monolith' }, { label: 'Batch jobs' }, { label: 'Manual deploys' }],
        },
        modern: {
          title: 'Modern',
          items: [{ label: 'Event-driven' }, { label: 'Streaming' }, { label: 'Continuous deploy' }],
        },
        metric: {
          label: 'Incident MTTR',
          delta: '−60%',
          beforeLabel: 'Before',
          before: '42 min',
          afterLabel: 'After',
          after: '17 min',
          afterPct: 40,
        },
      },
      bn: {
        label: 'মাইগ্রেশন পরিকল্পনা · প্রতিটি ধাপে প্রত্যাবর্তনযোগ্য',
        connector: 'ডুয়াল-রান',
        legacy: {
          title: 'লিগ্যাসি',
          items: [{ label: 'মনোলিথ' }, { label: 'ব্যাচ জব' }, { label: 'ম্যানুয়াল ডিপ্লয়' }],
        },
        modern: {
          title: 'আধুনিক',
          items: [{ label: 'ইভেন্ট-ড্রিভেন' }, { label: 'স্ট্রিমিং' }, { label: 'কন্টিনিউয়াস ডিপ্লয়' }],
        },
        metric: {
          label: 'ইনসিডেন্ট MTTR',
          delta: '−৬০%',
          beforeLabel: 'আগে',
          before: '৪২ মিনিট',
          afterLabel: 'পরে',
          after: '১৭ মিনিট',
          afterPct: 40,
        },
      },
    },
  },

  techStack: {
    field: 'panelCommits',
    content: {
      // Commit messages, authors and diff counts are literal git data — identical in both locales.
      en: {
        label: 'client-repo / main',
        commits: [
          { message: 'feat: orchestrator retry policy', author: 'ternary/mk', added: '+412', removed: '−38' },
          { message: 'refactor: typed event bus', author: 'ternary/as', added: '+209', removed: '−154' },
          { message: 'perf: streaming response chunks', author: 'ternary/jl', added: '+87', removed: '−12' },
          { message: 'fix: rate-limit edge case', author: 'ternary/rp', added: '+34', removed: '−9' },
          { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+156', removed: '−201' },
          { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+156', removed: '−201' },
        ],
        footer: { label: 'Sprint 24 · This week', value: '40%', caption: 'Increase in sprint velocity' },
      },
      bn: {
        label: 'client-repo / main',
        commits: [
          { message: 'feat: orchestrator retry policy', author: 'ternary/mk', added: '+৪১২', removed: '−৩৮' },
          { message: 'refactor: typed event bus', author: 'ternary/as', added: '+২০৯', removed: '−১৫৪' },
          { message: 'perf: streaming response chunks', author: 'ternary/jl', added: '+৮৭', removed: '−১২' },
          { message: 'fix: rate-limit edge case', author: 'ternary/rp', added: '+৩৪', removed: '−৯' },
          { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+১৫৬', removed: '−২০১' },
          { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+১৫৬', removed: '−২০১' },
        ],
        footer: { label: 'স্প্রিন্ট ২৪ · এই সপ্তাহ', value: '৪০%', caption: 'স্প্রিন্ট ভেলোসিটি বৃদ্ধি' },
      },
    },
  },

  incident: {
    field: 'panelReliability',
    content: {
      en: {
        label: 'Reliability Console',
        statusLabel: 'All systems nominal',
        uptime: { value: '99.99%', caption: 'Sustained service availability' },
        chart: {
          barCount: 56,
          dips: [{ position: 15 }, { position: 40 }],
          startLabel: '60d ago',
          endLabel: 'today',
        },
        metrics: [
          { label: 'API p99', value: '182ms' },
          { label: 'Error rate', value: '0.02%' },
          { label: 'Queue lag', value: '94ms' },
        ],
      },
      bn: {
        label: 'রিলায়েবিলিটি কনসোল',
        statusLabel: 'সব সিস্টেম স্বাভাবিক',
        uptime: { value: '৯৯.৯৯%', caption: 'নিরবচ্ছিন্ন সার্ভিস উপলব্ধতা' },
        chart: {
          barCount: 56,
          dips: [{ position: 15 }, { position: 40 }],
          startLabel: '৬০ দিন আগে',
          endLabel: 'আজ',
        },
        metrics: [
          { label: 'API p99', value: '১৮২ms' },
          { label: 'ত্রুটির হার', value: '০.০২%' },
          { label: 'কিউ ল্যাগ', value: '৯৪ms' },
        ],
      },
    },
  },
}

// --- Helpers -------------------------------------------------------------------------------------

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed SolutionFeature aside panels ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; the DB write
// commits first, so swallow only that specific error (same handling as seed-content.ts).
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

/** Deep-merge `content` onto a block, carrying over any `id` already present at the same path. */
function withIds(content: unknown, existing: unknown): unknown {
  if (Array.isArray(content)) {
    const prev = Array.isArray(existing) ? existing : []
    // Row ids are positional: the bn pass re-sends the same rows the en pass minted.
    return content.map((row, i) => {
      const merged = withIds(row, prev[i]) as Record<string, unknown>
      const id = (prev[i] as Record<string, unknown> | undefined)?.id
      return id ? { ...merged, id } : merged
    })
  }
  if (content && typeof content === 'object') {
    const prev = (existing ?? {}) as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
      out[k] = withIds(v, prev[k])
    }
    return out
  }
  return content
}

/** Apply the panel + outcomes content for one locale onto every solutionFeature block in a layout. */
function fillLayout(
  layout: Record<string, unknown>[],
  locale: Locale,
): { layout: Record<string, unknown>[]; hits: string[] } {
  const hits: string[] = []
  const next = layout.map((b) => {
    if (b.blockType !== 'solutionFeature') return b
    const widget = (b.widget as string) ?? 'none'
    const spec = PANELS[widget]
    if (!spec) return b
    hits.push(widget)

    const out: Record<string, unknown> = {
      ...b,
      [spec.field]: withIds(spec.content[locale], b[spec.field]),
    }
    for (const [field, content] of Object.entries(spec.extra ?? {})) {
      out[field] = withIds(content[locale], b[field])
    }
    // The migration panel renders no Outcomes footer.
    if (widget !== 'none') out.outcomes = withIds(OUTCOMES[locale], b.outcomes)
    return out
  })
  return { layout: next, hits }
}

const readPage = async (id: string, locale: Locale): Promise<Record<string, unknown>> =>
  (await payload.findByID({
    collection: 'pages',
    id,
    depth: 0,
    locale,
    fallbackLocale: false, // never materialise the en fallback into bn
    draft: false,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>

const writePage = async (id: string, title: string, layout: unknown, locale: Locale): Promise<void> =>
  ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id,
      locale,
      // Pages.title is required + localized; omitting it fails re-validation on a per-locale write.
      data: { title, layout, _status: 'published' } as never,
      context: { disableRevalidate: true },
    }),
  )

// --- Run -----------------------------------------------------------------------------------------

const rawDocs = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'solutionFeature' })
  .toArray()

payload.logger.info(`  found ${rawDocs.length} page(s) with a solutionFeature block`)

for (const raw of rawDocs) {
  const id = String(raw._id)

  const en = await readPage(id, 'en')
  const slug = (en.slug as string) ?? id
  const enLayout = (en.layout ?? []) as Record<string, unknown>[]

  const filledEn = fillLayout(enLayout, 'en')
  if (filledEn.hits.length === 0) {
    payload.logger.info(`  page ${slug}: no solutionFeature blocks matched — skipped`)
    continue
  }
  payload.logger.info(`  page ${slug}: ${filledEn.hits.length} panel(s) → ${filledEn.hits.join(', ')}`)
  if (DRY) continue

  // 1 — en. Payload mints the array row ids here.
  await writePage(id, (en.title as string) || slug, filledEn.layout, 'en')

  // 2 — bn. Re-read the *bn* doc: the array rows now exist (rows are shared across locales, only
  // their subfields are localized), so it already carries the ids minted above. Basing the bn write
  // on the bn doc — not the en one — is what keeps the existing Bengali heading/description/detail
  // translations intact; building it from the en layout would overwrite them with English.
  const bn = await readPage(id, 'bn')
  const bnLayout = fillLayout((bn.layout ?? []) as Record<string, unknown>[], 'bn').layout
  await writePage(id, (bn.title as string) || (en.title as string) || slug, bnLayout, 'bn')

  payload.logger.info(`  page ${slug}: seeded en + bn, published`)
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Panel seed complete.')
process.exit(0)
