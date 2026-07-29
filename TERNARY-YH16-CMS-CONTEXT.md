# Ternary website v3 — yh16 CMS & deploy context

**Purpose of this file:** give a fresh Claude Code session (or a teammate) everything needed to
safely make CMS content changes to the **yh16 preview site** without breaking anything or touching
production. Read this first.

> ⚠️ **Golden rule:** We only ever change the **yh16 preview** site
> (`https://ternary-website-v3-yh16.vercel.app`). **Never** touch the live company site
> `ternary.solutions` or its database. See "Environments" below — the two use *different* databases.

---

## 1. The two sites and their databases (most important section)

| | **yh16 — preview / sandbox** (ours) | **ternary.solutions — production** (do NOT touch) |
|---|---|---|
| Public URL | https://ternary-website-v3-yh16.vercel.app | https://ternary.solutions |
| Vercel project | `ternary-website-v3-yh16` (scope `sajid209-stacks-projects`) | company-owned |
| Database | **MongoDB Atlas** `mongodb+srv://ternary-preview:****@cluster0.xxpag78.mongodb.net/ternary-local` | Self-hosted `mongodb://…@54.254.242.76:27017/ternary` |
| Deploy from | GitHub `sajid209-stack/ternary-website-v3`, branch **`main`** | company repo `ishmamullhasan/…` |

- **The yh16 database is the Atlas `ternary-local` DB on `cluster0.xxpag78`.** That is the *only*
  database we write to. The connection string (with password) is **not stored in this repo** — get
  it from the user, or from Vercel → `ternary-website-v3-yh16` → Settings → Environment Variables →
  `DATABASE_URI`.
- The local repo `.env` points at `mongodb://127.0.0.1:27017/ternary-local` (a **localhost** copy for
  dev). Writing there does **nothing** to the live yh16 site — you must target the Atlas string.
- If anyone ever hands you a string containing `54.254.242.76` / `NEXT_PUBLIC_URL=ternary.solutions`,
  that is **production**. Do not seed it.

---

## 2. Code vs. CMS — what lives where

- **Design, components, page layout, block renderers = code** (this repo). Changed by editing files
  and deploying.
- **Copy / page content = CMS data in MongoDB** (Payload collections & globals). Changed by writing
  to the database — normally via a small **seed script** using Payload's Local API.

So a "content change" is usually a DB write, and a "design change" is a code change + deploy.

---

## 3. How to change CMS content on yh16 (the workflow)

There is a repeatable 3-step pattern. Example uses the legal pages, but it generalises.

### Step A — write the content to the Atlas DB with a seed script
Seed scripts live in `scripts/` (e.g. `scripts/seed-legal-content.ts`, data in
`scripts/content/legal-content.data.ts`). Run them against the **Atlas** DB, not localhost:

```bash
# DRY run first (reads only, writes nothing) — confirm it finds the docs:
DATABASE_URI='<atlas connection string>' pnpm payload run ./scripts/seed-legal-content.ts

# APPLY (actually writes):
DATABASE_URI='<atlas connection string>' SEED_DRY=0 pnpm payload run ./scripts/seed-legal-content.ts
```
(PowerShell: `$env:DATABASE_URI='…'; $env:SEED_DRY='0'; pnpm payload run ./scripts/seed-legal-content.ts`)

> 🔴 **Critical gotcha — Atlas transactions silently roll writes back.**
> Atlas is a **replica set**, so Payload wraps each `payload.update`/`create` **and its afterChange
> hooks in a transaction**. Several collections' afterChange hooks call `revalidateTag(...)`, which
> **throws** when run outside a Next.js request (as a script is). That throw **aborts the transaction
> and rolls the write back** — but the script often still prints "✓ written". **The write did not
> persist.** (Localhost Mongo is standalone → no transactions → the throw is harmless → writes always
> persisted, which is why this never bit us in local dev.)
>
> **Fix:** pass **`disableTransaction: true`** to every `payload.update`/`create` in a seed script.
> `seed-legal-content.ts` already does this — copy that pattern in any new seed script.

