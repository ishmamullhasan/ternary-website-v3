# Content model & localization — where copy lives

Payload 3 + Next, mongoose adapter. Locales `en` (default) + `bn`, `fallback: true` (missing `bn` falls back to `en`; **missing `en` shows `bn` on the English site** — undesirable). Prod DB is the auth'd host, not the repo `.env` tunnel — pass the prod `DATABASE_URI` inline when running scripts.

## Where copy lives (live)

- **Globals — only 3 registered** (`src/payload.config.ts` → `globals: [Header, Footer, LegalCenter]`): `header`, `footer`, `legalCenter`. **Every other "global" in Mongo is retired/orphaned** (`homepage`/`homePage`, `aboutPage`, `contactPage`, `scalesPage`, `industriesPage`, `solutionsPage`, `storiesPage`, `legal-center`, …) — the frontend does **not** read them; writing to them is a no-op (see `scripts/purge-retired-globals.ts`).
- **`pages` collection** (`home, about, solutions, industries, scales, careers, stories, contact`) — page marketing copy lives in each doc's **`layout[]` block array** (blocks in `src/blocks/*`). This is the bulk of the site copy.
- **Content collections**: `capability`(6), `solution`(4), `industry`(10), `model`(3: Frame/Flow/Orchestra), `scale`(3), `team`(20), `insight`, `story`(8), `pressRelease`(2), `legal`(4), `job`.

## Localization storage

Localized fields are stored **inline in Mongo as `{en, bn}` at the leaf** (e.g. `layout[0].heading = {en, bn}`). Richtext = lexical `{root:{children…}}` (localized → `{en:{root}, bn:{root}}`). A surgical Mongo `$set` of `path.en` / `path.bn` is exact and additive — and avoids Payload publish-validation, which **can reject pages with empty required sub-fields** (`seed-content.ts` ~L276-280).

## Write patterns

- **Preferred (Payload Local API)**: author JSON in `scripts/content/`, then `payload.update({collection,id,locale,data,context:{disableRevalidate:true},overrideAccess:true})`, run via `DATABASE_URI=<prod> pnpm payload run ./scripts/x.ts`. Scripts DRY-by-default (`SEED_DRY`). Reuse `toLexical([{heading,paras[]}])` from `seed-content.ts` for richtext.
- **Surgical locale fill (additive)**: direct Mongo `$set` of `path.<locale>` — safe for filling a missing locale on existing fields without touching structure or tripping publish validation.

Cache: globals/home use `unstable_cache` revalidate:300 → writes surface on the live site in ~5 min (or on admin re-save).

## Jobs come from the recruit subsystem — not this CMS

The `job` collection is **not** the source of truth for job listings; listings are served by the recruit subsystem. The CMS `job` docs were stale (only `cw35` + placeholder dupes, all referenced only by **retired** globals) and were **deleted** (2026-06-21). Don't re-seed job content here.

## Known junk (don't fill; delete manually)

- `legal`: `terms-of-service---copy` (real = `terms-of-service`).
- `team` bn-only dupes: `afra-anan-era`, `israt-ara-zahin`, `md-ashraful-alam-shemul` (canonical = `afra-anan`, `israt-zahin`, `ashraful-alam-shemul`). `khandaker-junainah-suha` is a **real** member (no dupe), just missing `en`.
