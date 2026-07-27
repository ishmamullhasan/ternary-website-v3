# Session handoff — read this first

Continuation notes so a new Claude Code session (or account) can pick up without losing context.
Also read `CLAUDE.md` (project rules), `REDESIGN_PLAN.md` (the plan), `COPY_CHANGELOG.md` (content changes).

## Where everything lives
- **Working folder:** `C:\Users\sajid\ternary-website-v3` (this repo). Local Mongo tooling: `mongosh` at
  `C:\Users\sajid\AppData\Local\Programs\mongosh\mongosh.exe`.
- **Git remotes:**
  - `origin` = `github.com/ishmamullhasan/ternary-website-v3` — the designer's repo; **all code is merged
    here** (via branch → PR → squash-merge; commit-msg Jira hook is bypassed with `--no-verify`, per the user).
  - `staging` = `github.com/sajid209-stack/ternary-website-v3` — the user's fork. **The `yh16` Vercel
    project deploys from THIS fork.** Keep it in sync: after merging to `origin/main`, run
    `git fetch origin && git push staging origin/main:main` (fast-forward now that they match).
- **Vercel projects (all build from a repo + read a DB):**
  - **`ternary-website-v3-yh16.vercel.app`** — the user's STAGING (account `sajid209-stack`, Hobby).
    Deploys from the **`staging` fork**, `DATABASE_URI` → the **Atlas staging cluster**. **This is the
    review site** (shows both our code and our content).
  - `…-five` / `…-kishmam.vercel.app` — ishmam's personal projects, deploy from `origin`, read a
    DIFFERENT DB → they show CODE changes but NOT our seeded content. Don't use for content review.
- **Databases:**
  - **Atlas staging cluster** (`cluster0.xxpag78.mongodb.net`, db `ternary-local`, user `ternary-preview`) —
    a copy of production content + all our CMS edits. Vercel `yh16` reads this. Connection string is in the
    seed-script run commands (a live credential — treat as disposable). Network Access = `0.0.0.0/0`.
  - **PRODUCTION** Mongo (`54.254.242.76/ternary`) — **NEVER write.** We only read it once (read-only) to
    seed the staging cluster. Copy scripts guard against writing to it.
- **Content is CMS (DB), not git.** Design = code (git); copy = CMS (the cluster). Seed scripts:
  `scripts/copy-to-cloud.js` (prod→staging copy), `scripts/seed-megamenu.js`, `scripts/seed-capability-content.js`,
  `scripts/seed-home-copy.js`. Every content edit is logged in `COPY_CHANGELOG.md` for production replication later.

## Done so far
- Hub pages (Capabilities/Solutions/Scales rebuilt to ternary; Industries kept) — de-numbered copy, Geist Mono
  labels, wider responsive gutters, footer dev-strip removed.
- Mega menu panels authored + seeded (Capabilities/Solutions/Industries).
- **Capability detail** rebuilt to the `/capability-template` design, data-driven (all 8); "What this means to
  us" content seeded.
- Home: cards → 2-line uniform; section copy corrected (de-numbered, canonical, current lists); industries
  section fixed to 4 valid cards; images fixed by adding S3 keys to the `yh16` Vercel env.

## Next up
- Rebuild **Solution + Industry detail** pages if they're on old designs (check `/solutions/[slug]`,
  `/industries/[slug]` vs their template previews — same approach as capabilities).
- Fill capability **case-study proof** slots (`caseStudies`) with real content (`[metric]`/`[Client]` are
  intentional placeholders — never invent).
- Hero-card copy alignment (normalize story titles/excerpts).
- **About / Team / Careers** polish pass.
- Editor-manageable CMS block/field engineering (the user wants this LAST).

## ⚠️ Security — rotate these (exposed in chat earlier)
Production DB password (`ternary-appUser`), AWS S3 keys (`AKIA4S5YRNKDYILRSMV3` + secret), Gmail SMTP app
password, Google OAuth secret, `AUTH_SECRET`, `CRON_SECRET`, `PAYLOAD_SECRET`, and the Atlas staging password.

## Working rules (from the user)
Never push to any remote without asking. Deploy incrementally to `yh16` and report. Copy: draft it, no
fabricated clients/metrics. CMS-manageability engineering comes last.
