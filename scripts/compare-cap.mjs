import { chromium } from 'playwright'
const BASE='https://ternary-website-v3-yh16.vercel.app'
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage()
for(const [name,path] of [['detail-current','/capabilities/artificial-intelligence'],['detail-template','/capability-template']]){
 try{ await p.goto(BASE+path,{waitUntil:'load',timeout:90000}); await p.waitForTimeout(700)
  await p.evaluate(async()=>{const s=m=>new Promise(r=>setTimeout(r,m));const st=Math.floor(innerHeight*0.8);for(let y=0;y<=document.body.scrollHeight;y+=st){scrollTo(0,y);await s(180)}scrollTo(0,0);await s(300)})
  await p.waitForTimeout(400); await p.screenshot({path:`audit/cap-${name}.png`,fullPage:true}); console.log('ok',name)
 }catch(e){console.log('ERR',name,e.message.split('\n')[0])}
}
await b.close()
