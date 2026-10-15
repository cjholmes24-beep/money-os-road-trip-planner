'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const {parsePage}=require('../scripts/organic-site-audit');
module.exports=()=>{
 let n=0;const ok=(v,m)=>{assert.ok(v,m);n++;};
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'plan-my-trip/index.html'),'utf8'),page=parsePage(html,'/plan-my-trip/');
 for(const banned of [/powered by money os/i,/\bMoney OS\b/i,/\bV1\b/,/owner.cost architecture/i,/canonical trip profile/i,/live source not connected yet/i,/provider access required/i,/intelligence modules/i,/NOT ENOUGH VERIFIED DATA TO COMPARE/i,/direct partner URLs absent/i])ok(!banned.test(page.visible),'traveler copy excludes '+banned);
 ok(page.canonical==='https://cjholmes24-beep.github.io/money-os-road-trip-planner/plan-my-trip/','canonical unchanged');
 ok(page.drive_count===1,'Drive exactly once');ok(page.visible.includes('Affiliate disclosure'),'disclosure retained');
 ok(page.schemas.length>0,'structured data parses');
 for(const id of ['transportEditor','lodgingEditor','eventInformationNotes','morePlanningTools'])ok(new RegExp('<details[^>]*id="'+id+'"[^>]*>').test(html)&&!new RegExp('<details[^>]*id="'+id+'"[^>]*\\bopen').test(html),'collapsed '+id);
 for(const id of ['fuelReferenceMeta','fuelReferenceSource','weatherMeta','emergencyToggle','emergencyPanel','saveTrip','loadTrip','exportTrip','importTrip','homePrivacyControls'])ok(html.includes('id="'+id+'"'),'existing capability retained '+id);
 ok(!html.includes('class="module-grid"')&&!html.includes('class="booking-grid"'),'dead inventory removed');
 ok(/id="tripBookingActions"[^>]*hidden/.test(html),'booking links start hidden');
 ok(page.visible.includes('No account required')&&page.visible.includes('Plan the trip around your real budget.'),'consumer hero');
 ok(fs.readFileSync(path.join(root,'google4493b9dd4b73c0e8.html'),'utf8')==='google-site-verification: google4493b9dd4b73c0e8.html','Google artifact exact');
 return n;
};
