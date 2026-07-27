import { chromium } from 'playwright'
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage()
await p.goto('https://ternary-website-v3-yh16.vercel.app/capabilities/artificial-intelligence',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(1200)
await p.addStyleTag({content:'*{opacity:1 !important; transform:none !important;}'}); await p.waitForTimeout(500)
await p.screenshot({path:'audit/stg-capdetail.png',fullPage:true})
// also detect: new design markers vs old
const marks = await p.evaluate(()=>({ sectionMarkers:[...document.querySelectorAll('*')].filter(e=>/Section 0\d/.test(e.textContent||'')&&e.children.length===0).length, whatItIs: document.body.innerText.includes('What it is'), howWeDoIt: document.body.innerText.includes('How we do it'), selectedWork: document.body.innerText.includes('Selected work'), related: document.body.innerText.includes('Related'), deliveryApproach: document.body.innerText.includes('Delivery Approach') }))
console.log(JSON.stringify(marks))
await b.close()
