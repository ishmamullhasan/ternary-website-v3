import { chromium } from 'playwright'
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage()
await p.goto('https://ternary-website-v3-yh16.vercel.app/',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(1500)
// force every motion-reveal element visible (opacity 1, no transform)
await p.addStyleTag({content:'*{opacity:1 !important; transform:none !important; visibility:visible !important;}'})
await p.waitForTimeout(600)
await p.screenshot({path:'audit/staging-home-forced.png',fullPage:true}); console.log('done, h=',await p.evaluate(()=>document.body.scrollHeight))
await b.close()
