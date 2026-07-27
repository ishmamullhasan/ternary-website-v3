# Ternary redesign — consolidated plan (redesign/v2)

Status: **APPROVED — executing.** Work proceeds step by step; pause for Shadman's review after each.
All work local; **never push to any remote without asking Shadman first** (standing rule).

## Approved decisions (from review)
1. **/case-studies index:** build it (editorial index).
2. **Geist Mono:** adopt site-wide for labels/numbering (part of the uniformity pass).
3. **Home hero:** lead with `heroFeatured` — but confirm it renders well locally before committing to it.
4. **Detail-page proof:** leave as marked blank slots for now; fill from real case studies in a
   dedicated later pass.
5. **Personal remote:** wire it up for preview deploys (need the GitHub URL from Shadman). Never push
   without asking.
- **Card lines:** home hero cards target **2 lines** (not 1); the "matching line-count per group" rule
  still holds elsewhere.
- **Sequencing:** begin with **Step 1 (uniformity + spacing)** and pause for review. Detail-pages
  position (step 2 vs step 4) — _to confirm_ (both left bracketed in the approval).

## Locked decisions (from planning)
- **Numbers:** keep the base-3 `00–21` marks as an abstract visual device, but **reword any copy that
  states a count** (e.g. "Eight disciplines. One standard." → a count-free line). No spelled-out
  counts in prose/titles anywhere.
- **Copy:** I draft per page (structure + wording), **you approve**. Never invent clients, metrics, or
  claims — every factual slot is left as a marked blank (an empty proof slot beats a vague one). All
  copy changes logged in `COPY_CHANGELOG.md`.
- **Output:** this single doc; execute page by page after approval.
- **Homepage:** keep current layout + mega-menu; **add sections, fix alignment, rewrite copy into a
  narrative, add a concluding segment at the bottom.**

## Global standards (apply to every page — the "uniformity" pass)
1. **Gutters / no full-bleed:** every section's content sits in `mx-auto w-full max-w-[1480px] px-5`
   (20px gutter, 1480px cap). Full-width backgrounds/borders are fine; **content is never edge-to-edge.**
   - _Correction:_ `/industries` is NOT full-bleed — its `.hub .wrap` already caps at 1480px / 20px
     (`hub.css:62`). Earlier "offender" call was a false read from grepping Tailwind classes on a
     CSS-driven page. The real edge-to-edge segment(s) still need pinpointing — get a concrete example
     from Shadman or hunt via the screenshots (candidates: specific CMS blocks / detail-page sections).
   - Verify inner gutters on every `border-t` framing section in Solutions/Scales.
