// About page (slug: about) — redesign-v2 copy pass (STAGING cluster).
//
// Story arc: who we are (hero) → how we're built (thesis) → what we stand for /
// the people (culture) → how we operate (The Ternary Way) → proof (real systems)
// → leadership → CTA.
//
// Sources: audit/deck/DECK_COPY.md (primary — "Built in New York, shipped everywhere",
// engineering-institution identity, three core principles, global delivery hub with
// ISO 9001 / ISO 27001 / SOC 2, culture values, Unified Collective, engagement models)
// and existing approved site copy (kept wherever a block's concept has no deck
// grounding, e.g. the funding-story band). Known deck defects (garbled/looped copy,
// duplicated card descriptions, mixed Turfly narrative, placeholder phone) are NOT
// reused. No quantified achievements, no invented facts or clients — the previous
// placeholder "ShipBob" cards and "120+" legacy stats are removed; the companies grid
// now lists only engagements documented in the deck.
//
// Field shapes mirror what is stored per field: localized `{ en, bn }` plain text
// stays plain text; Lexical richText stays Lexical. Approved bn strings are preserved
// where the en meaning is unchanged (missing bn falls back to en by config).
// Relationships (leadership members, team refs) and media refs (backgroundImage,
// ctaBlock image) are untouched.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-about-v2.js

const L = (en) => ({ en })
const oid = () => new ObjectId().toHexString()
const lex = (paras) => ({
  en: {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paras.map((t) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' }],
      })),
    },
  },
})

const page = db.pages.findOne({ slug: 'about' })
if (!page) throw new Error('pages doc with slug "about" not found')

const item = (title, excerpt) => ({ id: oid(), title: L(title), excerpt: L(excerpt) })

