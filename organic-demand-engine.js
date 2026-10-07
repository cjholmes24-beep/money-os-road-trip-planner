(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./event-intelligence.js'):root.EventIntelligence);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OrganicDemandEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(E){
  'use strict';
  const BASE='https://cjholmes24-beep.github.io/money-os-road-trip-planner';
  const TYPES=['SEARCH_INTENT_GAP','CONTENT_DEPTH_GAP','INTERNAL_LINK_GAP','SEASONAL_DEMAND','EVENT_TRAVEL_DEMAND','MONETIZATION_ROUTE_GAP','SEARCH_METADATA_GAP','STALE_CONTENT','DISTRIBUTION_GAP','CONVERSION_GAP'];
  const STATUSES=['DISCOVERED','QUALIFIED','READY_FOR_CONTENT','READY_FOR_ENGINEERING','PUBLISHED','MEASURING','DEFERRED','REJECTED'];
  const FAMILIES={
    FLIGHTS:{page:'/flight-cost-planner/',terms:['true flight trip cost','flight baggage cost','flight seat fee planning','flight vs driving cost','airport transportation cost','family flight budget','group flight budget']},
    RENTAL_CARS:{page:'/rental-car-trip-cost/',terms:['rental car total cost','rental fees and taxes','rental car fuel cost','rental car parking cost','rental car vs other ground transport']},
    TRANSFERS:{page:'/airport-transfer-cost-planner/',terms:['airport transfer cost','airport shuttle cost','airport transportation budget','airport transfer for groups']},
    ESIM:{page:'/travel-esim-cost-planner/',terms:['travel esim cost','international data cost','esim vs roaming cost','travel phone data budget']},
    ACTIVITIES:{page:'/travel-activities-budget/',terms:['vacation activities budget','things to do budget','family activities budget','event trip spending']},
    TRAVEL_INSURANCE:{page:'/travel-insurance-guide/',terms:['travel insurance planning','travel insurance cost considerations','trip cancellation coverage questions','travel insurance exclusions checklist']},
    FLIGHT_COMPENSATION:{page:'/flight-delay-compensation-guide/',terms:['flight delay compensation','canceled flight compensation','passenger rights after delay','what information is needed for a compensation claim']},
    ACCOMMODATION:{page:'/plan-my-trip/',terms:['vacation budget planner','group trip cost planner','hotel total-cost comparison','trip cancellation exposure','group trip funding','trip contingency reserve']}
  };
  const MONEY_PAGES=Object.values(FAMILIES).map(f=>f.page);
  const ORIGINAL_PAGES=['/',...MONEY_PAGES,'/gas-trip-calculator/','/road-trip-cost-calculator/','/luggage-storage-cost-planner/'];
  const NEW_PAGE_CANDIDATES=[{page:'/flight-vs-driving-cost/',category:'FLIGHTS',intent_family:'flight vs driving cost',decision:'Distinct mode decision, not another airfare estimate.',capability:'Existing flight total plus TransportLodgingIntelligence.drivingFuelCost.',useful:true},
    {page:'/group-trip-budget-planner/',category:'ACCOMMODATION',intent_family:'group trip cost planner',decision:'Already covered by Plan My Trip group funding/dropout and quote workspaces.',useful:false},
    {page:'/rental-car-vs-airport-transfer/',category:'RENTAL_CARS',intent_family:'rental car vs other ground transport',decision:'Existing rental and transfer tools support manual comparison; defer separate page until evidence justifies it.',useful:false},
    {page:'/esim-vs-roaming-cost/',category:'ESIM',intent_family:'esim vs roaming cost',decision:'Existing eSIM page can explain plan-vs-roaming comparison without duplicating a page.',useful:false}];
  const SOURCES=['GOOGLE_SEARCH_CONSOLE','BING_WEBMASTER','OTHER_VERIFIED_SEARCH_REPORT'];
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const keys=(x,allowed)=>object(x)&&Object.keys(x).every(k=>allowed.includes(k));
  const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
  const normalize=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const idPart=x=>normalize(x).replaceAll(' ','-');
  const termCategory=term=>Object.keys(FAMILIES).find(c=>FAMILIES[c].terms.includes(term));
  function validateSearchImport(input,asOf=new Date().toISOString().slice(0,10)){
    if(!date(asOf)||!keys(input,['version','records'])||input.version!==1||!Array.isArray(input.records)||input.records.length>1000)throw Error('Expected version 1 and at most 1,000 aggregate records.');
    const seen=new Set();let window=null;
    const records=input.records.map(r=>{
      const fields=['query','page','impressions','clicks','average_position','date_range_start','date_range_end','source'];
      if(!keys(r,fields)||Object.keys(r).length!==fields.length)throw Error('Unexpected, missing, or sensitive search fields.');
      const category=termCategory(r.query);
      if(!category||![FAMILIES[category].page,...NEW_PAGE_CANDIDATES.filter(c=>c.useful&&c.category===category).map(c=>c.page)].includes(r.page))throw Error('Query must be an exact allowlisted planning intent with a matching local page; redact private/free-text queries and URLs.');
      if(!SOURCES.includes(r.source)||!date(r.date_range_start)||!date(r.date_range_end)||r.date_range_start>r.date_range_end||r.date_range_end>asOf)throw Error('Invalid report source or date window.');
      if(![r.impressions,r.clicks].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000)||r.clicks>r.impressions||!(r.average_position===null&&r.impressions===0||typeof r.average_position==='number'&&Number.isFinite(r.average_position)&&r.average_position>=1&&r.average_position<=10000))throw Error('Invalid aggregate metrics.');
      const current=[r.source,r.date_range_start,r.date_range_end].join('|');
      if(window&&window!==current)throw Error('Use one source/date window per import; do not sum overlapping reports.');window=current;
      const key=r.query+'|'+r.page;if(seen.has(key))throw Error('Duplicate search query/page.');seen.add(key);
      return Object.freeze({...r});
    });
    return Object.freeze({version:1,origin:'USER_IMPORTED_AGGREGATE_UNVERIFIED',records:Object.freeze(records)});
  }
  function acquisitionStatus(search=null,providerEvidence=false){
    const imported=search?.origin==='USER_IMPORTED_AGGREGATE_UNVERIFIED'&&Array.isArray(search.records)&&search.records.length>0;
    return {states:[imported?'SEARCH DATA IMPORTED':'SEARCH DATA NOT CONNECTED',...(providerEvidence?['TRAFFIC OBSERVED BY PROVIDER']:[]),'ORGANIC SOURCE UNVERIFIED'],note:'Imports are user-supplied aggregates, not a live API or independently verified acquisition. Provider activity does not establish Google/Bing traffic.'};
  }
  function seasonalWindows(asOf){
    if(!date(asOf))throw Error('Supply a valid analysis date.');
    const year=Number(asOf.slice(0,4)),day=Date.parse(asOf+'T00:00:00Z'),out=[];
    const nth=(y,m,weekday,n)=>{const first=new Date(Date.UTC(y,m-1,1));return 1+(weekday-first.getUTCDay()+7)%7+(n-1)*7;};
    for(const y of [year-1,year,year+1]){
      const lastMay=31-(new Date(Date.UTC(y,4,31)).getUTCDay()+6)%7;
      const defs=[['THANKSGIVING',11,nth(y,11,4,4),4,60,['FLIGHTS','TRANSFERS','RENTAL_CARS','TRAVEL_INSURANCE']],['CHRISTMAS',12,24,4,60,['FLIGHTS','TRANSFERS','ACCOMMODATION']],['NEW_YEARS',12,31,2,45,['FLIGHTS','ACTIVITIES','ACCOMMODATION']],['SPRING_BREAK',3,1,61,45,['FLIGHTS','ESIM','ACTIVITIES']],['MEMORIAL_DAY',5,lastMay-2,3,45,['RENTAL_CARS','ACCOMMODATION','ACTIVITIES']],['SUMMER_TRAVEL',6,1,92,60,['FLIGHTS','ESIM','ACTIVITIES']],['JULY_4',7,3,3,45,['RENTAL_CARS','ACTIVITIES']],['LABOR_DAY',9,nth(y,9,1,1)-2,3,45,['RENTAL_CARS','ACCOMMODATION']],['HALLOWEEN',10,15,17,45,['ACTIVITIES','ACCOMMODATION']],['FALL_TRAVEL',9,1,91,30,['RENTAL_CARS','ACTIVITIES']]];
      for(const [theme,m,d,length,lead,categories] of defs){const start=Date.UTC(y,m-1,d),end=start+(length-1)*86400000,leadStart=start-lead*86400000;if(day<leadStart||day>end)continue;
        out.push({theme,label:'SEASONAL PLANNING WINDOWS',phase:day<start?'LEAD':'ACTIVE',geography:'US calendar planning heuristic; spring break/local holidays vary',lead_start:new Date(leadStart).toISOString().slice(0,10),active_start:new Date(start).toISOString().slice(0,10),active_end:new Date(end).toISOString().slice(0,10),categories,pages:categories.map(c=>FAMILIES[c].page),intent_families:categories.map(c=>FAMILIES[c].terms[0])});
      }
    }
    return out.sort((a,b)=>a.active_start.localeCompare(b.active_start)||a.theme.localeCompare(b.theme));
  }
  function firstWeakStage(evidence={}){
    // No secret thresholds: owner/adapters must explicitly establish sufficient coverage
    // for a single aligned report window. Small or absent samples remain insufficient.
    if(evidence.traffic_sufficient!==true)return{stage:'TRAFFIC',focus:'DISCOVERY_CONTENT_DISTRIBUTION',reason:'Qualified traffic sufficiency is not established for a real aligned report window.'};
    if(evidence.qualified_intent_sufficient!==true)return{stage:'QUALIFIED_INTENT',focus:'CONVERSION',reason:'Enough traffic is reported, but qualified planning intent is not established.'};
    if(evidence.provider_clicks_sufficient!==true)return{stage:'PROVIDER_CLICK',focus:'CONVERSION_ROUTING',reason:'Inspect real action visibility, relevance and permitted routing before adding more pages.'};
    if(evidence.booking_observed!==true)return{stage:'BOOKING',focus:'PROVIDER_ACTION_FIT',reason:'Provider clicks are established but attribution/booking is not; check reporting delays and provider fit.'};
    if(evidence.approved_commission_observed!==true)return{stage:'APPROVED_COMMISSION',focus:'PROVIDER_REPORT_RECONCILIATION',reason:'Attribution alone does not establish approval.'};
    if(evidence.cleared_revenue_observed!==true)return{stage:'CLEARED_REVENUE',focus:'PAYOUT_RECONCILIATION',reason:'Approval is not actual cleared receipt.'};
    return{stage:'MEASURING',focus:'MEASURE_EXISTING_COVERAGE',reason:'Continue legitimate reports; no automatic claim of recurring revenue.'};
  }
  function rankOpportunities(opportunities,stage={stage:'TRAFFIC'}){
    const band=o=>{
      if(stage.stage==='TRAFFIC')return ['DISTRIBUTION_GAP','SEARCH_METADATA_GAP','INTERNAL_LINK_GAP','SEARCH_INTENT_GAP','CONTENT_DEPTH_GAP','SEASONAL_DEMAND','STALE_CONTENT','EVENT_TRAVEL_DEMAND'].includes(o.type)?0:1;
      if(['QUALIFIED_INTENT','PROVIDER_CLICK','BOOKING'].includes(stage.stage))return ['CONVERSION_GAP','MONETIZATION_ROUTE_GAP'].includes(o.type)?0:2;
      return o.type==='CONVERSION_GAP'?0:2;
    };
    return opportunities.slice().sort((a,b)=>band(a)-band(b)||Number(!!b.evidence.some(e=>e.kind==='USER_IMPORTED_SEARCH'))-Number(!!a.evidence.some(e=>e.kind==='USER_IMPORTED_SEARCH'))||Number(MONEY_PAGES.includes(b.target_page))-Number(MONEY_PAGES.includes(a.target_page))||({BLOCKER:0,WARNING:1,INFO:2}[a.freshness.severity]??2)-({BLOCKER:0,WARNING:1,INFO:2}[b.freshness.severity]??2)||a.id.localeCompare(b.id)).map((o,i)=>({...o,priority:i+1}));
  }
  function validateOpportunity(o){
    const fields=['id','type','target_page','category','intent_family','reason','evidence','priority','freshness','recommended_action','status','created_at','updated_at'];
    return keys(o,fields)&&Object.keys(o).length===fields.length&&/^[a-z0-9-]{1,200}$/.test(o.id)&&TYPES.includes(o.type)&&[...ORIGINAL_PAGES,...NEW_PAGE_CANDIDATES.filter(c=>c.useful).map(c=>c.page)].includes(o.target_page)&&Object.keys(FAMILIES).includes(o.category)&&FAMILIES[o.category].terms.includes(o.intent_family)&&typeof o.reason==='string'&&o.reason.length>0&&Array.isArray(o.evidence)&&o.evidence.length>0&&o.evidence.every(e=>keys(e,['kind','detail'])&&typeof e.kind==='string'&&typeof e.detail==='string')&&Number.isInteger(o.priority)&&o.priority>0&&keys(o.freshness,['as_of','basis','severity'])&&date(o.freshness.as_of)&&['BLOCKER','WARNING','INFO'].includes(o.freshness.severity)&&typeof o.freshness.basis==='string'&&typeof o.recommended_action==='string'&&STATUSES.includes(o.status)&&date(o.created_at)&&date(o.updated_at)&&o.created_at<=o.updated_at;
  }
  function generate({as_of,health={issues:[]},pages=[],registry=null,search=null,funnel={},events=[],trip=null,previous=null}={}){
    if(!date(as_of))throw Error('Supply analysis date.');
    if(search)search=validateSearchImport({version:1,records:search.records},as_of);
    const opportunities=[],stage=firstWeakStage(funnel);
    function add(type,page,category,term,reason,detail,action,kind='REPOSITORY',severity='INFO',status='QUALIFIED'){
      const id=idPart(type+' '+page+' '+term+' '+detail.slice(0,60));
      if(opportunities.some(o=>o.id===id))return;
      opportunities.push({id,type,target_page:page,category,intent_family:term,reason,evidence:[{kind,detail}],priority:1,freshness:{as_of,basis:kind,severity},recommended_action:action,status,created_at:as_of,updated_at:as_of});
    }
    for(const [category,family] of Object.entries(FAMILIES)){
      const page=pages.find(p=>p.path===family.page);
      if(!page){add('DISTRIBUTION_GAP',family.page,category,family.terms[0],'Priority page missing.','Missing local file.','Restore useful page and crawlable canonical.','REPOSITORY','BLOCKER','READY_FOR_ENGINEERING');continue;}
      for(const term of family.terms)if(!page.intent_families?.includes(term))add('CONTENT_DEPTH_GAP',family.page,category,term,'Intent family lacks an explicitly audited answer.','No visible data-intent-family answer for '+term,'Improve the existing answer only if its tool genuinely supports this question.','REPOSITORY','WARNING','READY_FOR_CONTENT');
      const opportunity=registry?.opportunities?.find(r=>r.category===category);
      if(opportunity?.verified_direct_url_available!==true)add('MONETIZATION_ROUTE_GAP',family.page,category,family.terms[0],'New direct route is not verified; existing Drive remains separate.','Registry has no account-verified direct action.','Inspect legitimate Drive/account reports and exact permitted route before adding any direct URL.','REPOSITORY','INFO','DEFERRED');
    }
    for(const issue of health.issues||[]){const category=Object.keys(FAMILIES).find(c=>FAMILIES[c].page===issue.page)||'FLIGHTS';add(issue.type||'DISTRIBUTION_GAP',issue.page&&[...ORIGINAL_PAGES,'/flight-vs-driving-cost/'].includes(issue.page)?issue.page:FAMILIES[category].page,category,FAMILIES[category].terms[0],issue.reason,issue.code,issue.action,'REPOSITORY',issue.severity||'BLOCKER','READY_FOR_ENGINEERING');}
    for(const window of seasonalWindows(as_of))for(const category of window.categories)add('SEASONAL_DEMAND',FAMILIES[category].page,category,FAMILIES[category].terms[0],window.label+': '+window.theme+' '+window.phase+'. Not observed search demand.',window.theme+' '+window.active_start+' to '+window.active_end,'Review existing cost/terms content and relevant internal links before this calendar window.','CALENDAR','INFO','READY_FOR_CONTENT');
    for(const candidate of NEW_PAGE_CANDIDATES.filter(c=>c.useful))if(!pages.some(p=>p.path===candidate.page))add('SEARCH_INTENT_GAP',FAMILIES[candidate.category].page,candidate.category,candidate.intent_family,candidate.decision,candidate.capability,'Consider '+candidate.page+' with original decision guidance and existing calculations; human review required.','CAPABILITY','WARNING','READY_FOR_CONTENT');
    for(const row of search?.records||[]){const category=termCategory(row.query);if(row.impressions>=20&&row.clicks/row.impressions<0.05)add('SEARCH_METADATA_GAP',row.page,category,row.query,'Imported report meets explicit snippet-review rule (>=20 impressions and <5% clicks); not a national trend.','User-supplied aggregate for one source/window. No live connection or independent verification.','Compare current visible answer with its title/description; do not promise a CTR improvement.','USER_IMPORTED_SEARCH','WARNING','READY_FOR_CONTENT');
      if(row.clicks>0)add('CONVERSION_GAP',row.page,category,row.query,'Real-report clicks claimed in import; provider conversion is UNKNOWN without aligned provider evidence.','User-supplied search clicks do not prove provider clicks or bookings.','Reconcile the same page/date window with legitimate provider reports before changing content.','USER_IMPORTED_SEARCH','INFO','MEASURING');
    }
    if(trip&&E&&E.validateEvents(events).valid)for(const match of E.matchTripEvents(trip,events)){const event=match.event;const upcoming=event.occurrences.some(o=>['UPCOMING','IN_PROGRESS'].includes(E.occurrenceTimeState(o,Date.parse(as_of+'T00:00:00Z'))));if(!upcoming||['STALE','UNKNOWN','UNVERIFIED SNAPSHOT'].includes(E.sourceState(event,Date.parse(as_of+'T00:00:00Z'))))continue;add('EVENT_TRAVEL_DEMAND','/travel-activities-budget/','ACTIVITIES','event trip spending','A valid known local event overlaps entered trip dates; no attendance/search-volume claim.','Existing Events matcher: '+match.reasons.join(', ')+'; '+E.sourceState(event,Date.parse(as_of+'T00:00:00Z')),'Review transportation/lodging/activity budget in the existing trip workspace; never automatically publish an event page.','LOCAL_EVENT','INFO','DEFERRED');}
    if(stage.stage!=='TRAFFIC')add('CONVERSION_GAP','/plan-my-trip/','ACCOMMODATION','vacation budget planner',stage.reason,'Aligned funnel sufficiency supplied by caller; not inferred from historical baseline.',stage.focus,'ALIGNED_FUNNEL','WARNING','READY_FOR_ENGINEERING');
    const ranked=rankOpportunities(opportunities,stage);
    // Ignore run-date-only differences. Preserve lifecycle dates for unchanged content.
    for(const o of ranked){const old=previous?.opportunities?.find(p=>p.id===o.id&&validateOpportunity(p));if(old&&old.created_at<=as_of){o.created_at=old.created_at;const clean=x=>JSON.stringify({...x,created_at:null,updated_at:null,freshness:{...x.freshness,as_of:null}});o.updated_at=clean(old)===clean(o)?old.updated_at:as_of;}}
    return{version:1,label:'DETERMINISTIC REPOSITORY OPPORTUNITIES — not traffic/search-volume data',analysis_date:as_of,earliest_weak_stage:stage,acquisition:acquisitionStatus(search),seasonal_windows:seasonalWindows(as_of),health,opportunities:ranked,new_page_policy:{maximum:4,candidates:NEW_PAGE_CANDIDATES},notes:'No live search/provider data connected. Calendar windows are planning heuristics. No automatic content publication or account scraping.'};
  }
  function validateReport(report){
    return object(report)&&report.version===1&&date(report.analysis_date)&&object(report.earliest_weak_stage)&&['TRAFFIC','QUALIFIED_INTENT','PROVIDER_CLICK','BOOKING','APPROVED_COMMISSION','CLEARED_REVENUE','MEASURING'].includes(report.earliest_weak_stage.stage)&&Array.isArray(report.opportunities)&&report.opportunities.every((o,i)=>validateOpportunity(o)&&o.priority===i+1)&&new Set(report.opportunities.map(o=>o.id)).size===report.opportunities.length&&report.new_page_policy?.maximum===4&&Array.isArray(report.seasonal_windows)&&report.seasonal_windows.every(w=>w.label==='SEASONAL PLANNING WINDOWS'&&date(w.lead_start)&&date(w.active_start)&&date(w.active_end)&&w.lead_start<=w.active_start&&w.active_start<=w.active_end)&&Array.isArray(report.health?.issues)&&report.health.new_page_count<=4&&Array.isArray(report.acquisition?.states)&&report.acquisition.states.every(s=>['SEARCH DATA NOT CONNECTED','SEARCH DATA IMPORTED','TRAFFIC OBSERVED BY PROVIDER','ORGANIC SOURCE UNVERIFIED'].includes(s));
  }
  function materialFingerprint(report){return JSON.stringify({...report,analysis_date:null,health:{...report.health,as_of:null},opportunities:report.opportunities.map(o=>({...o,created_at:null,updated_at:null,freshness:{...o.freshness,as_of:null}}))});}
  return{BASE,TYPES,STATUSES,FAMILIES,MONEY_PAGES,ORIGINAL_PAGES,NEW_PAGE_CANDIDATES,SOURCES,validateSearchImport,acquisitionStatus,seasonalWindows,firstWeakStage,rankOpportunities,validateOpportunity,validateReport,generate,materialFingerprint};
});
