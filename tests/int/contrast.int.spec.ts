import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the brand palette against contrast regressions (WCAG 2.2 SC 1.4.3 / 1.4.6).
 *
 * Pure computation over the tokens declared in globals.css — no browser, no DOM, deterministic.
 * This catches the class of bug that shipped `--color-subtle: #757571` (4.41:1 on --color-page,
 * below the 4.5:1 AA floor for normal text) and went unnoticed, because no linter or axe rule
 * evaluates a CSS custom property in isolation.
 *
 * What this CANNOT check: text composited over photographic imagery (hero backdrops). Those need a
 * scrim and a per-case visual review.
 */

const GLOBALS_CSS = join(process.cwd(), 'src', 'app', '(frontend)', 'globals.css')

type Rgb = [number, number, number]

const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb

/** WCAG 2.x relative luminance. The 0.03928 knee and 2.4 exponent are normative. */
const channel = (c: number): number => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

const luminance = ([r, g, b]: Rgb): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

/** Contrast ratio, order-independent. */
export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Simulate `text-<token>/NN` — Tailwind opacity composites the text over its backdrop. */
const composite = (fg: Rgb, bg: Rgb, alpha: number): Rgb =>
  fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))) as Rgb

/** Parse `--color-<name>: #rrggbb;` declarations out of the @theme block. */
function readTokens(): Record<string, Rgb> {
  const css = readFileSync(GLOBALS_CSS, 'utf8')
  const tokens: Record<string, Rgb> = {}
  for (const [, name, hex] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[name] = toRgb(hex.toLowerCase())
  }
  return tokens
}

const AA_NORMAL = 4.5
const AAA_NORMAL = 7

/** Every surface that page text is rendered on top of. */
const BACKGROUNDS = ['page', 'ink', 'button-dark', 'card', 'badge'] as const

/**
 * Foreground text tokens and the floor each must clear on EVERY background.
 *
 * `subtle` is held to AA, not AAA: reaching 7:1 requires ~#ababa5, which collapses it into
 * `body` (#d5d5d5) and erases the muted tier. Documented exception to the AAA-for-body-text target.
 */
const TEXT_TOKENS: ReadonlyArray<{ token: string; floor: number }> = [
  { token: 'cream', floor: AAA_NORMAL },
  { token: 'cream-hover', floor: AAA_NORMAL },
  { token: 'body', floor: AAA_NORMAL },
  { token: 'subtle', floor: AA_NORMAL },
]

describe('brand palette contrast', () => {
  const tokens = readTokens()

  it('declares every token the test depends on', () => {
    for (const name of [...BACKGROUNDS, ...TEXT_TOKENS.map((t) => t.token)]) {
      expect(tokens[name], `--color-${name} missing from globals.css`).toBeDefined()
    }
  })

  describe.each(TEXT_TOKENS)('--color-$token', ({ token, floor }) => {
    it.each(BACKGROUNDS)(`meets ${'%s'} contrast floor`, (bg) => {
      const ratio = contrastRatio(tokens[token], tokens[bg])
      expect(
        ratio,
        `--color-${token} on --color-${bg} is ${ratio.toFixed(2)}:1, needs >= ${floor}:1`,
      ).toBeGreaterThanOrEqual(floor)
    })
  })

  // `text-cream/70` is the lowest opacity step permitted for real text: /60 lands at 6.13:1 on
  // --color-badge and misses AAA. Decorative aria-hidden icons may use lower steps — WCAG exempts
  // them — so this asserts the floor for the step we allow, not for every usage in the codebase.
  it('text-cream/70 clears AAA on every surface', () => {
    for (const bg of BACKGROUNDS) {
      const ratio = contrastRatio(composite(tokens.cream, tokens[bg], 0.7), tokens[bg])
      expect(
        ratio,
        `text-cream/70 on --color-${bg} is ${ratio.toFixed(2)}:1, needs >= ${AAA_NORMAL}:1`,
      ).toBeGreaterThanOrEqual(AAA_NORMAL)
    }
  })

  it('text-cream/60 still fails AAA — the reason /70 is the floor', () => {
    const ratio = contrastRatio(composite(tokens.cream, tokens.badge, 0.6), tokens.badge)
    expect(ratio).toBeLessThan(AAA_NORMAL)
  })

  // The global :focus-visible outline (globals.css) draws in cream. SC 1.4.11 requires 3:1 for
  // non-text UI indicators against adjacent colour.
  it('focus outline meets the 3:1 non-text floor on every surface', () => {
    for (const bg of BACKGROUNDS) {
      expect(contrastRatio(tokens.cream, tokens[bg])).toBeGreaterThanOrEqual(3)
    }
  })
})
