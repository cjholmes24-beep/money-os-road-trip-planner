'use strict';
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
(async()=>{
 let count=0;const check=(v,m)=>{assert.ok(v,m);count++;};
 const executablePath=process.env.SUITCASE_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 const screenshots=process.env.SUITCASE_SCREENSHOTS||'/tmp';fs.mkdirSync(screenshots,{recursive:true});
 try{
 for(const width of [360,390,412,1440]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:"reduce"}),errors=[];
  await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8000/')?r.continue():r.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8000/plan-my-trip/');
  check(await page.evaluate(()=>scrollY===0),width+' hero not skipped by autofocus');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' initial fit');
  check(!(await page.locator('#planResults').isVisible()),width+' no infrastructure before plan');
  const body=()=>page.locator('body').innerText();
  const noInternal=async label=>check(!/powered by money os|\bV1\b|owner.cost architecture|live source not connected|provider access required|intelligence modules|runtime.approved|NOT ENOUGH VERIFIED DATA|direct partner URLs/i.test(await body()),width+' '+label+' traveler copy');
  await noInternal('initial');
  await page.screenshot({path:path.join(screenshots,'planner-'+width+'.png')});
  // Complete all existing intake steps with actual controls.
  await page.locator('#purpose').selectOption('Friends getaway');
  await page.locator('#nextStep').click();await page.locator('#travelerCount').fill('4');
  await page.locator('#addTraveler').click();const traveler=page.locator('.traveler-row').first();await traveler.locator('[data-field=amount_committed]').fill('250');await traveler.locator('[data-field=amount_paid]').fill('250');await traveler.locator('[data-field=commitment_state]').selectOption('FULL_SHARE_FUNDED');
  await page.locator('#nextStep').click();await page.locator('#budget').fill('1000');await page.locator('#reserve').fill('100');
  await page.locator('#nextStep').click();await page.locator('#destination').fill('Orlando, FL');await page.locator('#startDate').fill('2026-10-31');await page.locator('#endDate').fill('2026-11-02');
  await page.locator('#nextStep').click();await page.locator('#transport').selectOption('Fly');await page.locator('#lodging').selectOption('No lodging');
  await page.locator('#nextStep').click();await page.locator('#nextStep').click();await page.locator('#nextStep').click();await page.locator('#nextStep').click();
  await page.locator('#trip-intake button[type=submit]').click();await page.waitForSelector('#tripRevenueActions .option-card');
  check(await page.locator('#planResults').isVisible(),width+' complete blueprint');
  check((await page.locator('#budgetSummary').innerText()).includes('$900.00'),width+' protected reserve math');
  check((await page.locator('#budgetSummary').innerText()).includes('$750.00'),width+' funding gap');
  check((await page.locator('#dropoutResults').innerText()).includes('$333.33'),width+' dropout math retained');
  check(!(await page.locator('#eventsWorkspace').isVisible()),width+' unselected events hidden');
  check(!(await page.locator('#lodgingWorkspace').isVisible()),width+' no-lodging hidden');
  check(!(await page.locator('#fuelReference').isVisible()),width+' irrelevant fuel hidden even after source bind');
  check(await page.locator('#transportComparison .comparison-card').count()===0,width+' no empty comparison cards');
  check(await page.locator('#transportComparison .comparison-empty').count()===1,width+' one actionable comparison state');
  check(await page.locator('#tripBookingActions .eligible-provider').count()===0,width+' no fabricated booking category');
  check(await page.locator('.module-grid,.booking-grid').count()===0,width+' no inventories');
  await noInternal('built');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' results fit');
  await page.screenshot({path:path.join(screenshots,'planner-results-'+width+'.png')});
  const fixture=await page.evaluate(()=>{
   const B=SuitcaseBrain,T=TransportLodgingIntelligence;
   const t=B.createTrip({destination:'Orlando, FL',dates:{start:'2026-10-31',end:'2026-11-02'},budget:{total:1000,reserve:100,currency:'USD'},traveler_count:2,preferences:{transport:'Drive',lodging:'Hotel',interests:['Events']}});
   const option=(kind,name,total,currency='USD')=>{
    const o=kind==='transport'?T.normalizeTransportOption({mode:'BUS',provider:name,traveler_count:2,duration_minutes:120,currency}):T.normalizeLodgingOption({category:'HOTEL',property:name,nights:2,rooms:1,occupancy:2,currency});
    const fields=kind==='transport'?T.TRANSPORT_MANDATORY_BY_MODE.BUS:T.LODGING_MANDATORY;
    fields.forEach((key,i)=>o.costs[key]=T.component(i===0?total:0,'USER_ENTERED'));return o;
   };
   const event=EventIntelligence.normalizeEvent({title:'Synthetic test concert',location:'Orlando, FL',city:'Orlando',start_date_time:'2026-10-31T19:00:00-04:00',end_date_time:'2026-10-31T21:00:00-04:00',timezone:'America/New_York',base_price:25,mandatory_fees:5,official_event_url:'https://example.invalid/test-only',category:'CONCERT'});
   t.transportation_options=[option('transport','Bus A',100),option('transport','Bus B',160)];t.lodging_options=[option('lodging','Stay A',200),option('lodging','Stay B',300)];t.events=[event];
   return t;
  });
  const upload=async trip=>{await page.locator('#importTrip').setInputFiles({name:'synthetic-test-trip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(trip))});await page.waitForFunction(()=>document.getElementById('persistenceStatus').textContent.includes('Trip uploaded.'));for(let i=0;i<8;i++)await page.locator('#nextStep').click();await page.locator('#trip-intake button[type=submit]').click();};
  await upload(fixture);
  check(await page.locator('#transportComparison .comparison-card').count()>0,width+' valid transport comparisons');
  check(await page.locator('#lodgingComparison .comparison-card').count()>0,width+' valid stay comparisons');
  check(!(await page.locator('#transportComparison').innerText()).includes('NOT ENOUGH'),width+' insufficient lenses omitted');
  check((await page.locator('#transportComparison').innerText()).includes('Bus A'),width+' actual cost winner');
  check(await page.locator('#eventsWorkspace').isVisible(),width+' selected events shown');
  check(await page.locator('#eventRecords .option-card').count()===1,width+' event retained');
  check((await page.locator('#eventRecords').innerText()).includes('Added by you'),width+' user event origin human-readable');
  check(!await page.locator('#eventRecords .method-notes').first().getAttribute('open'),width+' event provenance collapsed');
  await page.locator('#eventRecords .method-notes summary').first().click();check((await page.locator('#eventRecords').innerText()).includes('Source/freshness: USER ENTERED'),width+' verification truth retained in notes');await page.locator('#eventRecords .method-notes summary').first().click();
  await page.waitForFunction(()=>document.getElementById('fuelReferenceValue').textContent.includes('/ gal'));
  check(await page.locator('#fuelReference').isVisible(),width+' relevant fuel reference');
  check(!(await page.locator('#fuelReferenceMeta').isVisible()),width+' EIA provenance hidden by details');
  await page.locator('#fuelReference .method-notes summary').click();check((await page.locator('#fuelReferenceMeta').innerText()).includes('Retrieved:'),width+' EIA timestamps preserved');await page.locator('#fuelReference .method-notes summary').click();
  await noInternal('populated');
  // Incomplete quotes stay unpriced and hide all comparisons.
  const incomplete=JSON.parse(JSON.stringify(fixture));incomplete.transportation_options[1].costs.base_price={value:null,state:'UNKNOWN',source:null};
  await upload(incomplete);check(await page.locator('#transportComparison .comparison-card').count()===0,width+' incomplete prices fail closed');check(await page.locator('#transportComparison .comparison-empty').count()===1,width+' incomplete one action');
  const mixed=JSON.parse(JSON.stringify(fixture));mixed.lodging_options[1].currency='EUR';await upload(mixed);check(await page.locator('#lodgingComparison .comparison-card').count()===0,width+' currencies not mixed');check((await page.locator('#lodgingComparison').innerText()).includes('same currency'),width+' actionable currency state');
  await upload(fixture);
  await page.locator('#saveTrip').click();check((await page.locator('#persistenceStatus').innerText()).includes('saved'),width+' save works');
  await page.reload();await page.locator('#loadTrip').click();check((await page.locator('#persistenceStatus').innerText()).includes('loaded'),width+' load works');
  for(let i=0;i<8;i++)await page.locator('#nextStep').click();await page.locator('#trip-intake button[type=submit]').click();
  check(await page.locator('#eventRecords .option-card').count()===1,width+' events persist');check(await page.locator('#transportOptions .option-card').count()===2,width+' transport persists');check(await page.locator('#lodgingOptions .option-card').count()===2,width+' stays persist');
  const downloadPromise=page.waitForEvent('download');await page.locator('#exportTrip').click();const download=await downloadPromise;const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));check(exported.schema_version===3&&exported.events.length===1&&exported.transportation_options.length===2,width+' download preserves schema/options');
  await page.locator('#morePlanningTools summary').click();await page.locator('[data-workspace=events]').click();check(await page.locator('#eventsWorkspace').isVisible(),width+' manual planning tools available');
  await page.locator('#eventEditor summary').first().click();
  await page.locator('#event_title').fill('Synthetic CRUD test');await page.locator('#eventForm button[type=submit]').click();check(await page.locator('#eventRecords .option-card').count()===2,width+' add event');
  const added=page.locator('#eventRecords .option-card').filter({hasText:'Synthetic CRUD test'});await added.locator('.edit-event').click();await page.locator('#event_title').fill('Synthetic updated event');await page.locator('#eventForm button[type=submit]').click();check(await page.locator('#eventRecords .option-card').filter({hasText:'Synthetic updated event'}).count()===1,width+' edit event');
  await page.locator('#eventRecords .option-card').filter({hasText:'Synthetic updated event'}).locator('.remove-event').click();check(await page.locator('#eventRecords .option-card').count()===1,width+' remove event');
  await page.locator('#emergencyToggle').click();check(await page.locator('#emergencyPanel').isVisible(),width+' emergency immediately accessible');check((await page.locator('#emergencyPanel').innerText()).includes('contact local emergency services now'),width+' urgent safety content retained');check(await page.locator('#emergencyToggle').getAttribute('aria-expanded')==='true',width+' safety disclosure state');await page.locator('#emergencyToggle').click();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' populated fit');check(errors.length===0,width+' no browser errors '+errors.join(';'));
  await context.close();
 }
 console.log(count+' Plan My Trip Chromium checks passed at 360/390/412/1440px. Fixture imports are synthetic; external requests blocked.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
