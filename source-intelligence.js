(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else{root.SourceIntelligence=api;api.bind();}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const STATES=["LIVE","PUBLISHED","RECENT","WEEKLY GOVERNMENT DATA","HISTORICAL / TYPICAL","USER ENTERED","COMMUNITY REPORTED","UNKNOWN"];
  const DEFAULT_TTLS={"LIVE":7200,"RECENT":604800,"WEEKLY GOVERNMENT DATA":777600,"COMMUNITY REPORTED":2592000};
  const normalize=v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

  function factLabel(factType){
    let candidate=String(factType||"UNKNOWN").replaceAll("_"," ");
    if(candidate==="HISTORICAL TYPICAL")candidate="HISTORICAL / TYPICAL";
    return STATES.includes(candidate)?candidate:"UNKNOWN";
  }

  function classifyFreshness(fact,now=Date.now()){
    if(!fact||!fact.fact_type)return{label:"UNKNOWN",status:"unavailable",age_seconds:Infinity,ttl_seconds:null};
    const label=factLabel(fact.fact_type);
    const retrieved=Date.parse(fact.retrieved_at||"");
    const age=Number.isFinite(retrieved)?Math.max(0,now-retrieved)/1000:Infinity;
    const explicit=Number(fact.freshness_seconds);
    const ttl=Number.isFinite(explicit)&&explicit>0?explicit:DEFAULT_TTLS[label];
    const status=!Number.isFinite(age)?"unavailable":Number.isFinite(ttl)&&age>ttl*2?"stale":Number.isFinite(ttl)&&age>ttl?"aging":"fresh";
    return{label,status,age_seconds:age,ttl_seconds:ttl??null};
  }

  function matchAlias(text,alias){
    const t=normalize(text),a=normalize(alias);
    if(!t||!a)return false;
    const tokens=t.split(" ");
    if(a.length<=2)return tokens.includes(a);
    return t===a||(` ${t} `).includes(` ${a} `)||t.includes(a);
  }

  function pickFuelPlace(places,destination){
    const safe=(places||[]).filter(p=>Array.isArray(p.aliases));
    const sorted=[...safe].sort((a,b)=>Math.max(0,...b.aliases.map(x=>String(x).length))-Math.max(0,...a.aliases.map(x=>String(x).length)));
    return sorted.find(p=>p.aliases.some(a=>matchAlias(destination,a)))||safe.find(p=>p.label==="U.S. average")||null;
  }

  async function loadFuelReference(destination){
    const res=await fetch("../data/eia-gas-latest.json",{cache:"no-store"});
    if(!res.ok)throw new Error("Fuel snapshot unavailable.");
    const data=await res.json();
    const picked=pickFuelPlace(data.places,destination);
    if(!picked||!Number.isFinite(Number(picked.value)))throw new Error("Fuel reference unavailable.");
    const freshness=classifyFreshness({
      fact_type:data.fact_type||"WEEKLY_GOVERNMENT_DATA",
      retrieved_at:data.retrieved_at,
      freshness_seconds:data.freshness_seconds
    });
    return{
      value:Number(picked.value),
      label:picked.label,
      period_end:data.period_end||"",
      retrieved_at:data.retrieved_at||"",
      freshness,
      source:{
        fact_type:data.fact_type||"WEEKLY_GOVERNMENT_DATA",
        source_id:data.source?.id||"eia_weekly_gasoline",
        source_name:data.source?.name||"U.S. Energy Information Administration",
        source_url:data.source?.url||"https://www.eia.gov/petroleum/gasdiesel/",
        retrieved_at:data.retrieved_at||"",
        published_at:data.period_end||"",
        geography:picked.label,
        status:freshness.status,
        confidence:data.confidence||"high",
        notes:"Weekly gasoline reference; not a guaranteed station price."
      }
    };
  }

  function bind(){
    const $=id=>document.getElementById(id),form=$("trip-intake");
    if(!form)return;
    const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:3,maximumFractionDigits:3});

    async function renderFuel(event){
      const box=$("fuelReference");
      if(!box)return;
      if(document.body.classList.contains("consumer-planner")&&box.hidden)return;
      box.hidden=false;
      $("fuelReferenceStatus").textContent="Checking official weekly fuel reference…";
      try{
        const ref=await loadFuelReference(event?.detail?.destination||$("destination").value);
        $("fuelReferenceStatus").textContent=`${ref.label} gasoline reference${ref.freshness.status!=="fresh"?" — check update date":""}`;
        $("fuelReferenceValue").textContent=`${money.format(ref.value)} / gal`;
        $("fuelReferenceMeta").textContent=`${ref.freshness.label} · Freshness: ${ref.freshness.status.toUpperCase()} · Source: ${ref.source.source_name} · Period ending: ${ref.period_end} · Retrieved: ${ref.retrieved_at} · Confidence: ${ref.source.confidence} · Weekly reference, not a guaranteed station price.`;
        $("fuelReferenceSource").href=ref.source.source_url;
        window.dispatchEvent(new CustomEvent("suitcasebrain:fuel-reference",{detail:ref}));
      }catch(e){
        $("fuelReferenceStatus").textContent="Fuel reference unavailable";
        $("fuelReferenceValue").textContent="—";
        $("fuelReferenceMeta").textContent="Freshness: UNKNOWN. No substitute price was invented.";
      }
    }

    async function weatherHere(){
      const button=$("weatherHereButton"),status=$("weatherStatus"),body=$("weatherBody"),meta=$("weatherMeta");
      if(!navigator.geolocation){status.textContent="Location is unavailable in this browser.";return;}
      button.disabled=true;
      status.textContent="Requesting your location…";
      navigator.geolocation.getCurrentPosition(async pos=>{
        try{
          const retrieved=new Date().toISOString();
          const point=await fetch(`https://api.weather.gov/points/${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`,{headers:{Accept:"application/geo+json"}});
          if(!point.ok)throw Error();
          const pd=await point.json();
          const forecast=await fetch(pd.properties.forecast,{headers:{Accept:"application/geo+json"}});
          if(!forecast.ok)throw Error();
          const data=await forecast.json(),periods=(data.properties?.periods||[]).slice(0,3);
          if(!periods.length)throw Error();
          status.textContent="NWS forecast near your current location";
          body.textContent=periods.map(p=>`${p.name}: ${p.temperature}°${p.temperatureUnit}, ${p.shortForecast}`).join(" · ");
          meta.textContent=`LIVE · Freshness: FRESH · Source: National Weather Service · Retrieved: ${retrieved} · Effective periods supplied by NWS · Current U.S. point forecast; conditions can change.`;
        }catch(e){
          status.textContent="Live weather unavailable";
          body.textContent="No substitute forecast was invented.";
          meta.textContent="Freshness: UNKNOWN.";
        }finally{button.disabled=false;}
      },()=>{
        status.textContent="Location was not shared.";
        body.textContent="Nothing was stored.";
        meta.textContent="Freshness: UNKNOWN.";
        button.disabled=false;
      },{timeout:10000,maximumAge:300000});
    }

    window.addEventListener("suitcasebrain:blueprint",renderFuel);
    window.addEventListener("suitcasebrain:fuel-request",renderFuel);
    $("weatherHereButton")?.addEventListener("click",weatherHere);
  }

  return{STATES,DEFAULT_TTLS,factLabel,classifyFreshness,matchAlias,pickFuelPlace,loadFuelReference,bind};
});
