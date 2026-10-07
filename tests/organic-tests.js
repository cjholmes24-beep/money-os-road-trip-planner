'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const O=require('../organic-demand-engine'),E=require('../event-intelligence'),{inspectSite,parsePage}=require('../scripts/organic-site-audit');
const registry=require('../data/monetization-opportunity-registry.json');
module.exports=async function(){
 let count=0;const eq=(a,b,m)=>{assert.deepStrictEqual(a,b,m);count++;},ok=(v,m)=>{assert.ok(v,m);count++;},throws=f=>{assert.throws(f);count++;};
 const root=path.resolve(__dirname,'..'),as_of='2026-10-06',snapshot=inspectSite(root,as_of);
 eq(snapshot.health.issues.filter(i=>i.severity==='BLOCKER'),[]);eq(snapshot.health.public_page_count,13);eq(snapshot.health.new_page_count,1);
 ok(snapshot.health.internal_link_graph.some(e=>e.from==='/'&&e.to==='/flight-vs-driving-cost/'));
 for(const page of snapshot.pages.filter(p=>!p.noindex)){eq(page.canonical,O.BASE+page.path);ok(snapshot.health.internal_link_graph.some(e=>e.to===page.path)||page.path==='/','No orphan '+page.path);}
 for(const page of O.MONEY_PAGES){const p=snapshot.pages.find(p=>p.path===page);eq(p.drive_count,1);ok(p.visible.includes('Affiliate disclosure'));const category=Object.keys(O.FAMILIES).find(c=>O.FAMILIES[c].page===page);O.FAMILIES[category].terms.forEach(t=>ok(p.intent_families.includes(t),'Visible coverage '+t));}
 const input={as_of,...snapshot,registry},report=O.generate(input);ok(report.opportunities.every(O.validateOpportunity));eq(report.opportunities.length,new Set(report.opportunities.map(o=>o.id)).size);
 eq(O.generate(input),report,'Deterministic analysis');
 eq(O.generate({...input,registry:{...registry,opportunities:registry.opportunities.map(r=>({...r,commission_amount:1000000}))}}),report,'Commission neutral');
 eq(O.materialFingerprint(O.generate({...input,as_of:'2026-10-07',health:{...snapshot.health,as_of:'2026-10-07'},previous:report})),O.materialFingerprint(report),'Timestamp-only day change is not material');
 const previous=O.generate({...input,previous:report});eq(previous.opportunities.map(o=>o.created_at),report.opportunities.map(o=>o.created_at));
 throws(()=>O.generate({...input,as_of:'2026-02-30'}));
 for(const bad of [{...report.opportunities[0],type:'FAKE_TRAFFIC'},{...report.opportunities[0],status:'EARNING'},{...report.opportunities[0],priority:0},{...report.opportunities[0],target_page:'https://example.com/'},{...report.opportunities[0],email:'secret@example.com'},{...report.opportunities[0],evidence:[]}])ok(!O.validateOpportunity(bad));
 ok(O.validateReport(report));ok(!O.validateReport({...report,version:2}));ok(!O.validateReport({...report,analysis_date:'future'}));ok(!O.validateReport({...report,new_page_policy:{maximum:100}}));
 eq(O.TYPES.length,10);eq(O.STATUSES.length,8);
 const seasons=O.seasonalWindows(as_of);eq(seasons.map(w=>w.theme),['FALL_TRAVEL','HALLOWEEN','THANKSGIVING']);ok(seasons.every(w=>w.label==='SEASONAL PLANNING WINDOWS'));
 eq(O.seasonalWindows('2026-11-26').find(w=>w.theme==='THANKSGIVING').phase,'ACTIVE');eq(O.seasonalWindows('2026-11-30').some(w=>w.theme==='THANKSGIVING'),false);
 eq(O.seasonalWindows('2026-01-01').find(w=>w.theme==='NEW_YEARS').active_start,'2025-12-31');
 eq(O.seasonalWindows('2026-05-25').find(w=>w.theme==='MEMORIAL_DAY').active_start,'2026-05-23');eq(O.seasonalWindows('2026-09-07').find(w=>w.theme==='LABOR_DAY').active_end,'2026-09-07');
 throws(()=>O.seasonalWindows('invalid'));
 ok(report.opportunities.every(o=>!/(trending|surging|people are searching)/i.test(o.reason)));
 ok(!JSON.stringify(report).includes('search_volume'));eq(report.acquisition.states,['SEARCH DATA NOT CONNECTED','ORGANIC SOURCE UNVERIFIED']);
 const row={query:'true flight trip cost',page:'/flight-cost-planner/',impressions:40,clicks:1,average_position:8,date_range_start:'2026-09-01',date_range_end:'2026-09-30',source:'GOOGLE_SEARCH_CONSOLE'};
 const envelope={version:1,records:[row]},search=O.validateSearchImport(envelope,as_of);eq(search.origin,'USER_IMPORTED_AGGREGATE_UNVERIFIED');eq(O.acquisitionStatus(search).states,['SEARCH DATA IMPORTED','ORGANIC SOURCE UNVERIFIED']);ok(O.acquisitionStatus(null,true).states.includes('TRAFFIC OBSERVED BY PROVIDER'));
 for(const bad of [{...row,email:'secret'},{...row,query:'john@example.com flight'},{...row,page:'/plan-my-trip/'},{...row,page:O.BASE+'/flight-cost-planner/?email=x'},{...row,clicks:41},{...row,clicks:-1},{...row,impressions:'40'},{...row,average_position:NaN},{...row,source:'GOOGLE_LIVE'},{...row,date_range_end:'2027-01-01'},{...row,date_range_start:'2026-02-30'},{...row,date_range_start:'2026-10-01'},{...row,names:[]}])throws(()=>O.validateSearchImport({version:1,records:[bad]},as_of));
 throws(()=>O.validateSearchImport({version:1,records:[row,row]},as_of));throws(()=>O.validateSearchImport({version:1,records:[row,{...row,query:'group flight budget',source:'BING_WEBMASTER'}]},as_of));throws(()=>O.validateSearchImport({version:2,records:[]},as_of));throws(()=>O.validateSearchImport({version:1,records:[...Array(1001)].map(()=>row)},as_of));
 const searched=O.generate({...input,search});ok(searched.opportunities.some(o=>o.type==='SEARCH_METADATA_GAP'));ok(searched.opportunities.some(o=>o.type==='CONVERSION_GAP'));eq(searched.earliest_weak_stage.stage,'TRAFFIC','An import cannot assert sufficient traffic');
 ok(!JSON.stringify(searched).includes('"impressions"'),'Public queue does not copy private metrics');
 eq(O.firstWeakStage({}).stage,'TRAFFIC');eq(O.firstWeakStage({traffic_sufficient:12}).stage,'TRAFFIC');eq(O.firstWeakStage({traffic_sufficient:true}).stage,'QUALIFIED_INTENT');
 const sufficient={traffic_sufficient:true,qualified_intent_sufficient:true};eq(O.firstWeakStage(sufficient).stage,'PROVIDER_CLICK');eq(O.firstWeakStage({...sufficient,provider_clicks_sufficient:true}).stage,'BOOKING');eq(O.firstWeakStage({...sufficient,provider_clicks_sufficient:true,booking_observed:true}).stage,'APPROVED_COMMISSION');eq(O.firstWeakStage({...sufficient,provider_clicks_sufficient:true,booking_observed:true,approved_commission_observed:true}).stage,'CLEARED_REVENUE');
 const later=O.generate({...input,funnel:sufficient});ok(['CONVERSION_GAP','MONETIZATION_ROUTE_GAP'].includes(later.opportunities[0].type),'Later funnel weakness outranks new content');
 const noDepth={...input,pages:snapshot.pages.map(p=>({...p,intent_families:[]}))};ok(O.generate(noDepth).opportunities.some(o=>o.type==='CONTENT_DEPTH_GAP'));
 const noComparison={...input,pages:snapshot.pages.filter(p=>p.path!=='/flight-vs-driving-cost/')};ok(O.generate(noComparison).opportunities.some(o=>o.type==='SEARCH_INTENT_GAP'));eq(report.new_page_policy.maximum,4);eq(O.NEW_PAGE_CANDIDATES.filter(c=>c.useful).length,1);
 const event=E.normalizeEvent({title:'Local test event',location:'Orlando',city:'Orlando',start_date_time:'2026-10-31T10:00:00Z',end_date_time:'2026-10-31T12:00:00Z'});
 const trip={destination:'Orlando',dates:{start:'2026-10-31',end:'2026-10-31'}};
 ok(O.generate({...input,events:[event],trip}).opportunities.some(o=>o.type==='EVENT_TRAVEL_DEMAND'));
 eq(O.generate({...input,events:[{...event,event_status:'CANCELED'}],trip}).opportunities.some(o=>o.type==='EVENT_TRAVEL_DEMAND'),false);
 eq(O.generate({...input,as_of:'2026-11-01',events:[event],trip}).opportunities.some(o=>o.type==='EVENT_TRAVEL_DEMAND'),false);
 eq(O.generate({...input,events:[{title:'malformed'}],trip}).opportunities.some(o=>o.type==='EVENT_TRAVEL_DEMAND'),false);
 const work=fs.mkdtempSync(path.join(os.tmpdir(),'organic-audit-'));try{
  for(const file of ['index.html','sitemap.xml','robots.txt','.github/workflows/indexnow-notify.yml','96df4ff75cc652635ffb9a6b80af194e.txt','data/eia-gas-latest.json']){const to=path.join(work,file);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(root,file),to);}
  for(const page of snapshot.pages.filter(p=>p.path!=='/')){const to=path.join(work,page.path,'index.html');fs.mkdirSync(path.dirname(to),{recursive:true});fs.writeFileSync(to,page.html);}
  const home=path.join(work,'index.html'),a=path.join(work,'flight-cost-planner/index.html'),b=path.join(work,'rental-car-trip-cost/index.html');
  const originalA=fs.readFileSync(a,'utf8'),originalB=fs.readFileSync(b,'utf8');
  fs.writeFileSync(a,originalA.replace(/<title>.*?<\/title>/,'<title>DUPLICATE</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Duplicate description">'));
  fs.writeFileSync(b,originalB.replace(/<title>.*?<\/title>/,'<title>DUPLICATE</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Duplicate description">'));
  let issues=inspectSite(work,as_of).health.issues;ok(issues.some(i=>i.code==='TITLE_DUPLICATE'));ok(issues.some(i=>i.code==='DESCRIPTION_DUPLICATE'));
  fs.writeFileSync(a,originalA.replace('rel="canonical"','rel="broken"').replace('tp-em.com/NTgxMDU0.js?t=581054','removed').replaceAll('Affiliate disclosure','No disclosure'));
  issues=inspectSite(work,as_of).health.issues;for(const code of ['CANONICAL_MISSING','DRIVE_LOADER','DISCLOSURE_MISSING'])ok(issues.some(i=>i.code===code));
  fs.writeFileSync(a,originalA+'<a href="../missing/">Broken</a><script type="application/ld+json">{"@type":"Offer","price":1}</script>');
  issues=inspectSite(work,as_of).health.issues;ok(issues.some(i=>i.code==='BROKEN_INTERNAL_LINK'));ok(issues.some(i=>i.code==='UNSUPPORTED_STRUCTURED_FACT'));
  fs.writeFileSync(a,originalA+'<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Invisible question?","acceptedAnswer":{"@type":"Answer","text":"Invisible answer."}}]}</script>');
  issues=inspectSite(work,as_of).health.issues;ok(issues.some(i=>i.code==='FAQ_NOT_VISIBLE'));ok(issues.some(i=>i.code==='FAQ_ANSWER_NOT_VISIBLE'));
  fs.writeFileSync(a,originalA);fs.writeFileSync(home,fs.readFileSync(home,'utf8').replaceAll('href="flight-vs-driving-cost/"','href="#"'));fs.writeFileSync(a,originalA.replaceAll('href="../flight-vs-driving-cost/"','href="#"'));const road=path.join(work,'road-trip-cost-calculator/index.html');fs.writeFileSync(road,fs.readFileSync(road,'utf8').replaceAll('href="../flight-vs-driving-cost/"','href="#"'));
  ok(inspectSite(work,as_of).health.issues.some(i=>i.code==='ORPHAN_PAGE'));
  for(let i=0;i<4;i++){const dir=path.join(work,'thin-'+i);fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'index.html'),'<title>Thin</title><p>Thin content</p>');}
  issues=inspectSite(work,as_of).health.issues;ok(issues.some(i=>i.code==='NEW_PAGE_LIMIT'));ok(issues.some(i=>i.code==='NEW_PAGE_QUALITY'));
  fs.unlinkSync(path.join(work,'robots.txt'));ok(inspectSite(work,as_of).health.issues.some(i=>i.code==='ROBOTS_CONFIGURATION'));
  fs.writeFileSync(path.join(work,'data/eia-gas-latest.json'),'corrupt');ok(inspectSite(work,as_of).health.issues.some(i=>i.code==='EIA_REFERENCE_REVIEW'));
 }finally{fs.rmSync(work,{recursive:true,force:true});}
 const baseline=fs.readFileSync(path.join(root,'docs/TRAFFIC_BASELINE_2026-10-06.md'),'utf8');ok(baseline.includes('12 unique visits'));ok(baseline.includes('not yet proven'));
 const code=fs.readFileSync(path.join(root,'organic-demand-engine.js'),'utf8')+fs.readFileSync(path.join(root,'organic-acquisition-ui.js'),'utf8');ok(!code.includes('Kiwi.com')&&!code.includes('12 unique visits'),'Provider baseline not hard-coded');
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/organic-demand-engine.yml'),'utf8');ok(workflow.includes('schedule:')&&workflow.includes('workflow_dispatch:'));ok(workflow.includes('contents: read'));ok(!/git (commit|push)|contents: write/.test(workflow));ok(workflow.includes('runner.temp'));
 throws(()=>cp.execFileSync(process.execPath,[path.join(root,'scripts/run-organic-demand.js'),'--search-file',path.join(root,'data/private-import-example/search-performance.example.json')],{stdio:'pipe'}));
 const page=parsePage('<title>x</title><script type="application/ld+json">bad json</script>','/');eq(page.schemas,[null]);
 return count;
};
