'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const R=require('../revenue-intelligence'),registry=require('../data/monetization-opportunity-registry.json');
module.exports=async function(){
 let count=0;const eq=(a,b,m)=>{assert.deepStrictEqual(a,b,m);count++;},ok=(v,m)=>{assert.ok(v,m);count++;};
 const now='2026-10-06T12:00:00Z';
 const visitor=R.makeDemandEvent('PAGE_VIEWED',{source_page:'/flight-cost-planner/'},{},null,now);
 const qualified=R.makeDemandEvent('BLUEPRINT_GENERATED',{source_page:'/plan-my-trip/'},{destination_known:true,dates_known:true,budget_known:true},null,now);
 const selected=R.makeDemandEvent('CATEGORY_SELECTED',{category:'ESIM',source_page:'/travel-esim-cost-planner/'},{},null,now);
 const action=R.createProviderAction({category:'FLIGHTS',provider:'TEST_ONLY',url:'https://example.com/test-only',relationship_status:'APPROVED',verified_at:now},{trusted:true});
 const shown=R.makeDemandEvent('PROVIDER_ACTION_SHOWN',{category:'FLIGHTS',source_page:'/flight-cost-planner/'},{},action,now);
 const click=R.makeDemandEvent('PROVIDER_ACTION_CLICKED',{category:'FLIGHTS',source_page:'/flight-cost-planner/'},{},action,now);
 const all=R.firstDollarReport([],[],registry);
 eq(all.first_blocker,'NO TRAFFIC PROOF');eq(all.blockers.length,8);eq(all.gaps.length,10);
 eq(R.firstDollarReport([visitor],[],registry).first_blocker,'NO QUALIFIED INTENT YET');
 eq(R.firstDollarReport([visitor,qualified],[],registry).first_blocker,'NO ELIGIBLE PROVIDER ACTION');
 eq(R.firstDollarReport([visitor,qualified],[],registry,[action]).first_blocker,'NO PROVIDER CLICKS');
 eq(R.firstDollarReport([visitor,qualified,shown],[],registry).first_blocker,'NO PROVIDER CLICKS');
 const report=R.firstDollarReport([visitor,qualified,shown,click,selected],[],registry,[action]);
 eq(report.first_blocker,'BOOKING REPORT NOT CONNECTED');eq(report.clicks_by_page['/flight-cost-planner/'],1);
 const flight=report.gaps.find(g=>g.category==='FLIGHTS');eq(flight.provider_clicks,1);eq(flight.high_intent_actions,1);eq(flight.provider_path_verified,true);
 const esim=report.gaps.find(g=>g.category==='ESIM');eq(esim.local_intent_signals,1);eq(esim.provider_path_verified,false);eq(esim.blocker,'PROVIDER_ACCESS_REQUIRED');
 eq(report.gaps.find(g=>g.category==='CRUISES').existing_useful_page,false);
 eq(R.firstDollarReport([selected,selected],[],registry).gaps[0].category,'ESIM','Demand outranks payout or route');
 eq(R.firstDollarReport([click],[],{...registry,opportunities:registry.opportunities.map(o=>({...o,commission:99999}))},[action]),R.firstDollarReport([click],[],registry,[action]),'Payout fields cannot affect report priority');
 eq(R.firstDollarReport([],[],registry,[JSON.parse(JSON.stringify(action))]).gaps.some(g=>g.provider_path_verified),false,'Serialized actions cannot verify a path');
 const booking={id:'test',provider:'TEST_ONLY',category:'FLIGHTS',external_reference:'test',booking_date:'2026-10-01',commission_currency:'USD',commission_amount:1,state:'ATTRIBUTED_BOOKING',reported_at:now,cleared_at:null,evidence_source:'TEST_FIXTURE',record_origin:'USER_IMPORTED'};
 const imported=R.importReports({version:1,records:[{...booking,record_origin:'PROVIDER_REPORTED'}]});
 eq(R.firstDollarReport([visitor,qualified,shown,click],imported,registry,[action]).first_blocker,'BOOKING REPORT NOT CONNECTED');
 const trusted=R.verifyProviderReport(booking,{trusted:true});
 eq(R.firstDollarReport([visitor,qualified,shown,click],[trusted],registry,[action]).first_blocker,'NO APPROVED COMMISSION');
 const approved=R.verifyProviderReport({...booking,state:'PROVIDER_APPROVED'},{trusted:true});
 eq(R.firstDollarReport([visitor,qualified,shown,click],[approved],registry,[action]).first_blocker,'NO CLEARED REVENUE');
 const cleared=R.verifyProviderReport({...booking,state:'CLEARED_REVENUE',cleared_at:now},{trusted:true,evidenceKind:'PAYOUT_RECEIPT'});
 eq(R.firstDollarReport([visitor,qualified,shown,click],[cleared],registry,[action]).first_blocker,null);
 eq(R.firstDollarReport([visitor,qualified,shown,click],[cleared],registry,[action]).gaps.find(g=>g.category==='FLIGHTS').blocker,null);
 const less=R.verifyProviderReport({...booking,state:'CLEARED_REVENUE',cleared_at:now,commission_amount:.5},{trusted:true,evidenceKind:'PAYOUT_RECEIPT'});
 eq(R.firstDollarReport([visitor,qualified,shown,click],[less],registry,[action]).first_blocker,'NO CLEARED REVENUE','A half-dollar is not the first dollar');
 eq(R.firstDollarReport([visitor,qualified,shown,click],R.importReports({version:1,records:[cleared]}),registry,[action]).first_blocker,'BOOKING REPORT NOT CONNECTED');
 for(const opportunity of registry.opportunities){eq(R.MONEY_PAGES[opportunity.category],opportunity.planning_path);ok(fs.existsSync(path.join(__dirname,'..',opportunity.planning_path,'index.html')));}
 const calc={ 'flight-cost-planner':'FLIGHTS','rental-car-trip-cost':'RENTAL_CARS','airport-transfer-cost-planner':'TRANSFERS','travel-esim-cost-planner':'ESIM','travel-activities-budget':'ACTIVITIES'};
 for(const [slug,category] of Object.entries(calc)){
  const html=fs.readFileSync(path.join(__dirname,'..',slug,'index.html'),'utf8');
  ok(html.includes(`data-revenue-category="${category}" hidden`));ok(html.indexOf('class="card results"')<html.indexOf('class="card next-decision" hidden'));ok(html.indexOf('class="card next-decision" hidden')<html.indexOf('class="card prose"'));ok(html.includes('Affiliate disclosure'));eq((html.match(/tp-em.com\/NTgxMDU0.js\?t=581054/g)||[]).length,1);
 }
 eq(R.selectTripCategories({preferences:{transport:'Fly',lodging:'No lodging',interests:[]}}),['FLIGHTS']);
 eq(R.selectTripCategories({preferences:{transport:'Rental car',lodging:'Hotel'}}),['ACCOMMODATION','RENTAL_CARS']);
 return count;
};
