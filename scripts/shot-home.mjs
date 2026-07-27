import { chromium } from 'playwright'
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage()
await p.goto('https://ternary-website-v3-yh16.vercel.app/',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(1000)
await p.evaluate(async()=>{const s=m=>new Promise(r=>setTimeout(r,m));const st=Math.floor(innerHeight*0.8);for(let y=0;y<=document.body.scrollHeight;y+=st){scrollTo(0,y);await s(220)}scrollTo(0,0);await s(400)})
await p.waitForTimeout(600); await p.screenshot({path:'audit/staging-home-2.png',fullPage:true}); console.log('captured, page height:', await p.evaluate(()=>document.body.scrollHeight))
await b.close()
