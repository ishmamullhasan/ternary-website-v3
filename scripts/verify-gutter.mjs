import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
for (const [name, path] of [['solutions','/solutions'],['capabilities','/capabilities']]) {
  await p.goto('http://localhost:3000' + path, { waitUntil: 'load', timeout: 90000 })
  await p.waitForTimeout(1200)
  // just the top ~1100px so the hero gutter is clearly visible
  await p.screenshot({ path: `audit/phase0/verify-${name}-gutter.png`, clip: { x: 0, y: 0, width: 1440, height: 1100 } })
  console.log('captured', name)
}
await b.close()