**Always verify the write actually landed** by reading it back:
```bash
DATABASE_URI='<atlas connection string>' pnpm payload run ./scripts/inspect-legal-db.ts
# prints slug | updatedAt | table count | [CONFIRM] count | first heading per legal doc
```
If `updatedAt` didn't change, the write rolled back — check `disableTransaction`.

### Step B — bust the cache so the site shows the new content
Pages cache their DB reads with Next's `unstable_cache`, keyed by a string and tagged (e.g. the legal
page uses tag `legal`). A direct DB write **cannot** fire the tag revalidation (same
outside-a-request reason as above), so the site keeps serving the old cached copy.

The team's established fix (see the many "cache keys bumped" notes in `COPY_CHANGELOG.md`) is to
**bump the `unstable_cache` key version** for the affected page, e.g. in
`src/app/(frontend)/[locale]/legals/[slug]/page.tsx` the keys are `legal_list_${locale}_v3` and
`legal_${slug}_${locale}_v3`. Bump `_v3 → _v4` (etc.). A new key = a cache miss on next deploy = a
fresh DB read.

> The `/next/revalidate?secret=<CRON_SECRET>` endpoint would bust tags without a redeploy, **but yh16
> has no `CRON_SECRET` set**, so it can't be used there. Key-bump + redeploy is the reliable path.

### Step C — deploy
```bash
git add -A && git commit -m "…"      # NOTE: a husky hook wants a Jira key (WEB-123). Branch history
                                     # ignores it; commit with --no-verify (do NOT invent a ticket).
git fetch staging main && git rebase staging/main   # collaborators push often; rebase to avoid clobber
git push staging main                # 'staging' remote = sajid209-stack; main → yh16 production build
```
Pushing to `sajid209-stack/main` auto-triggers the yh16 Vercel build (~3 min). Then verify:
```bash
curl -s https://ternary-website-v3-yh16.vercel.app/legals/privacy-and-policy | grep -c "Working draft"
```

---

## 4. Git remotes / deploy topology

- `origin` = `ishmamullhasan/ternary-website-v3` — **company repo, never push here.**
- `staging` = `sajid209-stack/ternary-website-v3` — **our fork.** Local `main` tracks `staging/main`.
  `staging/main` → Vercel **production build of the yh16 project**. Any other branch = preview only.
- Collaborators (Ariba, Ishmam) also push to `staging/main`, so always `git fetch` + `git rebase`
  before pushing.

---

## 5. Current status of the legal-pages work (as of 2026-07-29)

- **Done & live on yh16:** Privacy Policy + Terms of Service rebuilt from the source PDF drafts, with
  a new `table` block (`src/blocks/Table/`), an accessible table renderer + amber "[CONFIRM] input
  needed" chips (`src/components/richtext/index.tsx`), and a redesigned legal page with a "Working
  draft" banner. Content seeded to the Atlas DB; pages verified live.
- **Pending — the pages are in WORKING-DRAFT state.** ~20 `[CONFIRM: …]` company/legal facts are
  shown as amber chips and must be filled before this is real: incorporation state + reg number +
  registered/operating addresses, privacy/security/general contact emails, analytics product +
  consent-banner decision, international-transfer mechanism, 5 retention periods, children's age
  threshold, liability cap + currency, governing law + forum. When the founder provides these: edit
  `scripts/content/legal-content.data.ts` (find-and-replace the `[CONFIRM: …]` markers), re-run
  Step A/B/C. Never invent these on a legal page.
- **Not yet done:** this is on yh16 only. Replicating to production `ternary.solutions` is a separate,
  company-side task — out of scope here.

---

## 6. Handy files

- `scripts/seed-legal-content.ts` — writes legal content (uses `disableTransaction`).
- `scripts/content/legal-content.data.ts` — the legal copy + tables as a small DSL (edit here).
- `scripts/inspect-legal-db.ts` — read back stored content to verify a write persisted.
- `src/blocks/Table/config.ts` — the Payload `table` block definition.
- `src/components/richtext/index.tsx` — rich-text renderer (tables + `[CONFIRM]` chip highlighting).
- `COPY_CHANGELOG.md` — running log of every CMS copy change (append to it after each change).
