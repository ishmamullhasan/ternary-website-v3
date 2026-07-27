import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
try {
  const resp = await p.goto('https://ternary.solutions', { waitUntil: 'networkidle', timeout: 60000 })
  console.log('HTTP', resp ? resp.status() : '?', '| title:', await p.title())
  await p.waitForTimeout(2500)
  await p.screenshot({ path: 'audit/ternary-solutions/home-top.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } })
  // harvest gradients + animations
  const info = await p.evaluate(() => {
    const grads = new Set(), anims = new Set(), trans = new Set()
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el)
      const bg = cs.backgroundImage
      if (bg && bg.includes('gradient')) grads.add(bg.slice(0, 160))
      if (cs.animationName && cs.animationName !== 'none') anims.add(`${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction}`)
      if (cs.transitionProperty && cs.transitionProperty !== 'all' && cs.transitionProperty !== 'none' && cs.transitionDuration !== '0s')
        trans.add(`${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`)
    }
    return { grads: [...grads].slice(0, 12), anims: [...anims].slice(0, 10), trans: [...trans].slice(0, 10) }
  })
  console.log('\n=== GRADIENTS ===\n' + info.grads.join('\n'))
  console.log('\n=== ANIMATIONS ===\n' + info.anims.join('\n'))
  console.log('\n=== TRANSITIONS ===\n' + info.trans.join('\n'))
} catch (e) {
  console.log('ERROR:', e.message.split('\n')[0])
}
await b.close()
