const {chromium}=require('playwright'),assert=require('assert');
(async()=>{
 let count=0;const check=(v,m)=>{assert.ok(v,m);count++;};
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8000/')?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8000/');check(await page.locator('a[href="flight-vs-driving-cost/"]').count()===1,'homepage discovers new page');
 await page.locator('a[href="flight-vs-driving-cost/"]').click();check(await page.title()==='Flight vs Driving Cost: Compare the Same Trip | Suitcase Brain','distinct canonical question');
 check(!(await page.locator('#comparisonResults').isVisible()),'no result before input');
 await page.locator('#modeComparisonForm button[type=submit]').click();check((await page.locator('#comparisonError').innerText()).includes('UNKNOWN'),'missing input remains unknown');check(!(await page.locator('#comparisonResults').isVisible()),'invalid input no result');
 const values={comparisonFlight:'560',comparisonMiles:'600',comparisonMpg:'30',comparisonFuel:'4',comparisonExtras:'120'};
 for(const [id,value] of Object.entries(values))await page.locator('#'+id).fill(value);
 await page.locator('#modeComparisonForm button[type=submit]').click();check(await page.locator('#comparisonResults').isVisible(),'valid known scope result');
 check(await page.locator('#comparisonFuelResult').innerText()==='$80.00','reuses actual existing driving formula');check(await page.locator('#comparisonDriveResult').innerText()==='$200.00','known extras kept separate');check((await page.locator('#comparisonDifference').innerText()).includes('$360.00'),'scope arithmetic');check((await page.locator('#comparisonDifference').innerText()).includes('not verified savings'),'no invented savings');
 check(await page.locator('#comparisonResults a').count()===3,'next decisions existing tools');check(await page.locator('a.eligible-provider').count()===0,'no guessed provider URL');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'comparison mobile no overflow');
 await page.locator('#comparisonReset').click();check(!(await page.locator('#comparisonResults').isVisible()),'reset hides stale result');
 for(const [id,value] of Object.entries({...values,comparisonMiles:'0'}))await page.locator('#'+id).fill(value);
 await page.locator('#modeComparisonForm button[type=submit]').click();check(!(await page.locator('#comparisonResults').isVisible()),'zero distance gracefully rejected');check((await page.locator('#comparisonError').innerText()).includes('positive total miles'),'positive-distance boundary');
 for(const slug of ['flight-cost-planner','rental-car-trip-cost','airport-transfer-cost-planner','travel-esim-cost-planner','travel-activities-budget','travel-insurance-guide','flight-delay-compensation-guide','plan-my-trip']){
  await page.goto('http://127.0.0.1:8000/'+slug+'/');check(await page.locator('.organic-depth [data-intent-family]').count()>=4,'original visible coverage '+slug);await page.locator('.organic-depth details').first().locator('summary').click();check(await page.locator('.organic-depth details').first().locator('p').isVisible(),'readable FAQ '+slug);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'priority mobile fit '+slug);
 }
 for(const slug of ['flight-cost-planner','rental-car-trip-cost','airport-transfer-cost-planner','travel-esim-cost-planner','travel-activities-budget']){
  await page.goto('http://127.0.0.1:8000/'+slug+'/');await page.waitForSelector('.demand-category',{state:'attached'});
  check(!(await page.locator('[data-revenue-category]').isVisible()),'existing action initially hidden '+slug);
  for(const input of await page.locator('form input[type=number]').all())await input.fill('2');
  await page.locator('form button[type=submit]').click();check(await page.locator('[data-revenue-category]').isVisible(),'existing valid output/action '+slug);
  await page.locator('.reset').click();check(!(await page.locator('[data-revenue-category]').isVisible()),'existing reset boundary '+slug);
 }
 await page.goto('http://127.0.0.1:8000/revenue-dashboard/');await page.waitForSelector('#organicAcquisitionStates');
 check((await page.locator('#organicAcquisitionStates').innerText()).includes('SEARCH DATA NOT CONNECTED'),'truthful absent search');check((await page.locator('#organicAcquisitionStates').innerText()).includes('ORGANIC SOURCE UNVERIFIED'),'provider baseline not organic proof');
 check(!(await page.locator('body').innerText()).includes('12 unique visits'),'historical count not live display');
 const row={query:'true flight trip cost',page:'/flight-cost-planner/',impressions:40,clicks:1,average_position:8,date_range_start:'2026-09-01',date_range_end:'2026-09-30',source:'GOOGLE_SEARCH_CONSOLE'};
 async function importFile(input){await page.locator('#importSearchPerformance').setInputFiles({name:'test-only.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(input))});}
 await importFile({version:1,records:[row]});await page.waitForFunction(()=>document.getElementById('searchImportStatus').textContent.includes('accepted'));
 check((await page.locator('#organicAcquisitionStates').innerText()).includes('SEARCH DATA IMPORTED'),'explicit import state');check((await page.locator('#searchImportStatus').innerText()).includes('memory only'),'privacy no persistence');
 check(await page.locator('#clearedRevenue').innerText()==='CLEARED REVENUE: $0','search clicks cannot create money');
 check(await page.evaluate(()=>!Object.keys(localStorage).some(k=>k.includes('search'))),'no search storage');
 await importFile({version:1,records:[{...row,email:'private@test.invalid'}]});await page.waitForFunction(()=>document.getElementById('searchImportStatus').textContent.includes('rejected'));
 check((await page.locator('#organicAcquisitionStates').innerText()).includes('SEARCH DATA IMPORTED'),'malformed import atomic');
 await page.locator('#clearSearchPerformance').click();check((await page.locator('#organicAcquisitionStates').innerText()).includes('SEARCH DATA NOT CONNECTED'),'clear returns absent connection');
 await importFile({version:1,records:[row]});await page.reload();check((await page.locator('#organicAcquisitionStates').innerText()).includes('SEARCH DATA NOT CONNECTED'),'reload drops private in-memory rows');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'dashboard mobile fit');
 check(errors.length===0,'no browser errors '+errors.join('; '));
 await page.locator('section').first().screenshot({path:'/tmp/organic-acquisition-mobile.png'});
 console.log(count+' organic Chromium mobile checks passed. All external requests blocked; imports are synthetic test fixtures.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
