# TERNARY WEBSITE — STAGE 0 AUDIT

Read-only audit for `ternary-master-fix-plan.md`. No code changed. Findings tagged **[CODE]** / **[CMS]**, with severity. Verified three ways: source read (3 agents), **live rendered HTML** on `ternary-website-v3-yh16.vercel.app`, and **direct Atlas DB inspection** (`scripts/audit-cms-inspect.ts`).

> **⚠️ Headline: the plan was written against an EARLIER snapshot of the site.** A large share of the code-level issues it describes are already fixed (locale routing, the metadata system, a single unified header/footer, in-code h1s, deep-linked proof, `/work` route + redirect). The genuinely-remaining work is narrower and skews toward **CMS content** and a handful of targeted code/a11y fixes — plus the real content builds in Stages 7–9. Each stage below notes **DONE / PARTIAL / TODO** vs. the plan so I don't "fix" things that are already correct or regress deliberate redesign decisions.

---

## §1 — Link integrity

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 1.1 | Locale routing is already correct: `middleware.ts` serves `en` unprefixed and **301-redirects `/en/*` → bare path**; `LocalizedLink` normalizes CMS links. | `src/middleware.ts:1–62`, `src/components/LocalizedLink.tsx` | [CODE] | — | **DONE** |
| 1.2 | **But `/en/` links still leak in rendered HTML on `/about` (2 occurrences).** Some component on About builds `/en/…` directly instead of via `LocalizedLink`. Harmless (they 301) but a redundant hop + fails the plan's "zero `/en/` links" acceptance. | live `/about` | [CODE] | low | **TODO (small)** |
| 1.3 | `href="#"` present in rendered output: home 10, about 4, solutions 4. Driven mainly by **footer social placeholders** (`footer.tsx:135–140`, render `#` when CMS has no socials) + missing-CMS-link fallbacks (`:188`). | `src/components/sections/footer.tsx` | [CODE/CMS] | med | **TODO** (Stage 1.5: remove # socials, leave commented block) |
| 1.4 | Proof deep-links are correct: `/work` → `/case-studies/[slug]`; `/stories/:slug` 301 in `next.config.js:30–34`. Skip link + `#message` anchor are legitimate. | `work/page.tsx:97` | [CODE] | — | **DONE** |

## §2 — SEO / metadata

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 2.1 | Unified `generateMeta()` already exists with correct precedence (`meta.description \|\| fallback \|\| SITE_DESCRIPTION`), hreflang/canonical, title template `"%s \| Ternary"`. | `src/lib/seo/generateMeta.ts:1–142`, `layout.tsx` | [CODE] | — | **DONE** |
| 2.2 | Hub + detail pages already ship **custom, non-default descriptions**; og:image uses a **3-tier chain**: CMS image → dynamic `/og` endpoint → default template. The plan's premise ("pages fall back to the default description / template og") is largely **no longer true**. | hub + detail pages | [CODE] | — | **DONE** |
| 2.3 | Default description constant still exists (`config.ts:5` "Building products that shape the lives of millions…") as a last-resort fallback. Plan Stage 1.4 lists preferred Home/About/Work/Careers/Contact strings — set these as the explicit per-page defaults so nothing can reach the generic one. | `src/lib/seo/config.ts:5` | [CODE] | low | **PARTIAL** (set the 5 named descriptions) |

## §3 — Heading hierarchy

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 3.1 | **Home renders NO h1 (h1=0, h2=11 live).** The code has a *conditional* h1 in `HeroFeatured/Component.tsx:107` that only renders when the CMS `headline` is populated — and it's **empty in the DB**, so the live page has zero h1. Real issue, **CMS-rooted**. | `src/blocks/HeroFeatured/Component.tsx:107` + home doc | [CODE+CMS] | high | **TODO** (Stage 5.1) |
| 3.2 | All other audited routes render exactly one h1 (about, solutions, capabilities, scales, industry detail, team, search, detail template). | various | [CODE] | — | **DONE** |

## §4 — Duplicate rendering / carousels

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 4.1 | The "duplicate" card sections (contact routes, solutions/scales/engagement comps) are **intentional responsive swaps** (mobile carousel `sm:hidden` vs desktop grid `hidden sm:grid`) — NOT accidental double-renders. Plan §4's premise is largely stale. | `contactRoutes.tsx`, `solutionsComp.tsx`, `scalesComp.tsx`, `engagementComp.tsx` | [CODE] | — | **DONE / N/A** |
| 4.2 | The reported **careers "What you can expect" 4-then-3 double render does NOT exist** — `CareersGridOne` renders 6 unique cards once. | `src/blocks/CareersGridOne/Component.tsx` | [CODE] | — | **N/A (false report)** |
| 4.3 | **Real a11y bug:** `MobileCarousel` leaves links in **hidden (non-active) slides focusable** — no `tabindex="-1"` / `inert`. Tab order reaches offscreen interactive elements. | `src/components/layout/MobileCarousel.tsx:61–65` | [CODE] | med | **TODO** (fold into Stage 3.4) |

## §5 — Header / footer implementations

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 5.1 | There is **one header and one footer**, both rendered from the **root layout** (`layout.tsx:134,150`). The "two different mobile headers" report is a misread of one burger's **responsive positioning** (bottom-left < md, top-right ≥ md). No duplicate components. | `src/components/sections/header.tsx`, `footer.tsx`, `layout.tsx` | [CODE] | — | **DONE (already unified)** |
| 5.2 | Current header is **not** the plan's spec (fixed 64px bar). It's a floating logo pill + floating burger with `glass`. So Stage 2 is really a **redesign to the spec'd bar**, *if desired* — NOT a de-duplication. ⚠️ This changes the current design → treat as a design decision, flag before doing. | `header.tsx` | [CODE] | — | **FLAG (design change, not a bug)** |

## §6 — Design tokens

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 6.1 | **Fonts: three families** — Poppins (display), Inter (body), Geist Mono (labels) — all via `next/font`, no raw `font-family`. ⚠️ Plan Stage 3.1 wants **two** families; but Poppins+Inter+mono is the **deliberate redesign type system** (documented in CLAUDE.md). Collapsing to two would materially change the design. | `layout.tsx:37–56`, `globals.css` | [CODE] | — | **FLAG (conflicts with redesign — do NOT collapse without sign-off)** |
| 6.2 | **200+ arbitrary `text-[Xpx]` sizes** (mostly prose/micro-text). Real off-scale debt, but high-volume and mostly benign. | many blocks | [CODE] | med | **TODO (selective)** |
| 6.3 | **Section spacing drift**: many distinct patterns (`pt-20 lg:pt-40`, `py-24 lg:py-32`, clamp-based, etc.); no shared token. | RenderBlocks + page files | [CODE] | med | **TODO** (Stage 3.2 `--section-y`) |
| 6.4 | `100vh/h-screen/min-h-screen`: only 5, all on legal/job detail pages + one CSS comment — mostly justified. | legals/jobs pages | [CODE] | low | **PARTIAL** |
| 6.5 | **™**: one auto-rendered (`solutions:465`) + 3 hardcoded strings on `scales/page.tsx:67,87,107`. No shared model constant → drift risk. | solutions/scales | [CODE] | low→med | **TODO** (Stage 3.5 constant) |

## §7 — CMS-vs-code map (DB-verified)

| # | Finding | Owner | Tag | Sev | Stage |
|---|---------|-------|-----|-----|-------|
| 7.1 | **"Test Press Release …opens an agentic engineering practice in Dhaka"** — exists, **published**. | `pressRelease` collection | [CMS] | high | 6.1 |
| 7.2 | **"Test Insight — Cache components…"** — exists, **published**. | `insight` collection | [CMS] | high | 6.1 |
| 7.3 | Home **"How we operate" (processSection): 5 items, ALL 5 bodies empty**; titles present; **no duplicate** (plan's dup claim stale). | `pages/home` → processSection | [CMS] | high | 5.2 |
| 7.4 | Home **engagementSection `cards` array is EMPTY** — models section has no seeded card data (order/rendering to verify). | `pages/home` → engagementSection | [CMS] | med | 5.3 |
| 7.5 | **Footer capabilities = 6 (should be 8)**; solutions=4, industries=9. | `footer` global relationships | [CMS] | med | 1.5 |
| 7.6 | Taxonomy: **both `software-platforms` AND `technology-platforms` industry docs exist.** Plan wants Technology Platforms canonical + `software-platforms → technology-platforms` 308. | `industry` collection | [CMS+CODE] | med | 1.3 |
| 7.7 | Industry **generic subtitle confirmed on `banking-capital-markets`**: "Digital transformation and secure platforms for financial institutions". Most other industries already have distinct excerpts. | `industry` collection | [CMS] | med | 6.6 |
| 7.8 | About page blocks: `hero, aboutThesis, aboutApproach, aboutProofOfScale, aboutBeliefs, aboutLeadership, aboutFundingStory, ctaBlock` — the "value-ish lists that repeat" the plan restructures. "Certified global delivery hub" duplicate lives inside `aboutApproach` data (verify at Stage 7). | `pages/about` | [CMS] | med | 7 |
| 7.9 | Team collection has no "level" field; any "Software Engineer I / (Level NN)" markers would be in free-text `position` — strip in render, per plan 6.4. Missing photos/titles are data gaps → render guards. | `team` collection | [CMS+CODE] | med | 6.4 / 7 |

## §8 — Numbering

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 8.1 | **Base-3 capability numbering was INTENTIONALLY REMOVED** (documented comment: "base-three ordinals … are gone", `capabilities/page.tsx:21`). Capability collection animation options are 01–07 sequential. ⚠️ Plan Stage 3.3 wants base-3 **restored** (00,01,02,10,11,12,20,21 + eyebrow "Capability index · 00–21 · base 3"). Direct reversal of a deliberate redesign choice. | `capabilities/page.tsx:21`, `capability.ts:74` | [CODE] | — | **FLAG (restore per plan, but flag the reversal)** |
| 8.2 | Scales base-3 (00/01/10) present and kept. | `scales/page.tsx` | [CODE] | — | keep |

## §9 — /work route

| # | Finding | Where | Tag | Sev | vs plan |
|---|---------|-------|-----|-----|---------|
| 9.1 | `/work` exists and links to `/case-studies/[slug]`. Nav linkage is CMS-driven (was added via `seed-nav-work.js` in a prior pass). | `work/page.tsx` | [CODE] | — | **DONE** |
| 9.2 | **Mobile hero "text far down" confirmed:** `workScenes.css` sets `--wk-vh: calc(100svh - navOverhead)` with `align-items:flex-end` and `.wk-body` bottom padding `clamp(56px,8vh,104px)`, and **no mobile override** in the `@media (max-width:768px)` block → text bottom-anchored low on short viewports. | `src/components/work/workScenes.css:7,43,104,259–274` | [CODE] | med | **TODO** (Stage 9.1) |

---

## Summary — what's actually left (by plan stage)

- **Stage 1**: mostly DONE. Real work = kill 2 `/en/` links on About; set 5 named meta descriptions; remove footer `#` socials; add 2 footer capabilities; taxonomy `software-platforms → technology-platforms` (redirect + banking related-verticals).
- **Stage 2**: header/footer **already unified**. The spec'd 64px-bar redesign is a **design change** — ⚠️ flag, don't assume.
- **Stage 3**: real = spacing token + `text-[…]` cleanup (selective) + ™ constant + MobileCarousel a11y. ⚠️ **Two-font collapse and base-3 restoration conflict with the redesign — flagged for human.**
- **Stage 4**: hero top-anchor rule + primitives — verify per page; much of the vh discipline already holds.
- **Stage 5**: **real CMS work** — home h1/headline, populate 5 "How we operate" bodies, engagement cards/order, CTAs.
- **Stage 6**: **real CMS work** — unpublish 2 Test docs, zero-count filters, team render guards, Contact (Dhaka office / fold Partnerships / remove Book-a-call), banking (+ any other generic) industry subtitles.
- **Stage 7**: **real build** — About restructure to 8 sections + team directory rework.
- **Stage 8**: **real build** — solution-detail blocks + verbatim copy for all 4.
- **Stage 9**: `/work` mobile hero fix + confirm Stories→Work migration (nav already has Work).
- **Stage 10**: QA + uniformity proof.

## Flags for the human (carry to QA.md)
1. **Trademark** ™ vs ℠ (using ™ default).
2. **Fonts** — plan wants 2 families; redesign uses Poppins+Inter+mono. **Kept the redesign system; not collapsing without your OK.**
3. **Base-3 capability numbering** — plan wants it restored; redesign deliberately removed it. **Need your call** (default: follow the plan and restore, but it reverses a redesign decision).
4. **Header redesign to a 64px bar** — current floating-pill header is already unified & on-brand; the plan's bar spec is a visual change, not a bug. **Need your call.**
5. Homepage headline swap (optional alt in plan), partnerships mailbox, Book-a-call scheduler URL, Flex5 approval (using Turfly), first-client/first-system name for About origin.
