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