for (const block of page.layout) {
  switch (block.blockType) {
    // ------------------------------------------------------------------ who we are
    case 'hero': {
      // Deck p03/p04 — the About narrative's opening identity statement.
      block.heading = L('Built in New York, shipped everywhere.')
      block.description = lex([
        'Ternary is an engineering institution building digital systems for organizations scaling their operations and transforming their infrastructure. Based in New York with delivery operations in Dhaka, we work as technical partners — responsible for the systems we design, deliver, and maintain over time.',
      ])
      break
    }

    // ------------------------------------------- independence band (no deck grounding
    // for the funding concept → approved heading/description kept; only the
    // placeholder CTA ("Test" → "#") is replaced with a real destination.
    case 'aboutFundingStory': {
      if (block.links?.[0]) {
        block.links[0].label = L('Start a conversation')
        block.links[0].url = '/contact'
      }
      break
    }

    // --------------------------------------------------------------- how we're built
    case 'aboutThesis': {
      // Heading ("Our thesis") and description (deck p14: fragmented/legacy →
      // modern, resilient platforms) are approved and deck-grounded — kept as-is.
      block.items = [
        // Featured (wide, photo cell) — ToC sidebar blurb, p02.
        item(
          'An engineering institution',
          'Ternary builds digital systems that perform reliably, scale thoughtfully, and serve organizations through their growth — with long-horizon responsibility for everything we design, deliver, and maintain.',
        ),
        // p20 — distributed teams, centralized quality standards.
        item(
          'Two cities, one standard',
          'Headquartered in New York with our delivery hub in Dhaka, our teams work to one set of centralized quality standards — wherever the work happens.',
        ),
        // p04 — "designed not just to launch, but to perform reliably and evolve thoughtfully".
        item(
          'Built to last, not just to launch',
          'We design systems not just to go live, but to perform reliably and evolve thoughtfully as your organization grows and changes.',
        ),
        // Approved existing copy (formerly titled "Engineering as an institution").
        item(
          'Standards that compound',
          'Durable systems come from durable capability. We concentrate engineering excellence so that standards, knowledge, and delivery capacity accumulate over time instead of resetting with every project.',
        ),
        // Approved existing copy — bn translation preserved verbatim.
        {
          id: oid(),
          title: {
            en: 'Stewardship over hand-off',
            bn: 'হ্যান্ড-অফের চেয়ে তত্ত্বাবধান',
          },
          excerpt: {
            en: "The hardest part of software isn't launching it — it's keeping it reliable as the business changes. We stay accountable across the full lifecycle, not just up to the go-live date.",
            bn: 'সফটওয়্যারের সবচেয়ে কঠিন অংশ এটি লঞ্চ করা নয়—বরং ব্যবসা বদলানোর সাথে সাথে এটিকে নির্ভরযোগ্য রাখা। আমরা শুধু গো-লাইভ তারিখ পর্যন্ত নয়, পুরো লাইফসাইকেল জুড়ে দায়বদ্ধ থাকি।',
          },
        },
        // Wide closing cell — p04 "we operate as technical partners…".
        item(
          'Technical partners, not vendors',
          'We operate as technical partners responsible for the systems we design, deliver, and maintain over time — through launch, growth, and everything after.',
        ),
      ]
      break
    }

    // -------------------------------------------- what we stand for / the people
    case 'aboutBeliefs': {
      // Heading ("Our culture") and description (deck p47 culture intro) kept.
      block.items = [
        // Featured (wide, photo cell) — p47 intro + closing philosophy (p49).
        item(
          'Low noise, high impact',
          'We work with low noise, close proximity to users, and a clear orientation toward impact. Tradeoffs are made explicit, progress stays visible, and accountability lands on outcomes — not activity.',
        ),
        // Hub pillar 03 (p21).
        item(
          'Leadership and performance culture',
          'Our teams work under experienced technical leadership, with clearly defined expectations around accountability, code quality, professional growth, and delivery outcomes.',
        ),
        // Hub pillar 02 (p21) — talent formation by design.
        item(
          'Talent formed by design',
          'We identify high-potential engineers early and develop them deliberately — through rigorous technical training, structured mentorship, and engineering standards set for the long term.',
        ),
        // p45 "Unified Collective" intro.
        item(
          'A unified collective',
          'From cloud-native architecture to revenue operations, we operate as one team with total ownership — engineers, designers, and operators shipping together.',
        ),
        // Wide closing cell — hub pillar 04 + closing line (p21).
        item(
          'Engineered for sustained excellence',
          'We invest in the foundations that keep quality durable — talent acquisition, technical training, delivery governance, and career progression — so the institution grows stronger with every system it ships.',
        ),
      ]
      break
    }

    // ---------------------------------------------------------------- how we operate
    case 'aboutApproach': {
      // Heading ("The Ternary Way") kept; description replaces the misplaced
      // careers copy with the partnership framing (p04/p18). bn description
      // (already a translation of the partnership-model framing) preserved.
      block.description = {
        ...lex([
          'Software built as long-term stewardship: an engineering partnership rooted in technical excellence and sustained accountability, defined by three core principles.',
        ]),
        ...(block.description?.bn !== undefined ? { bn: block.description.bn } : {}),
      }
      block.items = [
        // Featured (tall media cell) — core principle 1 (p04).
        item(
          'Absolute ownership',
          'We take full responsibility for the systems we design and deliver — prioritizing reliability, maintainability, and the long-term consequences of every technical decision.',
        ),
        // Core principle 2 (p04).
        item(
          'Transparent execution',
          'Direct communication and visible progress. Problems are surfaced early, tradeoffs are made explicit, and execution stays focused on measurable outcomes with low noise.',
        ),
        // Core principle 3 (p04).
        item(
          'Proximity to impact',
          'We stay close to the users and real-world workflows our systems serve — building with critical context so the work delivers lasting operational impact.',
        ),
        // p20/p21 — certifications are facts, allowed.
        item(
          'A certified global delivery hub',
          'New York headquarters, Dhaka delivery hub, one unified center of engineering excellence. ISO 9001 and ISO 27001 certified, SOC 2 compliant.',
        ),
        // Wide closing cell — engagement models (p18); Flow uses ™ per canonical naming.
        item(
          'Three ways to engage',
          'Frame™ for fixed-scope projects, Flow™ for continuous delivery, and Orchestra™ for extending your team — three engagement models, one commitment to outcomes.',
        ),
      ]
      break
    }

    // ------------------------------------------------------------------------ proof
    case 'aboutProofOfScale': {
      // Strip legacy fields no longer in the block config (Payload ignores them on
      // read and strips them on save): the removed stats panel carried invented
      // "120+" figures that must not linger in the DB.
      delete block.heading
      delete block.description
      delete block.stats

      // p22 section tagline; grid now lists only deck-documented engagements —
      // no metrics (per rules, Turfly's quantified claims are not reused).
      if (block.company) {
        block.company.heading = {
          en: 'Proof of work in the real world.',
          ...(block.company.heading?.bn !== undefined ? { bn: block.company.heading.bn } : {}),
        }
        block.company.description = {
          ...lex([
            "From AI-powered platforms and connected products to enterprise ERP and secure, air-gapped AI — a selection of the systems we've designed, delivered, and continue to stand behind.",
          ]),
          ...(block.company.description?.bn !== undefined ? { bn: block.company.description.bn } : {}),
        }
        const co = (name, excerpt) => ({ id: oid(), name: L(name), excerpt: L(excerpt) })
        block.company.items = [
          co(
            'Counterfoil Continuum',
            'An AI revenue operating layer for the experience economy — unifying pricing, inventory, and distribution decisions while keeping operators in control.',
          ),
          co(
            'Turfly',
            'A sports-facility booking marketplace for Bangladesh — instant confirmations, integrated payments, and demand-based pricing for players and operators.',
          ),
          co(
            'Alley Analytix',
            'A portable coaching intelligence platform for competitive bowling — purpose-built sensor hardware paired with real-time performance analytics.',
          ),
          co(
            'Flex5',
            'A HIPAA-grade digital health platform for Reality Meets Science — a consumer-grade mobile experience on enterprise-grade compliance foundations.',
          ),
          co(
            'F.A.R Oil & Gas',
            'An Odoo-centered ERP program re-architecting enterprise operations — process controls and consistency codified across critical business functions.',
          ),
          co(
            'DoYouWork',
            'A unified field-service employee platform for Amistee — scheduling, approvals, and asset management consolidated into one mobile-first system.',
          ),
          co(
            'Hissho Sushi',
            'The SushiOps360 application layer for AI-enabled franchise operations — turning analytics into governed, mobile-first daily workflows across the network.',
          ),
          co(
            'LankaBangla Securities',
            'A governed application layer over an air-gapped, open-source LLM for capital markets — secure AI for brokerage productivity and retail engagement.',
          ),
        ]
      }
      break
    }

    // ------------------------------------------------------------------- leadership
    case 'aboutLeadership': {
      // Members (relationships) untouched. Description aligned to the deck's
      // "Unified Collective" intro (p45); bn preserved. Note: the component
      // currently renders the /team roster with its own hardcoded intro, so this
      // is a CMS-correctness update.
      block.description = {
        ...lex([
          'From cloud-native architecture to revenue operations, our team operates with total ownership — shipping the technical and commercial infrastructure that powers the modern enterprise.',
        ]),
        ...(block.description?.bn !== undefined ? { bn: block.description.bn } : {}),
      }
      break
    }

    // ctaBlock — already approved, deck-grounded ("Construct the future" philosophy,
    // p49). Untouched.
    default:
      break
  }
}

const now = new Date()
db.pages.updateOne({ _id: page._id }, { $set: { layout: page.layout, updatedAt: now } })
print('pages.about → layout updated')

// Pages are draft-enabled (versions + autosave). Sync the latest version doc so the
// admin's draft view matches and a republish doesn't resurrect the old copy.
const versions = db.getCollection('_pages_versions')
const latest = versions.find({ parent: page._id }).sort({ updatedAt: -1 }).limit(1).toArray()[0]
if (latest) {
  versions.updateOne(
    { _id: latest._id },
    { $set: { 'version.layout': page.layout, 'version.updatedAt': now, updatedAt: now } },
  )
  print('_pages_versions latest (' + latest._id + ') → layout synced')
} else {
  print('no _pages_versions doc found for about — skipped version sync')
}
print('DONE')
