// Phase 0 visual-audit screenshotter. Captures full-page shots of every main route at desktop
// (1440) and mobile (390) against the local dev server, into audit/phase0/. reducedMotion:'reduce'
// so scroll-reveals render in their settled final state (nothing hidden below the fold).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const OUT = 'audit/phase0'
mkdirSync(OUT, { recursive: true })

// [label, path] — detail slugs are real rows from ternary-local.
const ROUTES = [
  ['home', '/'],
  ['capabilities', '/capabilities'],
  ['capabilities-detail', '/capabilities/artificial-intelligence'],
  ['solutions', '/solutions'],
  ['solutions-detail', '/solutions/product-development'],
  ['industries', '/industries'],
  ['industries-detail', '/industries/public-sector'],
  ['scales', '/scales'],
  ['about', '/about'],
  ['careers', '/careers'],
  ['contact', '/contact'],
  ['team', '/team'],
  ['case-study', '/case-studies/counterfoil-continuum'],
  ['insight', '/insights/production-responsibility'],
]

const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]

// Scroll top→bottom in steps so every IntersectionObserver `whileInView` reveal fires (a static
// full-page screenshot never scrolls, so reveals would stay at their opacity:0 initial state),
// then return to the top and let the last reveals settle.
async function triggerReveals(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8))
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await sleep(220)
    }
    window.scrollTo(0, 0)
    await sleep(400)
  })
}

const results = []
const browser = await chromium.launch()
for (const [vp, width, height] of VIEWPORTS) {
  // NOTE: no reducedMotion here — we WANT reveals to animate to their visible end state.
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  for (const [label, path] of ROUTES) {
    const file = `${OUT}/${label}-${vp}.png`
    try {
      const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 90000 })
      await page.waitForTimeout(800)
      await triggerReveals(page)
      await page.waitForTimeout(600)
      await page.screenshot({ path: file, fullPage: true })
      const status = resp ? resp.status() : 0
      results.push(`${status}  ${vp.padEnd(7)} ${path}`)
      console.log(`✓ ${status} ${vp} ${path}`)
    } catch (e) {
      results.push(`ERR ${vp.padEnd(7)} ${path} — ${e.message.split('\n')[0]}`)
      console.log(`✗ ${vp} ${path} — ${e.message.split('\n')[0]}`)
    }
  }
  await ctx.close()
}
await browser.close()
console.log('\n=== SUMMARY ===\n' + results.join('\n'))
