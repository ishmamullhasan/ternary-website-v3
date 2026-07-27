# Copy changelog

CMS/content changes made on the **staging** cluster (`ternary-local` on Atlas). These do NOT touch
production — this file is the handover artifact for replicating approved changes to the production
CMS later.

## ⚠️ PRODUCTION FOLLOW-UPS (replicate to production CMS)
- **Header global → mega-menu panels** — Capabilities / Solutions / Industries need `panel` content
  (columns + items + featured) added, matching the redesigned `MegaMenuOverlay` schema. Production
  still has the old flat `subItems` (empty dropdowns on the new code). Content authored below; seeded
  to staging via `scripts/seed-megamenu.js`. Also: drop the duplicate **"Software Platforms"** industry
  in favour of **"Technology Platforms"** (handoff naming resolution).

---

## Changes

### Header global — mega-menu panels (staging)
`globals.header.menu[Capabilities|Solutions|Industries].panel`
- **Old:** `type: 'mega'` set, but no `panel` (only legacy `subItems`) → dropdowns rendered empty.
- **New:** authored `panel` with `eyebrow`, `heading`, `viewAll`, `featured`, and icon-less `columns`
  of items linking to the real detail routes (`/capabilities/*`, `/solutions/*`, `/industries/*`).
  Copy is count-free (base-3 marks stay on the pages). Seeded via `scripts/seed-megamenu.js`.

### Capability detail pages — "What this means to us" (staging)
`capabilities[8].whatThisMeansToUs` (heading + richText description + items)
- **Old:** empty → detail pages rendered hero-only.
- **New:** authored real per-discipline content for all 8 capabilities (no invented clients/metrics).
  Seeded via `scripts/seed-capability-content.js`. **Production follow-up:** replicate to prod CMS.

### Home industries section — 4 cards (staging)
`pages.home.layout[industriesSection].industries`
- **Old:** 4 refs but one was a deleted/dangling doc → only 3 cards rendered (centered in a 4-col grid).
- **New:** set 4 valid industries (Financial Services & Insurance, Health Care, Technology Platforms,
  Consumer Goods & Services); resolves the Software-vs-Technology Platforms dup. **Prod follow-up.**

### Story titles — tightened for 2-line cards (staging)
`stories[10].title` — compressed each title to ≤51 chars (pure compression, no new claims) so home
hero card titles complete within the 2-line clamp. e.g. "Counterfoil: From a Booking Monolith to an
Event-Driven Platform" → "Counterfoil: A Booking Monolith Goes Event-Driven". Via
`scripts/seed-story-titles.js`. **Prod follow-up.**

### Home solutions section — all 4 solutions (staging)
`pages.home.layout[solutionsSection].items` — had 3 refs, one dangling; now the 4 canonical
solutions in order (Product Development · Enterprise Transformation · Engineering Augmentation ·
Managed Systems). **Prod follow-up.**

### Home section headings — hub voice (staging)
- capabilitiesSection: "Capabilities" → "What we practice"
- industriesSection: "Domain expertise across every industry" → "We build where the stakes are specific"
- scalesSection: "The scales we serve." → "From founding teams to national institutions"
**Prod follow-up.**

### Round-2 fixes (staging) — titles / industries / de-invented capability copy
- `stories[10].title` → shortened again to ≤37 chars (2-line clamp never truncates).
- `pages.home.layout[industriesSection].industries` → 8 industries (two 4-up rows; excludes the
  software-platforms dup and Consumer Goods & Services).
- `capabilities[8].whatThisMeansToUs` → **REWRITTEN to verbatim approved hub copy** (the exact
  /capabilities body sentences + tags). Removes previously authored prose flagged as invented.
Via `scripts/seed-fixes-round2.js`. **Prod follow-up.**

### Capability "Selected work" — fake case studies removed (staging)
`capabilities[*].caseStudies.items` → cleared on all 8. The items were generic invented examples
("2025 · Retail" etc.) present in the production data — not real client work. The section is guarded
and now hides entirely. **Prod follow-up: clear these in prod too; re-populate only with real,
approved case studies.**

### Capability copy v3 — deck-grounded plain-language revision (staging)
All 8 capabilities: heroSection.description, whatThisMeansToUs (heading/description/items with
plain-language excerpts), howWeDoIt ("How we work", 3 steps). Grounded in the company deck
(audit/deck/DECK_COPY.md) + approved hub copy; story arc per page; NO metrics, NO client names.
Via `scripts/seed-copy-v3.js`. **Prod follow-up.**

