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
