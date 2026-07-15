# Ternary — project instructions

Next.js 16 (App Router) + Payload CMS 3.85 + React 19 + Tailwind v4. Locales: `en` (served
unprefixed at root) and `bn` (under `/bn`). Package manager is **pnpm**.

```
pnpm dev          # dev server (needs DATABASE_URI; Mongo is remote, not local)
pnpm lint         # eslint, incl. the jsx-a11y ruleset
pnpm test:int     # vitest — tests/int/**/*.int.spec.ts
pnpm test:e2e     # playwright — tests/e2e/
npx tsc --noEmit  # typecheck
```

---

# Accessibility

Target: **WCAG 2.2 Level AA**, plus **AAA contrast (SC 1.4.6) for body text**. Both locales are in
scope. Payload's `/admin` UI is out of scope — Payload owns it.

Full remediation plan and phase status: `~/.claude/plans/plan-a-complete-a11y-cached-wadler.md`.

## Non-negotiables

- **Never suppress a focus indicator on an interactive control.** `globals.css` defines a global
  `:focus-visible` cream outline. Adding `focus:outline-none` / `focus-visible:outline-none` to a
  link, button, or input removes it with nothing in its place. If you need a custom indicator,
  supply a `focus-visible:ring-*` replacement in the same class list.
  - The one legitimate exception in the codebase is `<main id="main-content" tabIndex={-1}>` in
    `src/app/(frontend)/[locale]/layout.tsx`. SC 2.4.7 governs _user interface components_; a
    landmark focused transiently by the skip link is not one.
- **The skip link must stay the first child of `<body>`**, before `<Header>`. It is the first
  focusable element in the document (SC 2.4.1).
- **Exactly one `<main>` per page, and exactly one `<h1>`.** The root layout already renders
  `<main id="main-content">`. Pages must not render their own — six of them used to, which is a
  duplicate-landmark violation. Use a `<div>`.
- **Do not hand-roll a focus trap, roving tabindex, or menu keyboard semantics.** See Radix below.

## Contrast

Backgrounds text can land on: `--color-page #050505`, `--color-ink`, `--color-button-dark`,
`--color-card #1b1a17`, `--color-badge #202020`. **`--color-badge` is the binding constraint** — it
is the lightest, so it yields the lowest ratio. Always check against it, not against `--color-page`.

Current state (all verified by `tests/int/contrast.int.spec.ts`, which fails the build if a token
regresses):

| Token                      | Floor    | Note                                                                                                                   |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--color-cream`            | AAA 7:1  | Passes comfortably (11–18:1)                                                                                           |
| `--color-body` `#aaaaaa`   | AAA 7:1  | **At the floor** — 7.01:1 on `--color-badge`. Lightening any background token needs a re-check against the guard.      |
| `--color-subtle` `#8a8a86` | AA 4.5:1 | **Documented AAA exception.** 7:1 needs `#ababa5`, which collapses it into `--color-body` and destroys the muted tier. |
| `text-cream/70`            | AAA 7:1  | Lowest opacity step allowed for real text                                                                              |
| `text-cream/50`, `/60`     | —        | **Banned for text.** `/60` is 6.13:1 on badge — AA but not AAA.                                                        |

**Decorative `aria-hidden` icons are exempt from contrast requirements entirely.** Do not "fix"
their colour. `MegaMenuOverlay.tsx` and `header.tsx` each have an `aria-hidden` chevron at a low
opacity step — that is correct and intentional. Changing them alters the design for zero benefit.

Token math cannot cover text over hero photography. Those need a scrim, judged case by case.

## Radix is already a full dependency

26 `@radix-ui/react-*` packages are in `package.json`, largely unused. Before writing any overlay,
menu, accordion, tabs, or dialog behaviour, **check whether Radix already ships it.**

- Modals/overlays → `@radix-ui/react-dialog` (focus trap, initial focus, focus restore,
  `aria-modal`, scroll lock, background `inert` — all correct, all free)
