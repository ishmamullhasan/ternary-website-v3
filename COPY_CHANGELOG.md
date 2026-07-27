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
