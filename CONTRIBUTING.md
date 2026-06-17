# Contributing

Thanks for contributing to the Ternary Solutions website. This project follows a
ticket-first, PR-based workflow.

## Workflow

1. **Start from a Jira ticket** (project `WEB`). Every change maps to a ticket.
2. **Branch from `main`**, named for the ticket — e.g. `sshakib-web-123` or
   `web-123-short-slug`.
3. **Commit messages must reference the Jira key** — e.g. `WEB-123: add hero block`. The
   `commit-msg` hook enforces this (merge/revert/fixup commits are exempt).
4. **Open a PR into `main`.** CI (lint, typecheck, integration tests, build) and the
   Lighthouse report run automatically. Keep PRs focused.
5. **Squash-merge** once green; the branch is auto-deleted.

## Local checks

- `pnpm lint` — ESLint (also runs on staged files via the pre-commit hook).
- `pnpm exec tsc --noEmit` — typecheck.
- `pnpm test` — integration + e2e tests.
- `pnpm build` — production build (needs a database; see `.env.example`).
- After changing collections/globals/blocks, run `pnpm generate:types`.

## Conventions

- New pages are composed from **blocks** in the CMS (Pages collection), not new route
  files. New section types are added as blocks under `src/blocks/`.
- Reuse the shared field factories (`src/fields/`) and the colour tokens
  (`globals.css @theme`) rather than duplicating field configs or hardcoding hex.
- Do not commit secrets. Generated files (`src/payload-types.ts`, the admin import map)
  are kept in their generator's native format (see `.prettierignore`).