### Audit copy fixes (staging) — marks, definitions, placeholders, de-counting
Via `scripts/seed-audit-fixes.js` (idempotent). **Prod follow-up: replicate all.**
- `models[frame|flow|orchestra].title.en` → **℠ → ™** ("Frame℠" → "Frame™", etc.; bn already ™).
- `models.orchestra.excerpts.en + content.en` → **REWRITTEN to canonical on-demand-senior-talent
  definition** (deck p18 + approved /solutions wording). The old multi-pod/multi-program copy
  belonged to no engagement model. Stale bn excerpt/content **unset** (fallback serves en).
- `pages.home.layout[processSection].description` — "four foundations" → "the foundations that help
  us deliver" (en + bn de-counted; the list has five items).
- `pages.contact.layout` — placeholder `ctaBlock` ("CTA" / "vfgdvdfvdfvdsfbsdfbbfbdfb" / "123"
  buttons) **removed**; placeholder office phone "+1 (800) 123-4567" cleared (guarded row hides).
- `industries.technology-platforms.excerpts.en` → "Product companies making the jump from one
  system to a real platform." (home industry card had no description).
- `globals.footer.industries` → **software-platforms ref pulled** (dup of Technology Platforms).
- `solutions.enterprise-transformation.excerpts.en` → "Replace what you have outgrown. We modernize
  the systems your business depends on — without stopping the business to do it." (was the
  "Modernize legacy systems and processes." stub; stale bn unset).
- `pages.stories.layout[storiesArchive].description` — "Eight engagements, every one delivered to
  production." → "Every engagement here shipped to production." (en + bn de-counted).
- NOTE `team` "Romjan Ali" has **no position** in the DB — deliberately not invented; the
  component now guards/hides an empty role line (code).
Code-side (same pass): /solutions ℠→™ + proof slot hides when empty; home "N+ Orchestrators"
counter removed; empty team-role guard; industries index "Advanced Manufacturing & Energy" →
"Advanced Manufacturing"; `engagements@ternary.com` → `info@ternary.solutions` (ContactForm block +
form error copy); careers Team-voices lines de-quoted (plain role descriptions, not testimonials).

### Round-3 (staging) — home industries dedupe, excerpt alignment, About heading + story arc
Via `scripts/seed-round3.js` (idempotent). **Prod follow-up: replicate all.**
- `pages.home.layout[industriesSection].industries` → **4 cards** (was 8): Banking & Capital
  Markets · Health Care · Technology Platforms · Advanced Manufacturing. Financial Services &
  Insurance read as a duplicate of Banking & Capital Markets on the home grid — Banking kept.
- `industries[*].excerpts.en` aligned to one plain sentence of similar length (deck-grounded):
  - `banking-capital-markets` → "Digital transformation and secure platforms for financial
    institutions." (deck p07 verbatim; dropped the dense "high-tempo, control-sensitive" tail)
  - `healthcare` → "Digital health platforms that pair intuitive experiences with enterprise-grade
    compliance." (was a 22-word run-on; grounded in the Flex5 case narrative)
  - `public-sector` → "Secure, compliant systems for government and mission-critical operations."
    (was much shorter than every sibling; grounded in deck p09 Government & Defense)
  - technology-platforms / advanced-manufacturing / financial-services-insurance /
    sports-entertainment / hospitality-travel / consumer-goods already fit — untouched.
- `pages.about` hero — **"Built in New York, shipped everywhere." → "An engineering institution,
  built for the long term."** (deck p02 identity phrase + long-term-stewardship voice; shipping
  wordplay dropped). Description reworded to match: now opens "Ternary builds digital systems…"
  so "engineering institution" isn't repeated back-to-back with the heading.
- `pages.about.layout` **reordered into a story arc**: hero → thesis → approach (principles) →
  proof of work → culture → leadership → funding story → closing CTA (funding story moved from
  slot 2 to slot 7). Funding-story link relabeled "Start a conversation" → **"Work with us"**
  (same `/contact` destination) so it no longer duplicates the adjacent CTA block's button.
- Latest `_pages_versions` drafts for **home and about** synced to the new layouts (seed-about-v2
  pattern) so a republish can't resurrect the old order/copy.
- Code (same pass): cache keys bumped — `pages_${path}_${locale}_v2` → `_v3`
  (`[...slug]/page.tsx`) and `pages_home_${locale}_v6` → `_v7` (`[locale]/page.tsx`) so the new
  CMS state surfaces on deploy.
