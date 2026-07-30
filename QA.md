# TERNARY WEBSITE — FIX PLAN: PROGRESS + QA REPORT

Autonomous run against `ternary-master-fix-plan.md`. All work is on the **yh16 fork**
(`sajid209-stack/main`); production `ternary.solutions` untouched.

## ⛔ Blocker for live verification (read first)
Partway through, Vercel refused new deploys: **"Resource is limited — try again in 24 hours (more
than 100 deployments, free-per-day)."** yh16 is on the **Vercel free plan** and today's 100-deploy
cap is exhausted (my pushes + collaborators'). Consequences:
- Every change is **committed to the repo and written to the Atlas DB** (durable), but the later
  stages (5, 6, 9) **will not render on yh16 until the quota resets (~24h) or the plan is upgraded.**
- The live home page currently shows a **pre-Stage-5 build** (SSG prebuild predates the hero) — this
  is the stale deploy, not a code bug.
- So **live/Playwright visual acceptance could not be run.** Verification below is via **direct Atlas
  DB read-back**, **`tsc --noEmit`**, and code inspection — all green — not live screenshots.

## Verification method used
- ✅ DB persistence confirmed by reading each write back from Atlas (`scripts/audit-*-inspect.ts`).
- ✅ `npx tsc --noEmit` clean after every stage.
- ✅ `pnpm test:int` guard (Stage 2) passing.
- ❌ Live screenshots / crawl — **blocked by the deploy cap** (retry after reset).

---

## Stage status

| Stage | Status | Notes |
|------|--------|-------|
| **0 — Audit** | ✅ Done | `AUDIT.md`. Key result: the plan predates many already-shipped fixes. |
| **1 — Routing/links/SEO** | ✅ Done | Taxonomy redirect (software-platforms→technology-platforms); footer `#` socials removed; footer capabilities 6→**8** (hub order); 5 named meta descriptions (home/about/contact/careers in CMS, work in code). `revalidateTagSafe()` added so global seeds persist. |
| **2 — One header/footer** | ✅ Done (already unified) | Only the root layout mounts chrome; added an int-test **guard**. 64px-bar redesign **FLAGGED, not applied** (design change, not a bug). |
| **3 — Design tokens** | ◑ Partial | Flex5→**Turfly** proof (scales + SectorIndex); shared `models.ts` constant. **FLAGGED (conflict w/ redesign):** two-font collapse, base-3 restoration. **DEFERRED (large mechanical):** `--section-y` spacing migration, 200+ `text-[Npx]` cleanup. |
| **4 — Page anatomy/mobile** | ◔ Deferred | Primitives (`PageHero/Section/…`) consolidation is a large, design-risky refactor — **flagged**. Concrete mobile-hero fix done for /work (Stage 9). vh discipline already largely holds (audit §6). |
| **5 — Homepage** | ✅ Done (DB) | Home layout was **missing its hero block** → no h1. Added `heroFeatured` (headline "Agentic Engineering. / Human Orchestration." = one h1, two lines) + thesis + two hero CTAs (contact / work). Filled the **5 empty "How we operate" bodies**. Engagement models reordered **Frame, Flow, Orchestra**. *Renders once the deploy cap clears.* |
| **6 — Content integrity** | ◑ Partial | **Deleted 3 Test fixtures** (Test Press Release, Test Insight, Test Model). Banking subtitle → distinct line. **Remaining:** Contact (Dhaka office / fold Partnerships / remove Book-a-call / dead #message anchor), team render guards (strip level suffixes / skip incomplete), hide zero-count filters, About dup card (→ Stage 7). |
| **7 — About restructure + team** | ☐ Not started | Large content+block build (8-section reorder, principles-of-4 merge, contrast section, team directory). Verbatim structure in the plan. **Recommend a focused session** (reference-first, like the hubs). |
| **8 — Solution detail copy** | ☐ Not started | Large: model the 7-section template as blocks + populate 4 solutions with the plan's **verbatim** copy. **Recommend a focused session** — it's a schema + content build worth reviewing the pattern on one solution first. |
| **9 — Work + stories migration** | ◑ Partial | `/work` mobile hero **top-anchored** (≤768px); `/stories`→`/work` hub 308 added. **Remaining:** sweep any lingering "Stories" nav label + "See our work" CTA targets. |
| **10 — QA** | ◑ This file | Live crawl/a11y/screenshots pending the deploy-cap reset. |

## Flags for the human (decisions needed)
1. **Fonts** — plan wants 2 families; the redesign deliberately uses **Poppins + Inter + mono**. Kept the redesign. Confirm.
2. **Base-3 capability numbering** — plan wants it restored; redesign removed it on purpose. Not restored — your call.
3. **Header 64px-bar redesign** — current floating-pill header is unified & on-brand; the bar is a visual redesign, not a bug. Your call.
4. **Trademark ™ vs ℠** — using ™ (constant in `src/constants/models.ts` with a legal TODO).
5. **Hero featured cards** — the new home hero block has no featured `items` yet (curate 3–4).
6. Still open from the plan: partnerships mailbox, Book-a-call scheduler URL, Flex5 client approval (using Turfly meanwhile), the first-client/first-system name for the About origin paragraph, optional homepage headline swap.
7. Home hero **process bodies + thesis** were drafted from the About culture themes — review against final copy.

## To make everything live on yh16
1. Wait for the Vercel deploy quota to reset (~24h) **or upgrade the plan**, then push any commit (or redeploy) — the latest code + Atlas content will render. The relevant `unstable_cache` keys were already version-bumped (globals v5→v6, pages v4→v5, home v12→v13) so a fresh build reads current data.
2. Consider adding a `CRON_SECRET` env var to yh16 so future CMS edits can bust caches via `/next/revalidate?secret=…` without a redeploy (prod already has one).

## New seed/util scripts added (reusable, disableTransaction-safe)
`scripts/seed-stage1.ts`, `seed-stage5.ts`, `seed-stage6.ts`, `audit-cms-inspect.ts`,
`audit-stage1-inspect.ts`; `src/utilities/revalidateTagSafe.ts`; `src/constants/models.ts`;
`tests/int/no-direct-chrome-import.int.spec.ts`.