- Menus → `@radix-ui/react-dropdown-menu` (roving tabindex, arrow keys, typeahead)
- Accordions → `@radix-ui/react-accordion` (supplies `aria-controls`)

Focus management and roving tabindex are notoriously easy to get subtly wrong. A bespoke
implementation must be justified, not assumed.

## Headings

`RenderBlocks` maps blocks as a **flat list — blocks never nest.** Therefore:

- `1` — the page's single `<h1>`: a hero block, or the page shell on detail routes
- `2` — a block's own section heading
- `3` — headings of repeated items inside a block (cards, panels, rows)

Use `src/components/a11y/Heading.tsx` with an explicit `level` prop.

**Do not reach for React context here.** Blocks are Server Components and cannot subscribe to
context; a context-based `<Heading>` would have to be a Client Component, making every heading on
the site a client island — to model a depth that never varies. Because every block opens at `h2` and
steps down internally, reordering blocks in the CMS can never introduce a skipped level.

The Lexical editor is restricted to `h2`–`h4` (`payload.config.ts`) so authors cannot mint a second
`h1` or skip a level. Stored nodes are untouched; the converter still renders legacy `h1`.

## What the linter cannot see

`eslint-plugin-jsx-a11y` is registered with all 31 `recommended` rules. The codebase currently
produces **zero** a11y warnings. **This does not mean the site is accessible.** Static analysis
cannot detect:

- missing focus traps, focus restore, or `inert` backgrounds
- colour contrast
- heading order across components, or duplicate landmarks
- a `<label>` rendered as a `<p>` (as `contactForm.tsx`'s `FieldGroup` does — so
  `label-has-associated-control` has nothing to inspect and stays silent)

Every serious defect found in this project's audit was invisible to the linter. Treat a green lint
run as a floor, never as evidence.

When editing `eslint.config.mjs`: `recommended` deliberately ships 3 of its 34 rules **off** (the
deprecated `label-has-for`, plus `control-has-associated-label` and `anchor-ambiguous-text`).
Re-mapping severity via `Object.keys` would switch those on. It would also **discard each rule's
options tuple** — without `allowExpressionValues` and `{canvas: ['img']}` you get false positives,
including against `globalDeliveryGlobe.tsx`, where `<canvas role="img">` is the correct pattern.
Preserve the tuples; only remap the severity of rules that are already enabled.

## Verifying an a11y change

Typecheck and lint are necessary but never sufficient — they would have passed on every bug we
found. Drive the actual behaviour:

1. `pnpm test:int` — includes the contrast guard.
2. Run `pnpm dev` and exercise the change with the **keyboard only**: Tab order, Escape, focus
   restore to the trigger, no focus reaching content behind an overlay.
3. Emulate `prefers-reduced-motion: reduce` and confirm no transform reveals fire. Note the
   `globals.css` media query caps **CSS** animation only — `motion/react` `whileInView` transforms
   need an explicit `useReducedMotion()` gate.
4. Check both `en` and `/bn`.

When testing a skip link in a browser: clicking the page first sets a _sequential focus navigation
starting point_, so Tab resumes from the click and bypasses the link. Reload, or focus
programmatically, instead.

The `a11y-specialist-skills` plugin is installed. Prefer its `reviewing-a11y` skill for per-component
review. Its `auditing-wcag` skill shells out to Playwright and `@a11y-skills/audit`, neither of which
is currently a dependency here.

## Media and alt text

The Media collection's `alt` field is `required: true, localized: true` — good. But several
components bypass it with a placeholder (`title ?? 'Card image'`) or duplicate adjacent visible text.
Prefer the authored `alt`. Decorative images get `alt=""`, not a restated caption.

Payload localization has `fallback: true`, so a missing `bn` alt silently serves the `en` string — a
Bengali screen-reader user hears English. Nothing flags this; check it deliberately.
