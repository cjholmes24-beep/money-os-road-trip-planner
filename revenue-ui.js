(function(){
  'use strict';
  const R=window.RevenueIntelligence;
  if(!R)return;
  const $=id=>document.getElementById(id);
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourcePage=R.pagePath(location.pathname);
  const scriptUrl=document.currentScript.src;
  const isDashboard=sourcePage==='/revenue-dashboard/';
  const actions=new Map();
  let registry=null,currentTrip=null,consent=false,engaged=false;
  let observed=new WeakSet(),runtimeVerifiedReports=[];
  let storage,ledger,reports;
  try{storage=window.localStorage;ledger=R.demandStore(storage);reports=R.reportStore(storage);consent=storage.getItem(R.CONSENT_KEY)==='yes';}catch(_){storage=null;}
  const labels={FLIGHTS:'Check flight options',ACCOMMODATION:'Compare places to stay',RENTAL_CARS:'Check rental options',TRANSFERS:'Check transfer options',BUS_RAIL:'Compare bus / rail options',CRUISES:'Prepare cruise comparison',ESIM:'Check eSIM options',ACTIVITIES:'Check activities',TRAVEL_INSURANCE:'Compare travel insurance needs',FLIGHT_COMPENSATION:'Check flight compensation eligibility'};
  const checklists={FLIGHTS:['Compare total fare, bags, seats, and airport access.','Verify change/cancellation rules before booking.'],ACCOMMODATION:['Compare total stay cost, mandatory fees, parking, and location fit.','Read the actual cancellation/deposit terms.'],RENTAL_CARS:['Include taxes, fuel, one-way and driver fees.','Verify insurance, deposit/hold and cancellation terms.'],TRANSFERS:['Compare group total, journeys, luggage and operating times.','Confirm meeting point and cancellation rules.'],BUS_RAIL:['Compare complete fare, baggage, and station access.','Confirm schedules with the actual operator.'],CRUISES:['Include port charges, gratuities and optional packages.','Check arrival buffers and cancellation terms.'],ESIM:['Check device/eSIM compatibility, destination coverage and data allowance.','Check validity, hotspot limits and activation timing.'],ACTIVITIES:['Check real dates, age/accessibility rules, mandatory fees and ticket terms.','Local entered events are not live ticket inventory.'],TRAVEL_INSURANCE:['Compare coverage limits, deductibles, covered reasons and exclusions.','Read the policy contract; no coverage is guaranteed.'],FLIGHT_COMPENSATION:['Check jurisdiction, delay/cancellation cause and actual eligibility.','Review provider fees and terms; no payout is promised.']};
  function status(message){if($('telemetryStatus'))$('telemetryStatus').textContent=message;if(isDashboard&&$('dashboardError'))$('dashboardError').textContent=message;}
  function record(type,category,trip=currentTrip,action=null){
    if(!consent||!ledger||isDashboard)return;
    try{
      const dimensions={...R.contextDimensions(trip||{}),source_page:sourcePage};
      if(category)dimensions.category=category;
      const theme=trip?.events?.flatMap(e=>e.seasonal_theme||[]).find(s=>R.SEASONS.includes(s));if(theme)dimensions.seasonal_theme=theme;
      const context={destination_known:!!trip?.destination?.trim()&&!trip?.destination_unknown,dates_known:!!trip?.dates?.start&&!!trip?.dates?.end,budget_known:typeof trip?.budget?.total==='number'&&trip.budget.total>0};
      ledger.append(R.makeDemandEvent(type,dimensions,context,action));
    }catch(_){status('Local diagnostics could not be saved. Planning still works; manage history in the dashboard.');}
  }
  const footer=document.querySelector('footer');
  if(footer){
    const notice=document.createElement('div');notice.className='local-telemetry';
    notice.innerHTML=`<strong>Optional local planning history</strong><p>Off by default. Saves broad activity and budget/date/group bands in this browser only. No names, destination text, exact address, or precise location. Existing Travelpayouts offers have separate affiliate processing.</p><label class="check"><input id="telemetryConsent" type="checkbox"> Save local planning history</label><p id="telemetryStatus" role="status"></p><a href="${new URL('revenue-dashboard/',scriptUrl).href}">View / clear / export local history and reports →</a>`;
    // The homepage keeps opt-in controls in its collapsed privacy settings.
    const privacyHost=$('homePrivacyControls');
    if(privacyHost){
      notice.querySelector('strong').textContent='Your planning history';
      notice.querySelector('p').textContent='Choose to save planning activity on this device. Off by default. We do not save names, destination details or precise location. Travel offer links have separate provider privacy practices.';
      notice.querySelector('a').textContent='Manage or delete saved history →';
    }
    (privacyHost||footer).appendChild(notice);$('telemetryConsent').checked=consent;
    $('telemetryConsent').disabled=!storage;
    $('telemetryConsent').onchange=()=>{try{consent=$('telemetryConsent').checked;storage.setItem(R.CONSENT_KEY,consent?'yes':'no');if(consent)observed=new WeakSet();status(consent?'Local history enabled. No data is sent to an analytics service.':'Local capture paused. Existing history can be cleared in the dashboard.');if(consent){record('PAGE_VIEWED');document.querySelectorAll('[data-provider-category],[data-comparison-type]').forEach(node=>{visibleObserver?.unobserve(node);visibleObserver?.observe(node);});}}catch(_){consent=false;$('telemetryConsent').checked=false;status('Browser storage unavailable.');}};
  }
  const visibleObserver=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting||observed.has(entry.target))return;
    const node=entry.target;
    if(node.dataset.comparisonType){
      const type=node.dataset.comparisonType;
      const ready=type==='TRANSPORT_COMPARISON_VIEWED'?(currentTrip?.transportation_options?.length||0)>=2:type==='LODGING_COMPARISON_VIEWED'?(currentTrip?.lodging_options?.length||0)>=2:node.querySelectorAll('article').length>0;
      if(!ready)return;observed.add(node);record(type);
    }else if(node.dataset.providerCategory){const action=actions.get(node.dataset.providerCategory);if(action&&node.href===R.actionUrl(action)){observed.add(node);record('PROVIDER_ACTION_SHOWN',action.category,currentTrip,action);}}
  }),{threshold:0.1}):null;
  function observeProviderActions(){document.querySelectorAll('[data-provider-category]').forEach(node=>visibleObserver?.observe(node));}
  function actionMarkup(category){
    const opportunity=registry?.opportunities.find(r=>r.category===category);
    if(!opportunity)return'';
    const action=actions.get(category),url=R.actionUrl(action);
    return `<article class="option-card"><h4>${escape(labels[category])}</h4><p>Use your result to compare the complete cost and terms before booking.</p>${opportunity.planning_path!==sourcePage?`<p><a href="${escape(new URL(opportunity.planning_path.slice(1),scriptUrl).href)}">${category==='ACCOMMODATION'?'Compare lodging quotes in Plan My Trip':'Open the relevant planning tool / guide'} →</a></p>`:''}<button class="secondary demand-category" data-category="${category}" type="button">Prepare comparison</button>${url?`<a class="primary button-link eligible-provider" href="${escape(url)}" data-provider-category="${category}" target="_blank" rel="sponsored noopener noreferrer">${escape(labels[category])} at ${escape(action.provider)} ↗</a>`:'<p class="source-note">No account-verified provider link is configured for this action. Existing Travelpayouts Drive may independently show eligible offers; appearance and attribution are not guaranteed. This checklist selection is not recorded as a provider click.</p>'}<p class="hint">Affiliate disclosure: an eligible provider booking may generate a commission at no extra cost. Verify final terms yourself.</p><div class="action-checklist" hidden><ul>${checklists[category].map(s=>`<li>${escape(s)}</li>`).join('')}</ul></div></article>`;
  }
  function renderTripActions(){
    if(!$('tripRevenueActions')||!currentTrip||!registry)return;
    const explicit=[...document.querySelectorAll('#explicitTravelNeeds input:checked')].map(x=>x.value);
    const categories=R.selectTripCategories(currentTrip,explicit);
    $('tripRevenueActions').innerHTML=categories.map(actionMarkup).join('')||'<p class="empty-state">No specific travel need selected. Choose a need if you want a comparison checklist.</p>';observeProviderActions();
  }
  function renderPageAction(){document.querySelectorAll('[data-revenue-category]').forEach(el=>{el.innerHTML=actionMarkup(el.dataset.revenueCategory);});observeProviderActions();}
  document.addEventListener('click',e=>{
    const categoryButton=e.target.closest('.demand-category');
    if(categoryButton){const panel=categoryButton.closest('article').querySelector('.action-checklist');panel.hidden=false;record('CATEGORY_SELECTED',categoryButton.dataset.category);}
    const link=e.target.closest('.eligible-provider');
    if(link){const action=actions.get(link.dataset.providerCategory);if(!action||link.href!==R.actionUrl(action)){e.preventDefault();return;}record('PROVIDER_ACTION_CLICKED',action.category,currentTrip,action);}
  });
  document.addEventListener('auxclick',e=>{if(e.button!==1)return;const link=e.target.closest('.eligible-provider'),action=actions.get(link?.dataset.providerCategory);if(link&&action&&link.href===R.actionUrl(action))record('PROVIDER_ACTION_CLICKED',action.category,currentTrip,action);});
  $('explicitTravelNeeds')?.addEventListener('change',renderTripActions);
  const intake=$('trip-intake');
  intake?.addEventListener('input',()=>{if(!engaged){engaged=true;record('PLANNER_STARTED');}});
  window.addEventListener('suitcasebrain:trip-replaced',()=>{currentTrip=null;actions.clear();if($('tripRevenueActions'))$('tripRevenueActions').innerHTML='<p>Build the current trip blueprint to refresh useful actions.</p>';if($('explicitTravelNeeds'))$('explicitTravelNeeds').querySelectorAll('input').forEach(x=>x.checked=false);});
  document.querySelector('.reset')?.addEventListener('click',()=>document.querySelectorAll('[data-revenue-category]').forEach(node=>{node.hidden=true;const section=node.closest('.next-decision');if(section)section.hidden=true;}));
  window.addEventListener('suitcasebrain:blueprint',e=>{actions.clear();currentTrip=e.detail;const T=window.TransportLodgingIntelligence;
    for(const option of [...(currentTrip.transportation_options||[]),...(currentTrip.lodging_options||[])]){
      const url=T?.bookingUrl(option),category=option.property?'ACCOMMODATION':{FLIGHT:'FLIGHTS',RENTAL_CAR:'RENTAL_CARS',AIRPORT_TRANSFER:'TRANSFERS',BUS:'BUS_RAIL',RAIL:'BUS_RAIL'}[option.mode];
      if(url&&category&&option.booking.relationship_status==='APPROVED'){try{const action=R.createProviderAction({category,url,provider:option.booking.provider,relationship_status:'APPROVED',verified_at:option.booking.last_verified},{trusted:true});actions.set(category,action);}catch(_){}}
    }
record('BLUEPRINT_GENERATED');renderTripActions();for(const [id,type] of [['transportComparison','TRANSPORT_COMPARISON_VIEWED'],['lodgingComparison','LODGING_COMPARISON_VIEWED'],['eventMatches','EVENT_MATCH_VIEWED']]){const node=$(id);if(node){node.dataset.comparisonType=type;visibleObserver?.unobserve(node);visibleObserver?.observe(node);}}});
  window.addEventListener('suitcasebrain:calculator-used',e=>{
    const category={flight:'FLIGHTS',rental:'RENTAL_CARS',transfer:'TRANSFERS',esim:'ESIM',activities:'ACTIVITIES'}[e.detail?.calculator];record('CALCULATOR_USED',category);
    document.querySelectorAll('[data-revenue-category]').forEach(node=>{node.hidden=false;const section=node.closest('.next-decision');if(section)section.hidden=false;});
  });
  window.addEventListener('storage',e=>{if(e.key===R.CONSENT_KEY){consent=e.newValue==='yes';if($('telemetryConsent'))$('telemetryConsent').checked=consent;}if(isDashboard&&[R.DEMAND_KEY,R.REPORT_KEY].includes(e.key))renderDashboard();});
  // Future verified provider adapters can register a runtime capability. Plain JSON,
  // href mutations, and generic third-party DOM observations never grant eligibility.
  window.RevenueActivation=Object.freeze({
    registerAction(action){
      if(!R.actionUrl(action))throw Error('Unverified provider action.');
      actions.set(action.category,action);renderPageAction();renderTripActions();renderDashboard();
    },
    registerProviderReports(records){
      if(!Array.isArray(records)||records.some(r=>!R.isTrustedReport(r)))throw Error('Only runtime-verified provider reports may be registered.');
      runtimeVerifiedReports=records.slice();
      renderDashboard();
    },
    clearProviderReports(){
      runtimeVerifiedReports=[];
      renderDashboard();
    }
  });
  function download(name,body){const url=URL.createObjectURL(new Blob([body],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function summaryCards(map){return Object.entries(map).map(([k,v])=>`<div><span>${escape(k.replaceAll('_',' '))}</span><strong>${v}</strong></div>`).join('')||'<p>No local activity.</p>';}
  function renderDashboard(){
    if(!isDashboard)return;
    let signals=[],importedMoney=[];
    const failures=[];try{signals=ledger?.read()||[];}catch(e){failures.push(e.message);}try{importedMoney=reports?.read()||[];}catch(e){failures.push(e.message);}$('dashboardError').textContent=failures.join(' ');
    const money=[...runtimeVerifiedReports,...importedMoney];
    const insight=R.demandInsights(signals),summary=R.moneySummary(money);
    const report=R.firstDollarReport(signals,money,registry,[...actions.values()]);
    $('firstDollarMilestones').innerHTML=report.milestones.map(m=>`<article><strong>${escape(m.name)}: ${m.achieved?'EVIDENCE RECORDED':'NOT PROVEN'}</strong></article>`).join('');
    $('moneyBlockers').innerHTML=`<p><strong>Earliest unproven stage: ${escape(report.first_blocker||'None in this local evidence chain')}</strong></p>`+report.blockers.map(b=>`<article><strong>${escape(b.state)}</strong><p>${escape(b.reason)}</p></article>`).join('');
    $('opportunityGaps').innerHTML=report.gaps.map(g=>`<article class="option-card"><h3>${escape(g.category)}</h3><p>Useful coverage: ${escape(g.coverage)} · Route: ${escape(g.monetization_path)} · Current runtime route verified: ${g.provider_path_verified?'YES':'NO'}</p><p>Local intent: ${g.local_intent_signals} · High-intent provider actions: ${g.high_intent_actions} · Eligible clicks: ${g.provider_clicks}</p><p>Blocker: ${escape(g.blocker)}</p><p>${escape(g.recommended_next_action)}</p><a href="${escape(new URL(g.planning_page.slice(1),scriptUrl).href)}">Review existing page →</a></article>`).join('');
    $('attentionSummary').innerHTML=summaryCards(insight.attention);$('intentSummary').innerHTML=summaryCards(insight.intent);
    $('demandInsights').innerHTML=Object.entries(insight.categories).map(([c,v])=>`<p>${escape(c)}: ${v.selections} need selection(s), ${v.providerClicks} eligible provider click(s).</p>`).join('')||'<p>No category selections recorded in this browser.</p>';
    $('demandInsights').innerHTML+=insight.observations.map(s=>`<p>${escape(s)}</p>`).join('');
    $('demandInsights').innerHTML+=Object.entries(insight.pages).map(([path,n])=>`<p>${escape(path)}: ${n} recorded eligible provider click(s) in this browser.</p>`).join('');
    const cleared=Object.entries(summary.verifiedClearedByCurrency).map(([c,n])=>`${n.toFixed(2)} ${c}`).join(' · ');
    $('clearedRevenue').textContent=`CLEARED REVENUE: ${cleared||'$0'}`;
    $('verifiedMoneySummary').innerHTML=summaryCards(summary.verifiedCounts);
    $('moneySummary').innerHTML=summaryCards(summary.importedCounts);
    $('importedMoney').textContent=`USER IMPORTED — UNVERIFIED claimed cleared totals: ${Object.entries(summary.importedClearedByCurrency).map(([c,n])=>`${n.toFixed(2)} ${c}`).join(' · ')||'None'}. These do not count as verified cleared revenue.`;
    $('providerReports').innerHTML=money.map(r=>{const trusted=R.isTrustedReport(r);return `<article class="option-card"><strong>${trusted?'PROVIDER REPORTED — RUNTIME VERIFIED':'USER IMPORTED — UNVERIFIED'}</strong><p>${escape(r.provider)} · ${escape(r.category)} · ${escape(r.state)} · ${r.commission_amount===null?'AMOUNT UNKNOWN':`${r.commission_amount.toFixed(2)} ${escape(r.commission_currency)}`}</p><p>Reported ${escape(r.reported_at)} · Evidence identifier ${escape(r.evidence_source)}. ${trusted?'Verified by the active provider adapter for this runtime.':'No independent verification.'}</p></article>`;}).join('')||'<p>No provider reports available.</p>';
    $('revenueMilestones').innerHTML=R.milestones(signals,money).map(m=>`<article><strong>${m.achieved?'LOCAL EVIDENCE RECORDED':'NOT PROVEN'} · ${escape(m.name)}</strong><p>${escape(m.reason)}</p></article>`).join('');
    $('funnelHistory').innerHTML=signals.slice().reverse().map(e=>`<li>${escape(e.timestamp)} · ${escape(e.type)} · ${escape(e.state||'LOCAL SIGNAL')} · ${escape(e.intent_level)} · ${escape(e.dimensions.category||'GENERAL')}<p>${escape(e.reasons.join(' '))}</p></li>`).join('')||'<li>No local funnel events.</li>';
  }
  if(isDashboard){
    $('importProviderReports').onchange=async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>1000000)throw Error('Report exceeds 1 MB.');if(!reports)throw Error('Browser storage unavailable.');reports.replace(JSON.parse(await file.text()));$('reportStatus').textContent='Redacted report imported locally as USER IMPORTED — UNVERIFIED. No verified money milestone was created.';renderDashboard();}catch(err){$('reportStatus').textContent=`Import rejected: ${err.message}`;}finally{e.target.value='';}};
    $('exportProviderReports').onclick=()=>{try{download('suitcase-brain-local-provider-reports.json',reports.export());}catch(e){status(e.message);}};
    $('clearProviderReports').onclick=()=>{try{reports.clear();renderDashboard();$('reportStatus').textContent='Local reports cleared.';}catch(e){status(e.message);}};
    $('exportOpportunityGaps').onclick=()=>{try{download('suitcase-brain-first-dollar-gaps.json',JSON.stringify(R.firstDollarReport(ledger.read(),[...runtimeVerifiedReports,...reports.read()],registry,[...actions.values()]),null,2));}catch(e){status(e.message);}};
    $('exportDemand').onclick=()=>{try{download('suitcase-brain-local-funnel.json',ledger.export());}catch(e){status(e.message);}};
    $('clearDemand').onclick=()=>{try{ledger.clear();renderDashboard();}catch(e){status(e.message);}};
    renderDashboard();
  }
  record('PAGE_VIEWED');
  fetch(new URL('data/monetization-opportunity-registry.json',scriptUrl)).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{const v=R.validateRegistry(data);if(!v.valid)throw Error();registry=data;renderPageAction();renderTripActions();renderDashboard();}).catch(()=>{document.querySelectorAll('.revenue-actions').forEach(el=>{el.textContent='Optional comparison checklist unavailable. Existing planning tools remain usable.';});});
})();
