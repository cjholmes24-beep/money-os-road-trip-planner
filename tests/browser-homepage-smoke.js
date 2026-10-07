'use strict';
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
(async()=>{
 let n=0;const check=(v,m)=>{assert.ok(v,m);n++;};
 const executablePath=process.env.SUITCASE_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:8000/money-os-road-trip-planner/',screens=process.env.SUITCASE_SCREENSHOTS||'/tmp';fs.mkdirSync(screens,{recursive:true});
 try{
 for(const width of [360,390,412,768,1440]){
  const context=await browser.newContext({viewport:{width,height:width===360?740:900}}),errors=[];
  await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith('http://127.0.0.1:8000/'))return route.continue({url:u.replace('/money-os-road-trip-planner/','/')});return route.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForSelector('#telemetryConsent',{state:'attached'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' initial no overflow');
  check((await page.locator('body').innerText()).includes('Know the real cost.'),width+' consumer headline');
  check(!/Money OS|\bV1\b|canonical trip profile|being built|monetization|trademark|Optional local planning history/i.test(await page.locator('body').innerText()),width+' no internal public copy');
  const primary=page.locator('.travel-hero-copy a').first(),box=await primary.boundingBox();
  check(box.height>=44&&box.y+box.height<740,width+' primary CTA above fold');
  check(await page.locator('.travel-hero-art img').evaluate(img=>img.complete&&img.naturalWidth>0),width+' local travel art loaded');
  check(await page.locator('.featured-tools>a').count()===6,width+' six featured tools');
  check(await page.locator('#privacy-settings').getAttribute('open')===null,width+' privacy initially collapsed');
  check(!await page.locator('#telemetryConsent').isChecked(),width+' tracking off by default');
  check(await page.evaluate(()=>localStorage.getItem(RevenueIntelligence.DEMAND_KEY)===null),width+' no activity stored without consent');
  await page.screenshot({path:path.join(screens,'homepage-'+width+'.png')});
  if(width<760){
   const menu=page.locator('.nav-toggle');await menu.click();check(await menu.getAttribute('aria-expanded')==='true',width+' menu opens');
   check(await page.locator('#tool-nav a').first().isVisible(),width+' menu links visible');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' expanded menu no overflow');
   await menu.click();check(await menu.getAttribute('aria-expanded')==='false',width+' menu closes');
  }
  await page.locator('.home-secondary').click();check(new URL(page.url()).hash==='#popular-tools',width+' explore tools works');
  await page.locator('#privacy-settings summary').click();check(await page.locator('#telemetryConsent').isVisible(),width+' privacy controls accessible');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' expanded privacy no overflow');
  await page.locator('#telemetryConsent').check();
  check(await page.evaluate(()=>localStorage.getItem(RevenueIntelligence.CONSENT_KEY)==='yes'),width+' explicit consent saved');
  check(await page.evaluate(()=>RevenueIntelligence.demandStore(localStorage).read().some(e=>e.type==='PAGE_VIEWED')),width+' opt-in still captures activity');
  await page.locator('#telemetryConsent').uncheck();
  check(await page.evaluate(()=>localStorage.getItem(RevenueIntelligence.CONSENT_KEY)==='no'),width+' opt-out works');
  check(errors.length===0,width+' no browser errors: '+errors.join(';'));
  await context.close();
 }
 // Exercise actual featured links and ensure no accidental booking/provider redirect.
 const context=await browser.newContext();await context.route('**/*',route=>{const u=route.request().url();return u.startsWith('http://127.0.0.1:8000/')?route.continue({url:u.replace('/money-os-road-trip-planner/','/')}):route.abort();});
 const page=await context.newPage();await page.goto(base);const links=await page.locator('.featured-tools>a').evaluateAll(nodes=>nodes.map(n=>n.href));
 for(const href of links){const response=await page.goto(href);check(response.status()===200,'featured link HTTP 200 '+href);check(await page.locator('main').count()===1,'existing useful tool '+href);}
 await page.goto(base+'google4493b9dd4b73c0e8.html');check((await page.locator('body').innerText())==='google-site-verification: google4493b9dd4b73c0e8.html','verification bytes served unchanged');
 await context.close();console.log(n+' homepage Chromium checks passed at 360/390/412/768/1440px. External requests blocked.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
