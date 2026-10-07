(function(){
 'use strict';
 const form=document.getElementById('modeComparisonForm');if(!form)return;
 const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 form.addEventListener('submit',event=>{event.preventDefault();$('comparisonError').textContent='';$('comparisonResults').hidden=true;
  const fields=['comparisonFlight','comparisonMiles','comparisonMpg','comparisonFuel','comparisonExtras'];
  const values=fields.map(id=>$(id).value.trim());
  if(values.some(v=>v==='')||values.some(v=>!Number.isFinite(Number(v))||Number(v)<0)||Number(values[1])<=0||Number(values[2])<=0){$('comparisonError').textContent='Enter all known costs, positive total miles and a positive MPG. Blank is UNKNOWN, not zero.';return;}
  const [flight,miles,mpg,price,extras]=values.map(Number),fuel=window.TransportLodgingIntelligence.drivingFuelCost({distance_miles:miles,mpg,fuel_price:price});
  const drive=fuel.cost+extras;if(!Number.isFinite(drive)||!Number.isFinite(flight-drive)){$('comparisonError').textContent='Values exceed the supported numeric range.';return;}
  $('comparisonFlightResult').textContent=money(flight);$('comparisonFuelResult').textContent=money(fuel.cost);$('comparisonDriveResult').textContent=money(drive);
  $('comparisonDifference').textContent=flight===drive?'Entered known totals are equal.':`The entered ${flight>drive?'flight':'driving'} known total is ${money(Math.abs(flight-drive))} higher for this scope. This is not verified savings.`;
  $('comparisonResults').hidden=false;
 });
 form.addEventListener('reset',()=>{$('comparisonResults').hidden=true;$('comparisonError').textContent='';});
})();
