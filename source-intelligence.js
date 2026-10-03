(() => {
"use strict";
const form=document.getElementById("trip-intake");
if(!form)return;
const $=id=>document.getElementById(id);
const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:3,maximumFractionDigits:3});

function normalize(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function matches(text,alias){
  const t=" "+normalize(text)+" ",a=normalize(alias);
  if(!a)return false;
  return a.length<=2?t.includes(" "+a+" "):t.includes(a);
}
async function renderFuel(){
  const box=$("fuelReference");
  if(!box)return;
  box.hidden=false;
  $("fuelReferenceStatus").textContent="Checking official weekly fuel reference…";
  try{
    const res=await fetch("../data/eia-gas-latest.json",{cache:"no-store"});
    if(!res.ok)throw new Error("fuel snapshot unavailable");
    const data=await res.json();
    const destination=$("destination").value;
    const entries=[...(data.places||[])].sort((a,b)=>{
      const al=Math.max(...(a.aliases||[""]).map(x=>x.length));
      const bl=Math.max(...(b.aliases||[""]).map(x=>x.length));
      return bl-al;
    });
    let picked=entries.find(p=>(p.aliases||[]).some(a=>matches(destination,a)));
    if(!picked)picked=entries.find(p=>p.label==="U.S. average");
    $("fuelReferenceStatus").textContent=picked.label+" weekly reference";
    $("fuelReferenceValue").textContent=money.format(Number(picked.value))+" / gal";
    $("fuelReferenceMeta").textContent="Week ending "+data.period_end+" · WEEKLY GOVERNMENT DATA · not a station-specific pump quote.";
    $("fuelReferenceSource").href=data.source.url;
  }catch(err){
    $("fuelReferenceStatus").textContent="Fuel reference temporarily unavailable";
    $("fuelReferenceValue").textContent="—";
    $("fuelReferenceMeta").textContent="Suitcase Brain will not invent a replacement price.";
  }
}

async function weatherHere(){
  const button=$("weatherHereButton"),status=$("weatherStatus"),body=$("weatherBody");
  if(!navigator.geolocation){status.textContent="This browser does not provide location access.";return}
  button.disabled=true;status.textContent="Requesting your location…";body.textContent="";
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      status.textContent="Checking National Weather Service…";
      const lat=pos.coords.latitude.toFixed(4),lon=pos.coords.longitude.toFixed(4);
      const point=await fetch("https://api.weather.gov/points/"+lat+","+lon,{headers:{Accept:"application/geo+json"}});
      if(!point.ok)throw new Error("NWS point lookup unavailable");
      const pointData=await point.json();
      const forecastUrl=pointData?.properties?.forecast;
      if(!forecastUrl)throw new Error("No U.S. NWS forecast for this location");
      const forecast=await fetch(forecastUrl,{headers:{Accept:"application/geo+json"}});
      if(!forecast.ok)throw new Error("NWS forecast unavailable");
      const data=await forecast.json();
      const periods=(data?.properties?.periods||[]).slice(0,3);
      if(!periods.length)throw new Error("No forecast periods returned");
      status.textContent="NWS forecast near your current location";
      body.textContent=periods.map(p=>p.name+": "+p.temperature+"°"+p.temperatureUnit+", "+p.shortForecast).join(" · ");
    }catch(err){
      status.textContent="Live weather unavailable";
      body.textContent="No substitute forecast was invented. Try again later.";
    }finally{button.disabled=false}
  },err=>{status.textContent="Location was not shared.";body.textContent="Nothing was stored.";button.disabled=false},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
}

form.addEventListener("submit",()=>{window.setTimeout(renderFuel,0)});
$("weatherHereButton")?.addEventListener("click",weatherHere);
})();