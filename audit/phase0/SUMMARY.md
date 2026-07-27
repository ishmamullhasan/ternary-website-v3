# Phase 0 — Audit & Baseline

Branch `redesign/v2` (local). Local sandbox: dev server against Mongo `ternary-local`. Screenshots in
this folder: 14 routes × {desktop 1440, mobile 390}, full-page, reveals triggered (see
`scripts/audit-screenshots.mjs`). Nothing pushed to any remote.

## 1. Implemented design system (recorded in CLAUDE.md)
Exact tokens/fonts/radii captured from `globals.css` `@theme` + `layout.tsx`. Key point:
- **DRIFT:** Geist Mono is **not** loaded (two-font Poppins+Inter system; numbering = Inter
  `tabular-nums`). Legacy blocks still use `font-mono` → system monospace. Standardize.

## 2. Visual audit (per route, desktop reviewed)
- **/capabilities** — ✅ excellent; the reference standard. Full design renders.
- **/solutions** — ✅ consistent (hero, "Four doors in", 01–04 scenes, engagement models, compare
  table, CTA). ⚠️ uses **℠** on Frame/Flow/Orchestra — canonical is **™**.
- **/scales** — ✅ consistent (base-3 scale index, scenes, pull-quote, constant, CTA). Uses ™ (correct).
- **/industries** — ✅ coherent (bold-port, expandable sector index w/ graphic panels). ⚠️ lists **9**
  sectors hardcoded vs **11** in CMS.
- **/ (home)** — ⚠️ **large empty void** below the hero locally (hero card + footer, ~6000px black
  between). Likely incomplete embedded block content in `ternary-local` (prod home renders full).
  Also: local home hero = `heroFeatured` ("From idea to launch…"), not the `AboutComp`
  ("Agentic Engineering…") hero seen on the prod preview — local-vs-prod content difference.
- Detail pages (/capabilities/[slug], /solutions/[slug], /industries/[slug]), /team, /careers,
  /contact, /about, case study, insight — all HTTP 200 and captured. `/about` threw a one-off 500 on
  first desktop compile, then 200 — recheck for a real intermittent error.

## 3. CMS audit
- **Hardcoded/code-owned:** `/capabilities`, `/solutions`, `/industries`, `/scales`,
  `/capability-template`. Everything else is Payload-driven (home, all `[slug]` details, `/team`,
  and `/about`·`/careers`·`/contact` via the `[...slug]` catch-all).
- **Shadowed CMS pages:** CMS `pages` exist for `solutions`/`industries`/`scales`/`about`/`careers`;
  the hub ones are overridden by the hardcoded routes (dead CMS content).
- **Recommendation:** the hubs are design-heavy → acceptable as code-owned for now, BUT per the
  handoff's "copy = CMS", their *copy* (headlines/taglines/proof) should become CMS blocks in Phase 4
  so editors can manage it and it can localize (they're English-only static today).

## 4. Copy vs canonical names
- ✅ Solutions slugs/names match (Product Development · Enterprise Transformation · Engineering
  Augmentation · Managed Systems).
- ✅ Industries: "Technology Platforms" (not Software Platforms), Public Sector included.
- ⚠️ Engagement models: normalize **℠ → ™** (solutions page).
- ⚠️ **Capabilities integration gap:** hub links to **8** disciplines but CMS has only **6** —
  `/capabilities/agentic-architecture` (00) and `/capabilities/devops-automation` (20) will 404.
- ⚠️ **/case-studies** index → 404 sitewide (all hub CTAs link to it); either build it or repoint.

## 5. Reconciliation flags (this clone ≠ handoff's described setup)
- Single remote `origin = ishmamullhasan/ternary-website-v3`. The handoff's two-remote
  `origin`(company) + `personal`(Shadman → `ternary-website-v3-five.vercel.app`) is **not wired**.
  No pushes anywhere without explicit permission.
- Old CLAUDE.md said "Mongo is remote"; handoff says local — followed the handoff (`ternary-local`).

## 6. Prioritized remaining work (proposed — Shadman to set order)
1. **Content/integration gaps (highest):** seed the 2 missing capability docs (00, 20) or delink;
   decide `/case-studies` index; investigate the local home void (seed content).
2. **Copy pass:** ℠→™; reconcile industries 9-vs-11 (hardcoded vs CMS).
3. **Phase 1 (hub polish):** hubs already consistent; verify real header/footer + link integrity,
   mobile review (mobile shots captured, not yet deep-reviewed).
4. **Phase 4 CMS buildout:** block types for hub copy so it's editor-managed + localizable.
5. **Design-system uniformity:** resolve Geist-Mono-vs-tabular-nums; retire shadowed CMS hub pages.

## Artifacts
- Screenshots: `audit/phase0/*.png` · Script: `scripts/audit-screenshots.mjs`
- Design system recorded in `CLAUDE.md` (redesign-v2 section).
