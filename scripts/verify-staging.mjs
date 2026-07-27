import { chromium } from 'playwright'
const BASE = 'https://ternary-website-v3-yh16.vercel.app'
const shots = [['home','/'],['cap-detail','/capabilities/artificial-intelligence']]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
for (const [name, path] of shots) {
  try {
    await p.goto(BASE + path, { waitUntil: 'load', timeout: 90000 })
    await p.waitForTimeout(800)
    await p.evaluate(async () => { const s=ms=>new Promise(r=>setTimeout(r,ms)); const step=Math.floor(innerHeight*0.8); for(let y=0;y<=document.body.scrollHeight;y+=step){scrollTo(0,y);await s(200)} scrollTo(0,0); await s(400) })
    await p.waitForTimeout(500)
    await p.screenshot({ path: `audit/staging-${name}.png`, fullPage: true })
    console.log('captured', name)
  } catch(e) { console.log('ERR', name, e.message.split('\n')[0]) }
}
await b.close()