2. **Vertical rhythm:** consistent section padding (`py-24 lg:py-32` hub standard); no accidental voids.
3. **Card-text uniformity:** within any card/list group on a page, items get **matching line counts**;
   **titles target one line**. Enforce with tightened copy + `line-clamp`/`min-h` where needed.
   - Known case: home hero's 8 work-stream cards — titles wrap unevenly (2–3 lines); normalize to a
     consistent **2 lines** (clamp to 2 + `min-h` so every card's title block is equal height).
4. **Copy rule:** no stated counts; confident plain-spoken voice; canonical names enforced.
5. **Remove dev leftovers:** the footer **"DESIGN PREVIEWS" strip** and any `-hub`/`/hub/*.html`
   preview links; the `/capability-template` preview route.
6. **Motion/a11y:** one shared reveal (fade + rise, once, reduced-motion safe); one `<h1>` per page;
   real gutters; keep the global focus ring.

## Per-page plan

### Hubs (code-owned, redesigned)
- **/capabilities** — ✅ reference standard. Changes: reword "Eight disciplines. One standard." (count),
  keep `00–21`. Fix the **8-vs-6 CMS gap** (see details below). Otherwise the spacing template to copy.
- **/solutions** — ✅ consistent. Fix: **℠ → ™** on Frame/Flow/Orchestra; verify border-t section gutters;
  reword any counts ("Four doors in", "Four columns. Six honest answers." → count-free).
- **/scales** — ✅ consistent (™ already correct). Reword counts; verify gutters.
- **/industries** — ⚠️ **convert `industriesHub.css` → standard Tailwind container** (padding/gutter fix);
  reconcile **9 hardcoded sectors vs 11 in CMS**; reword counts ("NINE"); align to the other hubs' rhythm.

### Detail pages (CMS-driven — largely STUBS, biggest build)
- **/capabilities/[slug]** — currently hero + gradient only, then footer. **Build the full template:**
  hero → what it is → how we do it → proof (real case studies, slots blank until provided) → related →
  CTA, each with its meaningful line-graphic. **Also seed the 2 missing docs** (`agentic-architecture` 00,
  `devops-automation` 20) so the hub's links resolve (currently 404).
- **/solutions/[slug]** — same treatment, solution template: problem → approach → method → deliverables →
  proof → related → CTA. Confirm current completeness at phase start.
- **/industries/[slug]** — sector detail template; confirm current state at phase start.

### Homepage ( / , CMS blocks)
- Keep structure + mega-menu. **Fix alignment/spacing** across blocks; **normalize the 8 hero cards to
  1-line titles**; investigate the **large mid-page void** (likely incomplete `ternary-local` block
  content — seed it). **Rewrite copy into a narrative arc** and **add a concluding CTA/summary segment**
  at the bottom. (Home currently shows the `heroFeatured` hero locally vs `AboutComp` on prod — reconcile
  which hero leads.)

### Content pages (CMS)
- **/about** — editorial magazine layout; logos-with-impact over raw metrics; Linear-style team treatment.
  (One-off 500 seen on first compile — recheck.) Review + redesign.
- **/careers** — culture story → roles. Review + redesign.
- **/contact** — review; align spacing; confirm form works.
- **/team** — Linear-style roster treatment. Review + redesign.
- **/case-studies (index)** — ⚠️ **404 today** but linked from every hub CTA. Decide: build an editorial
  index, or repoint CTAs. **/case-studies/[slug]** (stories) — editorial article format; review.
- **/insights**, **/insights/[slug]** — review; article format consistency.
- **/press-release/[slug]**, **/legals/[slug]**, **/search**, **/job/[slug]**(+/apply) — lower priority;
  spacing/uniformity + copy pass only unless flagged.

## Design-system uniformity (from Phase 0)
- **Geist Mono not implemented** — decide: adopt Geist Mono for labels/numbering, or standardize on Inter
  `tabular-nums` and remove legacy `font-mono` (system monospace) usages. Pick one, apply site-wide.
- Retire the shadowed CMS `pages` for the hubs (dead content) or document why kept.

## Proposed sequencing (Shadman to confirm/reorder)
1. **Uniformity + spacing pass** (global standards 1–5) across all existing pages — fastest visible win.
2. **Copy pass** — de-number + canonical names + ℠→™, per-page drafts for approval (logged in COPY_CHANGELOG).
3. **Homepage** — narrative rewrite, card alignment, concluding segment, void fix.
4. **Detail pages** — capabilities (incl. seeding 00/20), then solutions, then industries.
5. **Content pages** — About, Careers, Team, Case studies (+index decision), Contact, Insights.
6. **CMS buildout** (Phase 4) — block types for hub/detail copy so it's editor-managed + localizable.
7. **Site-wide QA** — spacing/rhythm, motion, links (kill `/hub/*` + preview leftovers), copy vs canonical.

## Open questions for Shadman
- **/case-studies index:** build it, or repoint the hub CTAs elsewhere?
- **Geist Mono:** adopt it, or standardize on Inter tabular-nums?
- **Home hero:** which leads — `heroFeatured` or `AboutComp`?
- **Detail-page proof:** will you supply real case-study/metric content, or leave slots blank for now?
- **Remotes:** the handoff's `personal` remote (→ `…-five.vercel.app`) isn't wired here — set it up when
  you want a preview deploy? (No push without your say-so.)
