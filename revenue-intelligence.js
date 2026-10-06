(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RevenueIntelligence=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CATEGORIES=['FLIGHTS','ACCOMMODATION','RENTAL_CARS','TRANSFERS','BUS_RAIL','CRUISES','ESIM','ACTIVITIES','TRAVEL_INSURANCE','FLIGHT_COMPENSATION'];
  const LOCAL_STATES=['VISITOR','PLANNER_ENGAGED','QUALIFIED_INTENT','MONETIZABLE_ACTION_AVAILABLE','PROVIDER_CLICK'];
  const MONEY_STATES=['ATTRIBUTED_BOOKING','COMMISSION_PENDING','PROVIDER_APPROVED','CLEARED_REVENUE','REVERSED','CANCELED'];
  const FUNNEL_STATES=[...LOCAL_STATES,...MONEY_STATES.slice(0,4)];
  const SIGNAL_TYPES=['PAGE_VIEWED','CALCULATOR_USED','PLANNER_STARTED','BLUEPRINT_GENERATED','TRANSPORT_COMPARISON_VIEWED','LODGING_COMPARISON_VIEWED','EVENT_MATCH_VIEWED','CATEGORY_SELECTED','PROVIDER_ACTION_SHOWN','PROVIDER_ACTION_CLICKED'];
  const DIMENSIONS=['category','trip_purpose','date_horizon','budget_band','group_size_band','transport_interest','lodging_interest','event_interest','seasonal_theme','source_page'];
  // No free-text destination, title, or notes are captured: those fields can contain
  // private addresses, names, health information, or contact details.
  const VALUES={trip_purpose:['FRIENDS','COUPLE','FAMILY','SOLO','BUSINESS','REUNION','EVENT','CULTURE','OUTDOOR','CRUISE','OTHER','UNKNOWN'],date_horizon:['PAST','0_7_DAYS','8_30_DAYS','31_90_DAYS','90_PLUS_DAYS','UNKNOWN'],budget_band:['UNSET','UNDER_500','500_1999','2000_4999','5000_PLUS'],group_size_band:['SOLO','2','3_5','6_PLUS','UNKNOWN'],transport_interest:['DRIVE','FLIGHT','RENTAL_CAR','BUS_RAIL','CRUISE','COMPARE','OTHER','UNKNOWN'],lodging_interest:['HOTEL','RENTAL','CABIN','RESORT','HOSTEL','NONE','COMPARE','UNKNOWN'],event_interest:['YES','NO','UNKNOWN']};
  const SEASONS=['NEW_YEAR','VALENTINES','SPRING_BREAK','MARDI_GRAS','EASTER_SPRING','MEMORIAL_DAY','PRIDE_MONTH','JUNETEENTH','JULY_4','LABOR_DAY','HALLOWEEN','THANKSGIVING','CHRISTMAS','HOLIDAY_LIGHTS','NEW_YEARS_EVE','FALL_FESTIVAL','SUMMER','WINTER','OTHER'];
  const PAGES=['/','/plan-my-trip/','/gas-trip-calculator/','/road-trip-cost-calculator/','/rental-car-trip-cost/','/airport-transfer-cost-planner/','/flight-cost-planner/','/travel-esim-cost-planner/','/travel-activities-budget/','/luggage-storage-cost-planner/','/travel-insurance-guide/','/flight-delay-compensation-guide/','/revenue-dashboard/'];
  const DEMAND_KEY='suitcase-brain.demand.v1',REPORT_KEY='suitcase-brain.reports.v1',CONSENT_KEY='suitcase-brain.demand-consent.v1';
  const MAX_EVENTS=1000,MAX_REPORTS=1000;
  const trustedActions=new WeakSet(),trustedReports=new WeakSet();
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const uid=()=>globalThis.crypto?.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const numeric=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
  const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
  const stamp=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(x)&&date(x.slice(0,10))&&Number.isFinite(Date.parse(x));
  const safeToken=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,100}$/.test(x);
  function exactKeys(x,keys){return object(x)&&Object.keys(x).every(k=>keys.includes(k));}
  function httpsUrl(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch(_){return null;}}
  function pagePath(path){const p=String(path||'').split(/[?#]/)[0].replace(/^\/money-os-road-trip-planner(?=\/|$)/,'')||'/';return PAGES.includes(p)?p:'/';}
  function validateDimensions(d){
    if(!exactKeys(d,DIMENSIONS))return false;
    return Object.entries(d).every(([k,v])=>k==='category'?CATEGORIES.includes(v):k==='source_page'?PAGES.includes(v):k==='seasonal_theme'?SEASONS.includes(v):VALUES[k]?.includes(v));
  }
  function contextDimensions(trip={},now=Date.now()){
    const purposes={'Friends getaway':'FRIENDS','Couple / romantic':'COUPLE','Family vacation':'FAMILY','Solo trip':'SOLO','Business trip':'BUSINESS','Reunion':'REUNION','Festival / concert / event':'EVENT','Culture / heritage':'CULTURE','Adventure / outdoors':'OUTDOOR','Cruise':'CRUISE'};
    const transport={'Drive':'DRIVE','Fly':'FLIGHT','Rental car':'RENTAL_CAR','Bus / rail':'BUS_RAIL','Cruise':'CRUISE','compare':'COMPARE'};
    const lodging={'Hotel':'HOTEL','Apartment / vacation rental':'RENTAL','Cabin':'CABIN','Resort':'RESORT','Hostel / budget':'HOSTEL','No lodging':'NONE','compare':'COMPARE'};
    const amount=trip.budget?.total,count=trip.traveler_count;
    const start=date(trip.dates?.start)?Date.parse(trip.dates.start+'T00:00:00Z'):NaN;
    const days=Math.ceil((start-now)/86400000);
    return {trip_purpose:purposes[trip.identity?.purpose]||(trip.identity?.purpose?'OTHER':'UNKNOWN'),date_horizon:!Number.isFinite(days)?'UNKNOWN':days<0?'PAST':days<=7?'0_7_DAYS':days<=30?'8_30_DAYS':days<=90?'31_90_DAYS':'90_PLUS_DAYS',budget_band:!numeric(amount)||amount===0?'UNSET':amount<500?'UNDER_500':amount<2000?'500_1999':amount<5000?'2000_4999':'5000_PLUS',group_size_band:!Number.isInteger(count)||count<1?'UNKNOWN':count===1?'SOLO':count===2?'2':count<=5?'3_5':'6_PLUS',transport_interest:transport[trip.preferences?.transport]||'UNKNOWN',lodging_interest:lodging[trip.preferences?.lodging]||'UNKNOWN',event_interest:Array.isArray(trip.preferences?.interests)?trip.preferences.interests.includes('Events')?'YES':'NO':'UNKNOWN'};
  }
  function classifyIntent(type,context={},eligible=false){
    if(eligible&&type==='PROVIDER_ACTION_CLICKED')return{level:'MONETIZABLE_INTENT',reasons:['Selected a runtime-eligible provider action; no booking or revenue is inferred.']};
    if(type==='BLUEPRINT_GENERATED'&&context.destination_known===true&&context.dates_known===true&&context.budget_known===true)return{level:'HIGH_INTENT',reasons:['Valid blueprint includes destination, dates, and a positive budget.']};
    if(['TRANSPORT_COMPARISON_VIEWED','LODGING_COMPARISON_VIEWED','EVENT_MATCH_VIEWED'].includes(type))return{level:'COMPARING',reasons:['Viewed a populated comparison or event match.']};
    if(['CALCULATOR_USED','PLANNER_STARTED','BLUEPRINT_GENERATED','CATEGORY_SELECTED'].includes(type))return{level:'PLANNING',reasons:['Used a planning tool or selected a travel need.']};
    return{level:'BROWSING',reasons:['Local page or action visibility only.']};
  }
  function validateRegistry(registry){
    const errors=[];
    if(!object(registry)||registry.version!==1||!Array.isArray(registry.opportunities))return{valid:false,errors:['Invalid monetization registry.']};
    const seen=new Set(),seenIds=new Set();
    registry.opportunities.forEach(r=>{
      if(!object(r)||!safeToken(r.id)||seenIds.has(r.id)||!CATEGORIES.includes(r.category)||seen.has(r.category))errors.push('Invalid or duplicate opportunity.');
      seen.add(r?.category);seenIds.add(r?.id);
      if(!['TRAVELPAYOUTS_DRIVE','VERIFIED_DIRECT','NOT_CONFIGURED'].includes(r?.monetization_surface)||!['DRIVE_INSTALLED_PROGRAM_UNKNOWN','APPROVED','UNKNOWN','NOT_APPROVED'].includes(r?.provider_relationship_status))errors.push('Invalid relationship/surface.');
      if(typeof r?.verified_direct_url_available!=='boolean'||![true,false,null].includes(r?.Travelpayouts_Drive_eligible)||typeof r?.source_of_truth!=='string'||!date(r?.last_verified)||typeof r?.notes!=='string'||typeof r?.action_label!=='string'||!PAGES.includes(r?.planning_path)||!httpsUrl(r?.documentation_url))errors.push('Missing opportunity evidence or safe routing metadata.');
      // Declarative JSON never supplies a clickable affiliate URL. Runtime adapters
      // must verify account approval and the exact URL independently.
      if(r?.direct_url||r?.affiliate_url||r?.verified_direct_url_available&&r?.provider_relationship_status!=='APPROVED')errors.push('Unverified direct URL claim.');
    });
    if(CATEGORIES.some(c=>!seen.has(c)))errors.push('Missing category.');
    return{valid:!errors.length,errors};
  }
  function createProviderAction(input,context={}){
    const surface=input?.surface||'VERIFIED_DIRECT';
    if(context.trusted!==true||!object(input)||!CATEGORIES.includes(input.category)||!httpsUrl(input.url)||input.relationship_status!=='APPROVED'||!safeToken(input.provider)||!stamp(input.verified_at)||!['TRAVELPAYOUTS_DRIVE','VERIFIED_DIRECT'].includes(surface))throw Error('Provider action requires runtime verification, an approved relationship, a recognized surface, and HTTPS.');
    const action=Object.freeze({id:uid(),category:input.category,url:httpsUrl(input.url),provider:input.provider,surface,verified_at:input.verified_at});
    trustedActions.add(action);return action;
  }
  function actionUrl(action){return trustedActions.has(action)?action.url:null;}
  function selectTripCategories(trip={},explicit=[]){
    const selected=new Set(explicit.filter(c=>CATEGORIES.includes(c)));
    const p=trip.preferences||{};
    if(p.transport==='Fly')selected.add('FLIGHTS');
    if(p.transport==='Rental car')selected.add('RENTAL_CARS');
    if(p.transport==='Bus / rail')selected.add('BUS_RAIL');
    if(p.transport==='Cruise'||trip.identity?.purpose==='Cruise')selected.add('CRUISES');
    if(p.lodging&& !['compare','No lodging'].includes(p.lodging))selected.add('ACCOMMODATION');
    if((p.interests||[]).includes('Events')||(trip.events||[]).length)selected.add('ACTIVITIES');
    // International status, insurance interest, and disruption eligibility cannot
    // be inferred reliably from free-text locations or personal/emergency notes.
    return CATEGORIES.filter(c=>selected.has(c));
  }
  function makeDemandEvent(type,dimensions={},context={},action=null,now=new Date().toISOString()){
    if(!SIGNAL_TYPES.includes(type)||!validateDimensions(dimensions)||!stamp(now))throw Error('Invalid or privacy-sensitive demand event.');
    const eligible=!!actionUrl(action);
    if(['PROVIDER_ACTION_SHOWN','PROVIDER_ACTION_CLICKED'].includes(type)&&(!eligible||dimensions.category!==action.category))throw Error('Provider signal needs a matching runtime-eligible action.');
    const intent=classifyIntent(type,context,eligible);
    const state=type==='PAGE_VIEWED'?'VISITOR':type==='PROVIDER_ACTION_SHOWN'?'MONETIZABLE_ACTION_AVAILABLE':type==='PROVIDER_ACTION_CLICKED'?'PROVIDER_CLICK':intent.level==='HIGH_INTENT'?'QUALIFIED_INTENT':type==='PLANNER_STARTED'?'PLANNER_ENGAGED':null;
    return{id:uid(),timestamp:now,type,state,intent_level:intent.level,reasons:intent.reasons,dimensions:{...dimensions},provider:eligible?action.provider:null,origin:'LOCAL_BROWSER',acquisition:'UNKNOWN'};
  }
  function validateDemandEvent(e){
    const keys=['id','timestamp','type','state','intent_level','reasons','dimensions','provider','origin','acquisition'];
    if(!exactKeys(e,keys)||!safeToken(e.id)||!stamp(e.timestamp)||!SIGNAL_TYPES.includes(e.type)||!validateDimensions(e.dimensions)||e.origin!=='LOCAL_BROWSER'||e.acquisition!=='UNKNOWN')return false;
    const providerType=['PROVIDER_ACTION_SHOWN','PROVIDER_ACTION_CLICKED'].includes(e.type);
    if(providerType?(!safeToken(e.provider)||!CATEGORIES.includes(e.dimensions.category)):e.provider!==null)return false;
    const high=e.type==='BLUEPRINT_GENERATED'&&e.intent_level==='HIGH_INTENT';
    const expected=classifyIntent(e.type,high?{destination_known:true,dates_known:true,budget_known:true}:{},providerType);
    const state=e.type==='PAGE_VIEWED'?'VISITOR':e.type==='PROVIDER_ACTION_SHOWN'?'MONETIZABLE_ACTION_AVAILABLE':e.type==='PROVIDER_ACTION_CLICKED'?'PROVIDER_CLICK':high?'QUALIFIED_INTENT':e.type==='PLANNER_STARTED'?'PLANNER_ENGAGED':null;
    return e.state===state&&e.intent_level===expected.level&&JSON.stringify(e.reasons)===JSON.stringify(expected.reasons);
  }

  function demandStore(storage){
    const read=()=>{const raw=storage.getItem(DEMAND_KEY);if(!raw)return[];const data=JSON.parse(raw);if(!Array.isArray(data)||data.length>MAX_EVENTS||!data.every(validateDemandEvent))throw Error('Local funnel history is malformed; clear it to start again.');return data;};
    return{read,append(event){if(!validateDemandEvent(event))throw Error('Invalid demand event.');const data=read();data.push(clone(event));storage.setItem(DEMAND_KEY,JSON.stringify(data.slice(-MAX_EVENTS)));return event;},clear(){storage.removeItem(DEMAND_KEY);},export(){return JSON.stringify({version:1,label:'LOCAL BROWSER SIGNALS — diagnostic activity, not revenue or unique visitors',events:read()},null,2);}};
  }
  const REPORT_FIELDS=['id','provider','category','external_reference','booking_date','commission_currency','commission_amount','state','reported_at','cleared_at','evidence_source','record_origin'];
  function validateReport(r){
    const errors=[];
    if(!exactKeys(r,REPORT_FIELDS))return{valid:false,errors:['Unexpected or privacy-sensitive provider-report fields.']};
    if(!safeToken(r.id)||!safeToken(r.provider)||!CATEGORIES.includes(r.category)||!(r.external_reference===null||safeToken(r.external_reference))||!date(r.booking_date)||!/^[A-Z]{3}$/.test(r.commission_currency||'')||!(r.commission_amount===null||numeric(r.commission_amount))||!MONEY_STATES.includes(r.state)||!stamp(r.reported_at)||!(r.cleared_at===null||stamp(r.cleared_at))||!safeToken(r.evidence_source)||!['USER_IMPORTED','PROVIDER_REPORTED'].includes(r.record_origin))errors.push('Invalid provider report.');
    if(numeric(r.commission_amount)&&r.commission_amount>Number.MAX_SAFE_INTEGER/(100*MAX_REPORTS))errors.push('Commission amount exceeds safe ledger precision.');
    if(['COMMISSION_PENDING','PROVIDER_APPROVED','CLEARED_REVENUE'].includes(r.state)&&!numeric(r.commission_amount))errors.push('Commission state requires a known nonnegative amount.');
    if(r.state==='CLEARED_REVENUE'&&r.commission_currency==='USD'&&numeric(r.commission_amount)&&Math.abs(r.commission_amount*100-Math.round(r.commission_amount*100))>0.000001)errors.push('USD payout receipt must use whole cents.');
    if(r.state==='CLEARED_REVENUE'&&!stamp(r.cleared_at))errors.push('Cleared revenue requires its actual cleared date.');
    if(r.cleared_at&&r.state!=='CLEARED_REVENUE')errors.push('Only cleared reports may have cleared_at.');
    if(stamp(r.reported_at)&&date(r.booking_date)&&r.booking_date>r.reported_at.slice(0,10))errors.push('Booking date cannot follow report date.');
    if(r.cleared_at&&Date.parse(r.cleared_at)>Date.parse(r.reported_at))errors.push('Cleared date cannot follow report date.');
    if(r.cleared_at&&r.cleared_at.slice(0,10)<r.booking_date)errors.push('Cleared date cannot precede booking date.');
    return{valid:!errors.length,errors};
  }
  function importReports(input){
    if(!exactKeys(input,['version','records'])||input.version!==1||!Array.isArray(input.records)||input.records.length>MAX_REPORTS)throw Error('Expected version 1 with a records array.');
    const seen=new Set();
    return input.records.map(r=>{const v=validateReport(r);if(!v.valid)throw Error(v.errors.join(' '));const key=r.provider+'|'+(r.external_reference||r.id);if(seen.has(key))throw Error('Duplicate provider reference. Supply one latest state per booking/commission.');seen.add(key);return{...clone(r),record_origin:'USER_IMPORTED'};});
  }
  function verifyProviderReport(input,context={}){
    if(input?.state==='CLEARED_REVENUE'&&context.evidenceKind!=='PAYOUT_RECEIPT')throw Error('Cleared proof needs an actual payout receipt, not a confirmed booking.');
    if(context.trusted!==true)throw Error('Only a verified provider adapter may supply revenue proof.');
    const r={...input,record_origin:'PROVIDER_REPORTED'},v=validateReport(r);if(!v.valid)throw Error(v.errors.join(' '));const result=Object.freeze(r);trustedReports.add(result);return result;
  }
  function reportStore(storage){return{read(){const raw=storage.getItem(REPORT_KEY);return raw?importReports(JSON.parse(raw)):[];},replace(input){const records=importReports(input);storage.setItem(REPORT_KEY,JSON.stringify({version:1,records}));return records;},clear(){storage.removeItem(REPORT_KEY);},export(){return JSON.stringify({version:1,records:this.read()},null,2);}};}
  function latestReports(records){
    const map=new Map();
    records.filter(r=>validateReport(r).valid).forEach(r=>{const key=r.provider+'|'+(r.external_reference||r.id);const prior=map.get(key);if(!prior||Date.parse(r.reported_at)>=Date.parse(prior.reported_at))map.set(key,r);});
    return [...map.values()];
  }
  function moneySummary(records){
    const emptyCounts=()=>Object.fromEntries(MONEY_STATES.map(s=>[s,0]));
    const result={verifiedClearedByCurrency:{},importedClearedByCurrency:{},counts:emptyCounts(),verifiedCounts:emptyCounts(),importedCounts:emptyCounts(),verifiedCount:0,importedCount:0};
    latestReports(records).forEach(r=>{const trusted=trustedReports.has(r);result.counts[r.state]++;result[trusted?'verifiedCounts':'importedCounts'][r.state]++;result[trusted?'verifiedCount':'importedCount']++;
      if(r.state==='CLEARED_REVENUE'){const target=trusted?result.verifiedClearedByCurrency:result.importedClearedByCurrency;target[r.commission_currency]=(target[r.commission_currency]||0)+r.commission_amount;}});
    return result;
  }
  function isTrustedReport(report){return trustedReports.has(report);}
  function milestones(events=[],records=[]){
    const local=events.filter(validateDemandEvent),proof=latestReports(records).filter(r=>trustedReports.has(r));
    const cleared=proof.filter(r=>r.state==='CLEARED_REVENUE'&&r.commission_amount>0);
    const usd=cleared.filter(r=>r.commission_currency==='USD');
    const total=usd.reduce((n,r)=>n+Math.round(r.commission_amount*100),0)/100;
    const days=[...new Set(usd.map(r=>r.cleared_at.slice(0,10)))].sort();
    const daySet=new Set(days);
    const recurringDaily=days.some(day=>Array.from({length:7},(_,i)=>new Date(Date.parse(day+'T00:00:00Z')+i*86400000).toISOString().slice(0,10)).every(d=>daySet.has(d)));
    const weeks=[...new Set(usd.map(r=>Math.floor((Date.parse(r.cleared_at.slice(0,10)+'T00:00:00Z')-Date.parse('1970-01-05T00:00:00Z'))/(7*86400000))))];
    const recurringWeekly=weeks.some(w=>[w,w+1,w+2,w+3].every(x=>weeks.includes(x)));
    return[{name:'FIRST ORGANIC VISITOR',achieved:false,reason:'Organic acquisition and unique visitors are not verified by local page activity.'},
      {name:'FIRST QUALIFIED INTENT',achieved:local.some(e=>e.state==='QUALIFIED_INTENT'),reason:'Local valid blueprint with destination, dates, budget.'},
      {name:'FIRST ELIGIBLE PROVIDER CLICK',achieved:local.some(e=>e.state==='PROVIDER_CLICK'),reason:'Local runtime-eligible click only; not a booking.'},
      {name:'FIRST ATTRIBUTED BOOKING',achieved:proof.some(r=>!['REVERSED','CANCELED'].includes(r.state)),reason:'Requires verified provider-reported attribution.'},
      {name:'FIRST APPROVED COMMISSION',achieved:proof.some(r=>['PROVIDER_APPROVED','CLEARED_REVENUE'].includes(r.state)&&r.commission_amount>0),reason:'Requires verified provider approval.'},
      {name:'FIRST CLEARED DOLLAR',achieved:total>=1,reason:'Verified net-latest USD cleared reports only; no FX assumptions.'},
      {name:'FIRST $10 CLEARED',achieved:total>=10,reason:'Verified USD cleared total >= 10.'},
      {name:'FIRST $100 CLEARED',achieved:total>=100,reason:'Verified USD cleared total >= 100.'},
      {name:'FIRST RECURRING WEEKLY REVENUE',achieved:recurringWeekly,reason:'Positive verified USD clearing in four consecutive UTC Monday-based weeks.'},
      {name:'FIRST RECURRING DAILY REVENUE',achieved:recurringDaily,reason:'Positive verified USD clearing on seven consecutive UTC calendar days.'}];
  }
  function demandInsights(events){
    const valid=events.filter(validateDemandEvent),attention={},intent={},categories={},pages={},seasons={};
    valid.forEach(e=>{const target=['PAGE_VIEWED','PLANNER_STARTED','CALCULATOR_USED'].includes(e.type)?attention:intent;target[e.type]=(target[e.type]||0)+1;
      if(e.dimensions.category&&['CATEGORY_SELECTED','PROVIDER_ACTION_CLICKED'].includes(e.type)){const c=categories[e.dimensions.category]||{selections:0,providerClicks:0,highIntentActions:0};if(['HIGH_INTENT','MONETIZABLE_INTENT'].includes(e.intent_level))c.highIntentActions++;c[e.type==='CATEGORY_SELECTED'?'selections':'providerClicks']++;categories[e.dimensions.category]=c;}
      if(e.type==='PROVIDER_ACTION_CLICKED'){const p=e.dimensions.source_page||'/';pages[p]=(pages[p]||0)+1;}
      if(e.dimensions.seasonal_theme&&e.intent_level!=='BROWSING'){const s=e.dimensions.seasonal_theme;seasons[s]=(seasons[s]||0)+1;}});
    const observations=[];
    for(const [metric,label] of [['selections','travel-need selections'],['providerClicks','eligible provider clicks'],['highIntentActions','high-intent provider actions']]){const max=Math.max(0,...Object.values(categories).map(c=>c[metric]));if(max>0){const leaders=CATEGORIES.filter(c=>categories[c]?.[metric]===max);observations.push(`${leaders.join(' / ')} ${leaders.length>1?'tied for':'generated'} the most local ${label}: ${max}.`);}}
    for(const [theme,n] of Object.entries(seasons))observations.push(`${theme} appeared in ${n} local planning signal(s); repeated activity is counted, not national demand.`);
    return{label:'LOCAL BROWSER SIGNALS',attention,intent,categories,pages,seasons,observations,notes:'Activity counts are not unique visitors, national trends, bookings, or revenue. No destination text is retained.'};
  }
  // Repository coverage is a useful planning surface, not a provider approval claim.
  const MONEY_PAGES={FLIGHTS:'/flight-cost-planner/',ACCOMMODATION:'/plan-my-trip/',RENTAL_CARS:'/rental-car-trip-cost/',TRANSFERS:'/airport-transfer-cost-planner/',BUS_RAIL:'/plan-my-trip/',CRUISES:'/plan-my-trip/',ESIM:'/travel-esim-cost-planner/',ACTIVITIES:'/travel-activities-budget/',TRAVEL_INSURANCE:'/travel-insurance-guide/',FLIGHT_COMPENSATION:'/flight-delay-compensation-guide/'};
  function firstDollarReport(events=[],records=[],registry=null,runtimeActions=[]){
    const valid=events.filter(validateDemandEvent),proof=milestones(valid,records);
    const achieved=name=>proof.find(m=>m.name===name)?.achieved===true;
    const routes=new Set(runtimeActions.filter(a=>actionUrl(a)).map(a=>a.category));
    const insight=demandInsights(valid);
    const hasShown=valid.some(e=>e.type==='PROVIDER_ACTION_SHOWN');
    const stages=[
      ['NO TRAFFIC PROOF',!valid.some(e=>e.type==='PAGE_VIEWED'),'No opted-in local page activity recorded; organic/unique traffic remains UNKNOWN even when activity exists.'],
      ['NO QUALIFIED INTENT YET',!achieved('FIRST QUALIFIED INTENT'),'No local valid trip blueprint with destination, dates, and positive budget.'],
      ['NO ELIGIBLE PROVIDER ACTION',routes.size===0&&!hasShown,'No runtime-verified action currently registered and no eligible action visibility recorded. Independent Drive routing is not locally verified.'],
      ['NO PROVIDER CLICKS',!achieved('FIRST ELIGIBLE PROVIDER CLICK'),'No eligible provider click recorded locally; Drive reporting must be checked separately.'],
      ['BOOKING REPORT NOT CONNECTED',!records.some(isTrustedReport),'No runtime-verified provider report available. User imports are not a verified report connection.'],
      ['NO ATTRIBUTED BOOKING',!achieved('FIRST ATTRIBUTED BOOKING'),'No verified latest provider attribution evidence.'],
      ['NO APPROVED COMMISSION',!achieved('FIRST APPROVED COMMISSION'),'No verified positive approved commission.'],
      ['NO CLEARED REVENUE',!achieved('FIRST CLEARED DOLLAR'),'First cleared dollar requires at least USD 1 in verified payout receipts; other currencies are shown separately.']
    ];
    const blockers=stages.filter(([,blocked])=>blocked).map(([state,,reason])=>({state,reason}));
    const registryValid=validateRegistry(registry).valid;
    const gaps=CATEGORIES.map(category=>{
      const opportunity=registryValid?registry.opportunities.find(r=>r.category===category):null;
      const signals=valid.filter(e=>e.dimensions.category===category&&e.intent_level!=='BROWSING');
      const useful=!['BUS_RAIL','CRUISES'].includes(category);
      const providerPathVerified=routes.has(category);
      const path=providerPathVerified?'RUNTIME_VERIFIED':opportunity?.monetization_surface==='TRAVELPAYOUTS_DRIVE'?'DRIVE_ONLY_PROGRAM_UNKNOWN':'NOT_VERIFIED';
      const categoryProof=records.filter(r=>r.category===category&&isTrustedReport(r));
      const categoryMilestones=milestones(signals,categoryProof);
      const proven=name=>categoryMilestones.find(m=>m.name===name)?.achieved;
      const blocker=!useful?'PAGE_NEEDS_CONVERSION_WORK':!providerPathVerified?'PROVIDER_ACCESS_REQUIRED':!signals.some(e=>e.type==='PROVIDER_ACTION_CLICKED')?'NO_PROVIDER_CLICKS':!categoryProof.length?'BOOKING_REPORT_NOT_CONNECTED':!proven('FIRST ATTRIBUTED BOOKING')?'NO_ATTRIBUTED_BOOKING':!proven('FIRST APPROVED COMMISSION')?'NO_APPROVED_COMMISSION':!proven('FIRST CLEARED DOLLAR')?'NO_CLEARED_REVENUE':null;
      return {category,planning_page:MONEY_PAGES[category],existing_useful_page:useful,coverage:useful?'USEFUL_TOOL_OR_GUIDE':'GENERIC_TRIP_INTAKE_ONLY',monetization_path:path,provider_path_verified:providerPathVerified,local_intent_signals:signals.length,high_intent_actions:insight.categories[category]?.highIntentActions||0,provider_clicks:insight.categories[category]?.providerClicks||0,blocker,recommended_next_action:!useful?'Improve existing trip comparison content before adding provider routing.':!providerPathVerified?'Verify account program approval and exact permitted route; inspect Drive page reporting.':blocker==='NO_PROVIDER_CLICKS'?'Check action visibility after useful output with real opted-in usage.':blocker?'Reconcile legitimate provider booking and payout evidence.':'No missing stage in this current local proof chain; continue checking legitimate reports.'};
    });
    // Demand first, then missing route/coverage, then stable category order. No payout input.
    gaps.sort((a,b)=>b.local_intent_signals-a.local_intent_signals||Number(a.provider_path_verified)-Number(b.provider_path_verified)||Number(a.existing_useful_page)-Number(b.existing_useful_page)||CATEGORIES.indexOf(a.category)-CATEGORIES.indexOf(b.category));
    return {version:1,label:'LOCAL BROWSER SIGNALS + REPOSITORY COVERAGE — not national demand or accounting',first_blocker:blockers[0]?.state||null,blockers,gaps,clicks_by_page:insight.pages,milestones:proof.filter(m=>['FIRST QUALIFIED INTENT','FIRST ELIGIBLE PROVIDER CLICK','FIRST ATTRIBUTED BOOKING','FIRST APPROVED COMMISSION','FIRST CLEARED DOLLAR'].includes(m.name)),notes:'Runtime route availability is current-page/session evidence, not all account programs. Drive-only clicks are not observable here. Local data can be edited; report imports are unverified.'};
  }
  return{MONEY_PAGES,firstDollarReport,CATEGORIES,LOCAL_STATES,MONEY_STATES,FUNNEL_STATES,SIGNAL_TYPES,DIMENSIONS,VALUES,SEASONS,PAGES,DEMAND_KEY,REPORT_KEY,CONSENT_KEY,MAX_EVENTS,pagePath,contextDimensions,classifyIntent,validateRegistry,createProviderAction,actionUrl,selectTripCategories,makeDemandEvent,validateDemandEvent,demandStore,validateReport,importReports,verifyProviderReport,isTrustedReport,reportStore,latestReports,moneySummary,milestones,demandInsights};
});
