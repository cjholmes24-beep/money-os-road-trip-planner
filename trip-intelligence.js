(() => {
"use strict";
const form=document.getElementById("trip-intake"); if(!form)return;
const $=id=>document.getElementById(id);
const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});
const checked=id=>$(id)?.checked===true;
const getNumber=id=>Number($(id)?.value||0);
function daysBetween(a,b){if(!a||!b)return null;const start=new Date(a+"T00:00:00"),end=new Date(b+"T00:00:00");const ms=end-start;return Number.isFinite(ms)&&ms>=0?Math.round(ms/86400000):null}
function modules(){
  const list=["Budget + hidden-fee audit","Transportation comparison","Lodging fit + cancellation rules","Food + daily-cost planning","Events / things-to-do calendar","Weather + timing","Quality / review evidence","Safety + trip-resilience"];
  if(checked("groupMode"))list.push("Group funding + dropout exposure");
  if(checked("businessMode"))list.push("Business expense ledger + documentation");
  if(checked("petMode"))list.push("Pet / service-animal rules");
  if(checked("accessibilityMode"))list.push("Accessibility + mobility planning");
  if(checked("safeNightMode"))list.push("Walkability + rideshare / no-driving night plan");
  if(checked("flexDestination"))list.unshift("Destination discovery based on budget + intent");
  if([...form.querySelectorAll('input[name="interest"]:checked')].some(x=>x.value==="Vendor / business opportunity"))list.push("Vendor / exhibitor opportunity intelligence");
  return list;
}
function showError(message,el){$("planError").textContent=message;el?.focus()}
form.addEventListener("submit",e=>{
  e.preventDefault(); $("planError").textContent="";
  const budget=getNumber("budget"),travelers=getNumber("travelers"),funded=getNumber("fundedTravelers"),reservePct=getNumber("reservePct");
  if(!$("purpose").value)return showError("Choose the purpose of the trip.",$("purpose"));
  if(!(budget>0))return showError("Enter a real trip budget.",$("budget"));
  if(!Number.isInteger(travelers)||travelers<1)return showError("Travelers must be at least 1.",$("travelers"));
  if(!Number.isInteger(funded)||funded<0||funded>travelers)return showError("Funded travelers must be between 0 and total travelers.",$("fundedTravelers"));
  if(reservePct<0||reservePct>50)return showError("Reserve must be between 0% and 50%.",$("reservePct"));
  const tripDays=daysBetween($("startDate").value,$("endDate").value);
  if($("startDate").value&&$("endDate").value&&tripDays===null)return showError("End date cannot be before start date.",$("endDate"));
  const reserve=budget*(reservePct/100),spendable=budget-reserve,perPerson=budget/travelers;
  const fundedShare=funded?budget/funded:0;
  const remainingAfterDrop=funded-1;
  const dropout=remainingAfterDrop>0?money.format(budget/remainingAfterDrop)+" per remaining funded traveler":funded===1?"One funded traveler cannot absorb a dropout":funded===0?"No funded travelers yet":"Not applicable";
  $("spendableResult").textContent=money.format(spendable);
  $("reserveResult").textContent=money.format(reserve);
  $("perPersonResult").textContent=money.format(perPerson);
  $("fundedShareResult").textContent=funded?money.format(fundedShare):"$0 funded";
  $("dropoutResult").textContent=dropout;
  const where=checked("flexDestination")||!$("destination").value.trim()?"destination discovery":$("destination").value.trim();
  $("planTitle").textContent=$("purpose").value+" · "+where+(tripDays!==null?" · "+(tripDays||1)+" day"+(tripDays===1?"":"s"):"");
  const ul=$("moduleList");ul.innerHTML="";modules().forEach(m=>{const li=document.createElement("li");li.textContent=m;ul.appendChild(li)});
  const interests=[...form.querySelectorAll('input[name="interest"]:checked')].map(x=>x.value);
  $("interestSummary").textContent=interests.length?interests.join(" · "):"No special interests selected yet — the engine will use the trip purpose and vibe as the starting point.";
  $("planResults").hidden=false;$("planResults").scrollIntoView({behavior:"smooth",block:"start"});
});
document.querySelector(".reset-plan")?.addEventListener("click",()=>{form.reset();$("travelers").value="2";$("fundedTravelers").value="2";$("reservePct").value="10";$("planError").textContent="";$("planResults").hidden=true;$("purpose").focus()});
})();