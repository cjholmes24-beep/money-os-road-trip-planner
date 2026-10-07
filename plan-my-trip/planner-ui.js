(function () {
  "use strict";

  const B = window.SuitcaseBrain;
  const T = window.TransportLodgingIntelligence;
  const E = window.EventIntelligence;
  const form = document.getElementById("trip-intake");
  if (!B || !T || !E || !form) return;

  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const value = id => $(id)?.value.trim() || "";
  const number = id => Number($(id)?.value || 0);
  const checked = id => !!$(id)?.checked;
  const optionalNumber = id => value(id) === "" ? null : Number(value(id));

  let trip = B.createTrip();
  let step = 0;
  let activeEiaFuel = null;
  const openedPlanningTools = new Set();
  const friendly = text => String(text ?? "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const steps = [...document.querySelectorAll(".planner-step")];

  function money(n, currency) {
    const code = currency || trip?.budget?.currency || "USD";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(Number(n) || 0);
    } catch (_) {
      return `${Number(n) || 0} ${code}`;
    }
  }

  function showStep(index, focus = true) {
    step = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((el, i) => { el.hidden = i !== step; });
    $("stepLabel").textContent = `Step ${step + 1} of ${steps.length}`;
    $("prevStep").hidden = step === 0;
    $("nextStep").hidden = step === steps.length - 1;
    if(focus)steps[step].querySelector("input, select, textarea, button")?.focus();
  }

  function collect() {
    trip.updated_at = new Date().toISOString();
    trip.identity = { title: value("tripTitle"), purpose: value("purpose"), vibe: value("vibe") };
    trip.origin = value("origin");
    trip.destination = value("destination");
    trip.destination_unknown = checked("flexDestination");
    trip.dates = { start: value("startDate"), end: value("endDate"), flexibility: value("dateFlexibility") };
    trip.budget = { total: number("budget"), reserve: number("reserve"), currency: value("currency") || "USD" };
    trip.traveler_count = Math.max(1, number("travelerCount"));
    trip.preferences = {
      lodging: value("lodging"),
      transport: value("transport"),
      walking: value("walking"),
      driving: value("driving"),
      interests: [...document.querySelectorAll('[name="interest"]:checked')].map(x => x.value),
      culture_community: value("culture"),
      food: value("food"),
      nightlife: value("nightlife"),
      outdoor_adventure: value("outdoor")
    };
    trip.needs = { pet_service_animal: value("petNeeds"), accessibility: value("accessibilityNeeds") };
    trip.modes = {
      business: checked("businessMode"),
      group: checked("groupMode"),
      safe_night_no_driving: checked("safeNightMode"),
      vendor_business_opportunity: checked("vendorMode")
    };
    trip.emergency = {
      scenario: value("emergencyScenario"),
      personal_safety: checked("personalSafety"),
      contacts: value("emergencyContacts"),
      documents_notes: value("documentsNotes"),
      booking_owners: value("bookingOwners")
    };
    return trip;
  }

  function travelerRow(t = {}) {
    return `<div class="editor-row traveler-row">
      <label>Label (optional)<input data-field="label" value="${escape(t.label)}"></label>
      <label>Age / band<input data-field="age_band" value="${escape(t.age_band)}" placeholder="Adult, 14, senior"></label>
      <label>Payment responsibility<input data-field="payment_responsibility" value="${escape(t.payment_responsibility)}" placeholder="Self / organizer"></label>
      <label>Committed<input data-field="amount_committed" type="number" min="0" step=".01" value="${Number(t.amount_committed)||0}"></label>
      <label>Paid<input data-field="amount_paid" type="number" min="0" step=".01" value="${Number(t.amount_paid)||0}"></label>
      <label>Trip commitment<select data-field="commitment_state">${B.COMMITMENT_STATES.map(s=>`<option value="${s}" ${s===(t.commitment_state||"INVITED")?"selected":""}>${friendly(s)}</option>`).join("")}</select></label>
      <button class="secondary remove-row" type="button">Remove</button>
    </div>`;
  }

  function reservationRow(r = {}) {
    const fields = [
      ["provider","Provider"],["description","Description"],["booking_price","Booking price","number"],
      ["deposit_paid","Deposit paid","number"],["amount_paid_beyond_deposit","Other amount paid","number"],
      ["remaining_balance","Remaining balance","number"],["paid_by","Paid by traveler/group"],
      ["booking_date","Booking date","date"],["cancellation_deadline","Cancellation deadline","date"],
      ["refundable_amount","Refundable amount","number"],["nonrefundable_amount","Nonrefundable amount","number"],
      ["change_rebooking_fee","Change/rebooking fee","number"],["provider_cancellation_fee","Cancellation fee","number"],
      ["provider_no_show_fee","No-show fee","number"],["credit_voucher_possibility","Credit/voucher possibility"],
      ["confirmation_reference","Confirmation/reference"],["source","Policy source URL","url"],["notes","Notes"]
    ];
    return `<div class="editor-row reservation-row">
      <label>Category<select data-field="category">${B.RESERVATION_CATEGORIES.map(x=>`<option ${x===(r.category||"other")?"selected":""}>${x}</option>`).join("")}</select></label>
      ${fields.map(([key,label,type="text"])=>`<label>${label}<input data-field="${key}" type="${type}" ${type==="number"?'min="0" step=".01"':''} value="${escape(r[key])}"></label>`).join("")}
      <label>Policy status<select data-field="policy_status"><option value="UNKNOWN">Not checked</option><option value="USER-ENTERED" ${r.policy_status==="USER-ENTERED"?"selected":""}>Entered from policy</option><option value="VERIFIED" ${r.policy_status==="VERIFIED"?"selected":""}>Checked against policy</option></select></label>
      <button class="secondary remove-row" type="button">Remove</button>
    </div>`;
  }

  function feeRows() {
    $("feeRows").innerHTML = trip.hidden_fees.map((f,i)=>`<div class="fee-row" data-index="${i}">
      <strong>${escape(f.category)}</strong>
      <label>Status<select data-field="status">${B.FEE_STATUSES.map(s=>`<option value="${s}" ${s===f.status?"selected":""}>${s==="UNKNOWN"?"Not checked":friendly(s)}</option>`).join("")}</select></label>
      <label>Amount (blank if unknown)<input data-field="amount" type="number" min="0" step=".01" value="${f.amount==null?"":f.amount}"></label>
      <label>Source / note<input data-field="source" value="${escape(f.source)}"></label>
    </div>`).join("");
  }

  function syncRows() {
    trip.travelers = [...document.querySelectorAll(".traveler-row")].map(row =>
      Object.fromEntries([...row.querySelectorAll("[data-field]")].map(el => [el.dataset.field, el.type === "number" ? Number(el.value || 0) : el.value]))
    );
    trip.traveler_count = Math.max(trip.traveler_count, trip.travelers.length || 1);
    trip.reservations = [...document.querySelectorAll(".reservation-row")].map(row =>
      Object.fromEntries([...row.querySelectorAll("[data-field]")].map(el => [el.dataset.field, el.type === "number" ? Number(el.value || 0) : el.value]))
    );
    [...document.querySelectorAll(".fee-row")].forEach(row => {
      const f = trip.hidden_fees[Number(row.dataset.index)];
      row.querySelectorAll("[data-field]").forEach(el => {
        f[el.dataset.field] = el.dataset.field === "amount" ? (el.value === "" ? null : Number(el.value)) : el.value;
      });
    });
  }

  function validateWholeTrip(candidate) {
    const base = B.validateTrip(candidate);
    const options = T.validateTripOptions(candidate);
    return { valid: base.valid && options.valid, errors: [...base.errors, ...options.errors] };
  }

  function renderBlueprint() {
    collect();
    syncRows();
    const valid = validateWholeTrip(trip);
    if (!valid.valid) {
      $("planError").textContent = valid.errors.join(" ");
      return;
    }
    $("planError").textContent = "";
    const b = B.budgetMetrics(trip);
    const c = B.cancellationExposure(trip.reservations);
    const fees = B.hiddenFeeMetrics(trip.hidden_fees);
    const one = B.dropoutScenario(trip,1);
    const two = B.dropoutScenario(trip,2);
    const unpaid = B.dropoutScenario(trip,0,true,true);
    const special = Object.entries(trip.modes).filter(([,on])=>on).map(([name])=>name.replaceAll("_"," ")).join(", ") || "None selected";
    const currency = trip.budget.currency;

    $("blueprintSummary").innerHTML = [
      ["Trip",trip.identity.title||trip.identity.purpose||"Your trip"],
      ["Travelers",`${trip.traveler_count} planned · ${b.committed} committed · ${b.funded} funded`],
      ["Dates",trip.dates.start?`${trip.dates.start} → ${trip.dates.end||"open"}`:"Add your travel dates"],
      ["Destination",trip.destination_unknown?"Destination undecided":trip.destination||"Add your destination"]
    ].map(([a,v])=>`<div><span>${escape(a)}</span><strong>${escape(v)}</strong></div>`).join("");
    $("budgetSummary").innerHTML = [["Total budget",b.total],["Protected reserve",b.reserve],["Available to plan",b.spendable],["Money paid",b.fundedAmount],["Still to fund",b.unfundedGap],["Planned per traveler",b.plannedShare]].map(([label,n])=>`<div><span>${escape(label)}</span><strong>${money(n,currency)}</strong></div>`).join("");
    $("groupRiskSection").hidden=trip.traveler_count<2;
    $("cancellationSection").hidden=!trip.reservations.length;
    const needs=[];
    if(trip.needs.pet_service_animal)needs.push(["Pets / service animals",trip.needs.pet_service_animal]);
    if(trip.needs.accessibility)needs.push(["Accessibility",trip.needs.accessibility]);
    if(trip.modes.business||trip.modes.vendor_business_opportunity)needs.push(["Business planning",trip.identity.purpose||"Business records selected"]);
    $("enteredTripNeeds").hidden=!needs.length;
    $("tripNeedsSummary").innerHTML=needs.map(([title,text])=>`<p><strong>${escape(title)}:</strong> ${escape(text)}</p>`).join('');

    $("dropoutResults").innerHTML = [
      ["1 person drops",one],["2 people drop",two],["One unpaid traveler never pays",unpaid]
    ].map(([label,x])=>`<tr><th>${label}</th><td>${money(x.currentShare,currency)}</td><td>${x.remaining?money(x.newShare,currency):"No travelers remain"}</td><td>${money(x.increasePerRemaining,currency)}</td><td>${money(x.totalFundingShortage,currency)}</td></tr>`).join("");

    $("cancelResults").innerHTML = [
      ["Total booked value",c.totalBookedValue],["Total already paid",c.totalAlreadyPaid],
      ["Estimated recoverable",c.estimatedRecoverable],["Estimated nonrefundable exposure",c.estimatedNonrefundable],
      ["Estimated change/cancellation fees",c.estimatedFees],["Net estimated loss",c.netEstimatedLoss]
    ].map(([k,v])=>`<div><span>${k}</span><strong>${money(v,currency)}</strong></div>`).join("") +
      `<div><span>Credits / vouchers</span><strong>${escape(c.creditsVouchers.join(", ")||"Check your booking terms")}</strong></div><p class="source-note">${c.unknownPolicies} policy detail(s) still need checking. Confirm them before relying on the estimate.</p>`;

    $("feeSummary").textContent = `${money(fees.total,currency)} in added fees. ${fees.unknown} fee categories still need checking; blank amounts are not treated as free. ${b.unfundedGap>0?money(b.unfundedGap,currency)+" of your budget still needs funding.":""}`;
    const relevantRisks=B.resilience(trip).filter(x=>({"Funding readiness":b.total>0,"Cancellation exposure":trip.reservations.length>0,"Transportation backup":trip.transportation_options.length>0,"Emergency reserve":b.total>0,"Group commitment":trip.traveler_count>1||trip.travelers.length>0,"Lodging flexibility":trip.preferences.lodging!=="No lodging"&&trip.lodging_options.length>0,"Schedule flexibility":!!trip.dates.start})[x.label]);
    $("resilienceCards").innerHTML = relevantRisks.map(x=>`<article class="status-card status-${x.status.toLowerCase()}"><span>${{STRONG:"Plan in place",WATCH:"Worth checking",EXPOSED:"Needs attention",UNKNOWN:"Add details"}[x.status]||"Review"}</span><h4>${escape(x.label)}</h4><p>${escape(x.reason)}</p></article>`).join("") || '<p class="empty-state">Add a budget, dates or booking details to see the checks that apply to your trip.</p>';
    renderIntelligence();
    $("planResults").hidden = false;
    window.dispatchEvent(new CustomEvent("suitcasebrain:blueprint",{detail:trip}));
    $("planResults").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  }

  function populate(t) {
    trip = t;
    openedPlanningTools.clear();
    $("planResults").hidden=true;
    resetEventEditor();
    trip.transportation_options ||= [];
    trip.lodging_options ||= [];
    const set=(id,v)=>{if($(id))$(id).value=v??""};
    const check=(id,v)=>{if($(id))$(id).checked=!!v};
    set("tripTitle",t.identity.title);set("purpose",t.identity.purpose);set("vibe",t.identity.vibe);
    set("origin",t.origin);set("destination",t.destination);check("flexDestination",t.destination_unknown);
    set("startDate",t.dates.start);set("endDate",t.dates.end);set("dateFlexibility",t.dates.flexibility);
    set("budget",t.budget.total);set("reserve",t.budget.reserve);set("currency",t.budget.currency);set("travelerCount",t.traveler_count);
    ["lodging","transport","walking","driving"].forEach(k=>set(k,t.preferences[k]));
    set("culture",t.preferences.culture_community);set("food",t.preferences.food);set("nightlife",t.preferences.nightlife);set("outdoor",t.preferences.outdoor_adventure);
    set("petNeeds",t.needs.pet_service_animal);set("accessibilityNeeds",t.needs.accessibility);
    Object.keys(t.modes).forEach(k=>check({business:"businessMode",group:"groupMode",safe_night_no_driving:"safeNightMode",vendor_business_opportunity:"vendorMode"}[k],t.modes[k]));
    document.querySelectorAll('[name="interest"]').forEach(el=>el.checked=t.preferences.interests.includes(el.value));
    set("emergencyScenario",t.emergency.scenario);check("personalSafety",t.emergency.personal_safety);
    set("emergencyContacts",t.emergency.contacts);set("documentsNotes",t.emergency.documents_notes);set("bookingOwners",t.emergency.booking_owners);
    $("travelerRows").innerHTML=t.travelers.map(travelerRow).join("");
    $("reservationRows").innerHTML=t.reservations.map(reservationRow).join("");
    feeRows();
    renderIntelligence();
    window.dispatchEvent(new CustomEvent('suitcasebrain:trip-replaced'));
    showStep(0);
  }

  function sourceLine(option) {
    const s = option.source || {};
    const bits = [s.source_name || "UNKNOWN", s.fact_type || "UNKNOWN"];
    if (s.retrieved_at) bits.push(`retrieved ${s.retrieved_at}`);
    if (s.status) bits.push(`freshness ${s.status}`);
    return bits.join(" · ");
  }

  function optionCard(option, kind) {
    const validation = kind==="transport" ? T.validateTransportOption(option) : T.validateLodgingOption(option);
    if (!validation.valid) return '<article class="option-card"><p>This saved option needs correction. Remove it and add the details again.</p></article>';
    const p=T.priceCompleteness(option,kind), cancel=T.cancellationExposure(option);
    const required=kind==="transport"?(T.TRANSPORT_MANDATORY_BY_MODE[option.mode]||T.TRANSPORT_MANDATORY_BY_MODE.OTHER):T.LODGING_MANDATORY;
    const hasRequiredPrice=p.unknownMandatoryComponents.length<required.length||p.knownTotal>0;
    const title=kind==="transport"?`${friendly(option.mode)}${option.provider&&option.provider!=="UNKNOWN"?" · "+option.provider:""}`:option.property;
    const unit=kind==="transport"?`${money(p.knownTotal/option.traveler_count,option.currency)} / traveler`:`${money(p.knownTotal/option.nights,option.currency)} / night`;
    const booking=T.bookingUrl(option);
    const edit=option.record_origin==="USER_ENTERED"?`<button class="secondary edit-option" data-kind="${kind}" data-id="${escape(option.id)}" type="button">Edit</button>`:"";
    const bookingCta=booking?`<a class="primary button-link" href="${escape(booking)}" target="_blank" rel="sponsored noopener">Continue to provider ↗</a>`:"";
    const origin=option.record_origin==="USER_ENTERED"?"Your quote":option.record_origin==="IMPORTED"?"Imported quote — check details":"Source-backed quote";
    return `<article class="option-card" data-option-id="${escape(option.id)}">
      <div class="option-head"><span class="intel-badge">${origin}</span><h4>${escape(title)}</h4></div>
      <strong class="intel-value">${hasRequiredPrice?money(p.knownTotal,option.currency)+" in known required costs":"Add prices to see a total"}</strong>
      <p>${p.mandatoryComplete?escape(unit):`${p.unknownMandatoryComponents.length} required cost(s) still need checking. This is not a complete price.`}</p>
      <details class="method-notes"><summary>About these numbers</summary><p>Optional costs: ${money(p.knownOptionalAddOns,option.currency)} known. Deposit/hold: ${p.depositHold==null?"Not added":money(p.depositHold,option.currency)}. ${cancel.complete?"Known cancellation exposure: "+money(cancel.potentialExposure,option.currency):"Check cancellation terms before booking."}</p><p>Cost coverage: ${escape(p.coverageLabel)}. Source: ${escape(sourceLine(option))} · Availability: ${escape(option.availability_status)}. ${escape(cancel.label)}</p></details>
      <div class="button-row">${edit}<button class="secondary remove-option" data-kind="${kind}" data-id="${escape(option.id)}" type="button">Remove</button>${bookingCta}</div>
    </article>`;
  }

  function comparisonCards(results, options, kind) {
    const valid=options.filter(o=>(kind==="transport"?T.validateTransportOption(o):T.validateLodgingOption(o)).valid);
    const complete=valid.filter(o=>T.priceCompleteness(o,kind).mandatoryComplete);
    const sameCurrency=new Set(complete.map(o=>o.currency)).size<=1;
    const usable=results.filter(x=>x.status==="COMPARABLE"||x.status==="TIE — NO SINGLE WINNER");
    if(complete.length<2||!sameCurrency||!usable.length){
      const instruction=kind==="lodging"?'Add at least two complete stays to compare price, nightly cost, fees and flexibility.':'Add at least two complete options to compare price, travel time, fees and flexibility.';
      return `<div class="comparison-empty"><p>${instruction}${!sameCurrency?' Use the same currency for price comparisons.':''}</p><button type="button" class="secondary open-quote" data-kind="${kind}">${kind==="lodging"?'Add a stay':'Add an option'}</button></div>`;
    }
    const labels={"LOWEST KNOWN COST":"Lowest complete price","LOWEST KNOWN COST PER TRAVELER":"Lowest cost per traveler","FASTEST KNOWN OPTION":"Shortest travel time","FEWEST UNKNOWN COSTS":"Most costs accounted for","MOST FLEXIBLE KNOWN POLICY":"Lowest known cancellation exposure","LOWEST KNOWN REQUIRED TOTAL + HOLD":"Lowest total including hold","GROUP-FRIENDLY":"Fits your group","LOWEST KNOWN TOTAL":"Lowest complete stay price","LOWEST KNOWN TOTAL PER NIGHT":"Lowest nightly cost","FEWEST UNKNOWN MANDATORY FEES":"Most required fees accounted for","MOST FLEXIBLE KNOWN CANCELLATION":"Lowest known cancellation exposure","LOWEST DEPOSIT/HOLD":"Lowest deposit or hold","PARKING INCLUDED":"Parking included","BREAKFAST INCLUDED":"Breakfast included","BEST LOCATION FIT":"Fits your preferred location"};
    return usable.map(x=>{
      const winner=options.find(o=>o.id===x.winner_id);
      const name=winner?(winner.property||winner.service_name||(winner.provider!=="UNKNOWN"&&winner.provider)||friendly(winner.mode)):"More than one option matches";
      const cost=["LOWEST KNOWN COST","LOWEST KNOWN COST PER TRAVELER","MOST FLEXIBLE KNOWN POLICY","LOWEST KNOWN REQUIRED TOTAL + HOLD","LOWEST KNOWN TOTAL","LOWEST KNOWN TOTAL PER NIGHT","MOST FLEXIBLE KNOWN CANCELLATION","LOWEST DEPOSIT/HOLD"].includes(x.label);
      const metric=cost?money(x.value,complete[0].currency):x.label==="FASTEST KNOWN OPTION"?`${x.value} minutes`:"";
      return `<article class="comparison-card"><strong>${escape(labels[x.label]||friendly(x.label))}</strong><span>${escape(name)}</span>${metric?`<p>${escape(metric)}</p>`:""}<details class="method-notes"><summary>How this comparison works</summary><p>${escape(x.basis)}</p></details></article>`;
    }).join("");
  }

  function planningVisibility(){
    const has=(name,records,relevant)=>openedPlanningTools.has(name)||records.length>0||relevant;
    $("transportWorkspace").hidden=!has("transport",trip.transportation_options,!!trip.preferences.transport);
    $("lodgingWorkspace").hidden=!has("lodging",trip.lodging_options,trip.preferences.lodging!=="No lodging"&&!!trip.preferences.lodging);
    $("eventsWorkspace").hidden=!has("events",trip.events,trip.preferences.interests.includes("Events")||/festival|concert|event/i.test(trip.identity.purpose));
    const fuelWasHidden=$("fuelReference").hidden;
    const fuel=openedPlanningTools.has('fuel')||['Drive','Rental car'].includes(trip.preferences.transport)||trip.transportation_options.some(o=>['DRIVE','RENTAL_CAR'].includes(o.mode));
    const weather=openedPlanningTools.has('weather')||!!trip.destination||!!trip.dates.start;
    $("fuelReference").hidden=!fuel;$("weatherReference").hidden=!weather;$("tripDataSection").hidden=!fuel&&!weather;
    if(fuel&&fuelWasHidden&&!$("planResults").hidden)window.dispatchEvent(new CustomEvent("suitcasebrain:fuel-request",{detail:trip}));
  }

  function renderIntelligence(){
    renderEvents();
    trip.transportation_options ||= [];
    trip.lodging_options ||= [];
    $("transportOptions").innerHTML=trip.transportation_options.map(x=>optionCard(x,"transport")).join("");
    $("lodgingOptions").innerHTML=trip.lodging_options.map(x=>optionCard(x,"lodging")).join("");
    $("transportComparison").innerHTML=comparisonCards(T.compareTransport(trip.transportation_options),trip.transportation_options,"transport");
    $("lodgingComparison").innerHTML=comparisonCards(T.compareLodging(trip.lodging_options),trip.lodging_options,"lodging");
    planningVisibility();
  }

  function fieldComponent(id, source = null) {
    const n=optionalNumber(id);
    return n==null?T.component(null,"UNKNOWN"):T.component(n,"USER_ENTERED",source);
  }

  function transportFromForm() {
    const distance=optionalNumber("quoteTransportDistance");
    const mpg=optionalNumber("quoteTransportMpg");
    const fuelPrice=optionalNumber("quoteTransportFuelPrice");
    const basis=value("quoteTransportFuelBasis");
    let fuel=optionalNumber("quoteTransportFuel");
    let fuelSource=null;

    if (basis==="EIA WEEKLY REFERENCE") {
      if ((value("currency") || trip.budget.currency || "USD") !== "USD") {
        throw new Error("EIA gasoline is published in USD per gallon. Currency conversion is not connected; use USD or enter your own converted pump quote.");
      }
      if (!activeEiaFuel || fuelPrice==null || Math.abs(fuelPrice-activeEiaFuel.value)>0.0005) {
        throw new Error("Load the current EIA reference with the button before labeling this quote as EIA-based.");
      }
      fuelSource=activeEiaFuel.source;
      if (distance!=null&&mpg!=null) fuel=T.drivingFuelCost({distance_miles:distance,trip_direction:value("quoteTransportDirection"),mpg,fuel_price:fuelPrice}).cost;
    } else if (fuel==null&&distance!=null&&mpg!=null&&fuelPrice!=null) {
      fuel=T.drivingFuelCost({distance_miles:distance,trip_direction:value("quoteTransportDirection"),mpg,fuel_price:fuelPrice}).cost;
    }

    const costs={
      base_price:fieldComponent("quoteTransportBase"),
      taxes:fieldComponent("quoteTransportTaxes"),
      mandatory_fees:fieldComponent("quoteTransportMandatory"),
      optional_fees:fieldComponent("quoteTransportOptional"),
      baggage:fieldComponent("quoteTransportBags"),
      seat_fees:fieldComponent("quoteTransportSeats"),
      parking:fieldComponent("quoteTransportParking"),
      tolls:fieldComponent("quoteTransportTolls"),
      fuel:fuel==null?T.component(null,"UNKNOWN"):T.component(fuel,"USER_ENTERED",fuelSource),
      rental_fees:fieldComponent("quoteTransportRentalFees"),
      young_driver_fee:fieldComponent("quoteTransportYoungDriver"),
      additional_driver_fee:fieldComponent("quoteTransportAdditionalDriver"),
      one_way_drop_fee:fieldComponent("quoteTransportOneWayDrop"),
      refueling_exposure:fieldComponent("quoteTransportRefuel"),
      airport_terminal_transport:fieldComponent("quoteTransportTerminal"),
      estimated_local_transport:fieldComponent("quoteTransportLocal"),
      gratuity:fieldComponent("quoteTransportGratuity"),
      deposit_hold:fieldComponent("quoteTransportDeposit"),
      other_known_cost:fieldComponent("quoteTransportOther")
    };

    return T.normalizeTransportOption({
      id:value("transportEditId")||undefined,
      mode:value("quoteTransportMode"),
      provider:value("quoteTransportProvider"),
      service_name:value("quoteTransportService"),
      traveler_count:number("quoteTransportTravelers"),
      duration_minutes:optionalNumber("quoteTransportDuration"),
      connections:optionalNumber("quoteTransportConnections"),
      vehicle_occupancy:optionalNumber("quoteTransportVehicleOccupancy"),
      trip_direction:value("quoteTransportDirection"),
      driving_details:{
        distance_miles:distance,mpg,fuel_price:fuelPrice,
        fuel_reference:basis==="EIA WEEKLY REFERENCE"&&activeEiaFuel?`EIA WEEKLY REFERENCE · ${activeEiaFuel.label} · period ${activeEiaFuel.period_end}`:"USER ENTERED PUMP PRICE"
      },
      costs,
      refundable_amount:optionalNumber("quoteTransportRefundable"),
      nonrefundable_amount:optionalNumber("quoteTransportNonrefundable"),
      change_cancel_fee:optionalNumber("quoteTransportCancelFee"),
      cancellation_deadline:value("quoteTransportCancelDeadline"),
      policy_status:value("quoteTransportPolicy"),
      currency:value("currency")||trip.budget.currency||"USD",
      source:{fact_type:"USER_ENTERED",source_name:"Traveler"}
    });
  }

  function lodgingFromForm() {
    const parkingIncluded=checked("quoteLodgingParkingIncluded");
    const breakfastIncluded=checked("quoteLodgingBreakfastIncluded");
    const parkingCost=optionalNumber("quoteLodgingParking");
    const breakfastCost=optionalNumber("quoteLodgingBreakfastCost");
    const costs={
      base_stay_price:fieldComponent("quoteLodgingBase"),
      taxes:fieldComponent("quoteLodgingTaxes"),
      mandatory_fees:fieldComponent("quoteLodgingMandatory"),
      resort_destination_fees:fieldComponent("quoteLodgingResort"),
      cleaning_fee:fieldComponent("quoteLodgingCleaning"),
      parking:parkingCost==null&&parkingIncluded?T.component(0,"USER_ENTERED"):fieldComponent("quoteLodgingParking"),
      pet_fee:fieldComponent("quoteLodgingPet"),
      deposit_hold:fieldComponent("quoteLodgingDeposit"),
      breakfast:breakfastCost==null&&breakfastIncluded?T.component(0,"USER_ENTERED"):fieldComponent("quoteLodgingBreakfastCost"),
      wifi:fieldComponent("quoteLodgingWifiCost"),
      other_mandatory_cost:fieldComponent("quoteLodgingOtherMandatory"),
      optional_cost:fieldComponent("quoteLodgingOptional")
    };
    return T.normalizeLodgingOption({
      id:value("lodgingEditId")||undefined,
      category:value("quoteLodgingCategory"),
      provider:value("quoteLodgingProvider"),
      property:value("quoteLodgingProperty"),
      location:value("quoteLodgingLocation"),
      check_in:value("quoteLodgingCheckIn"),
      check_out:value("quoteLodgingCheckOut"),
      nights:number("quoteLodgingNights"),
      rooms:number("quoteLodgingRooms"),
      occupancy:number("quoteLodgingOccupancy"),
      costs,
      refundable_amount:optionalNumber("quoteLodgingRefundable"),
      nonrefundable_amount:optionalNumber("quoteLodgingNonrefundable"),
      cancellation_fee:optionalNumber("quoteLodgingCancelFee"),
      change_fee:optionalNumber("quoteLodgingChangeFee"),
      cancellation_deadline:value("quoteLodgingCancelDeadline"),
      policy_status:value("quoteLodgingPolicy"),
      currency:value("currency")||trip.budget.currency||"USD",
      amenities:{parking:parkingIncluded,breakfast:breakfastIncluded},
      location_fit:checked("quoteLodgingLocationFit")?"MATCH":"UNKNOWN",
      distance_location_context:value("quoteLodgingLocationContext"),
      source:{fact_type:"USER_ENTERED",source_name:"Traveler"}
    });
  }

  function resetQuoteForm(kind) {
    const qform=$(kind==="transport"?"transportQuoteForm":"lodgingQuoteForm");
    qform.reset();
    $(kind==="transport"?"transportEditId":"lodgingEditId").value="";
    if(kind==="transport"){
      $("quoteTransportTravelers").value=trip.traveler_count||1;
      activeEiaFuel=null;
      $("quoteTransportFuelSourceStatus").textContent="Actual station price is not connected.";
    }
  }

  function setField(id,v){if($(id))$(id).value=v??"";}

  function editOption(kind,id) {
    const option=(kind==="transport"?trip.transportation_options:trip.lodging_options).find(x=>x.id===id);
    if(!option||option.record_origin!=="USER_ENTERED")return;
    if(kind==="transport"){
      setField("transportEditId",id);setField("quoteTransportMode",option.mode);setField("quoteTransportProvider",option.provider);
      setField("quoteTransportService",option.service_name);setField("quoteTransportTravelers",option.traveler_count);
      setField("quoteTransportBase",option.costs.base_price.value);setField("quoteTransportTaxes",option.costs.taxes.value);
      setField("quoteTransportMandatory",option.costs.mandatory_fees.value);setField("quoteTransportOptional",option.costs.optional_fees.value);
      setField("quoteTransportBags",option.costs.baggage.value);setField("quoteTransportSeats",option.costs.seat_fees.value);
      setField("quoteTransportFuel",option.costs.fuel.value);setField("quoteTransportDistance",option.driving_details?.distance_miles);
      setField("quoteTransportMpg",option.driving_details?.mpg);setField("quoteTransportFuelPrice",option.driving_details?.fuel_price);
      const eiaSource=option.costs.fuel?.source?.source_id==="eia_weekly_gasoline";
      setField("quoteTransportFuelBasis",eiaSource?"EIA WEEKLY REFERENCE":"USER ENTERED PUMP PRICE");
      activeEiaFuel=eiaSource?{value:option.driving_details?.fuel_price,label:option.costs.fuel.source.geography||"EIA reference",period_end:option.costs.fuel.source.published_at||"",source:option.costs.fuel.source}:null;
      $("quoteTransportFuelSourceStatus").textContent=eiaSource?`Loaded EIA reference: ${activeEiaFuel.label} · ${activeEiaFuel.period_end}`:"User-entered fuel basis.";
      setField("quoteTransportDirection",option.trip_direction);setField("quoteTransportTolls",option.costs.tolls.value);setField("quoteTransportParking",option.costs.parking.value);
      setField("quoteTransportRentalFees",option.costs.rental_fees.value);setField("quoteTransportYoungDriver",option.costs.young_driver_fee.value);
      setField("quoteTransportAdditionalDriver",option.costs.additional_driver_fee.value);setField("quoteTransportOneWayDrop",option.costs.one_way_drop_fee.value);
      setField("quoteTransportRefuel",option.costs.refueling_exposure.value);setField("quoteTransportTerminal",option.costs.airport_terminal_transport.value);
      setField("quoteTransportLocal",option.costs.estimated_local_transport.value);setField("quoteTransportGratuity",option.costs.gratuity.value);
      setField("quoteTransportDeposit",option.costs.deposit_hold.value);setField("quoteTransportOther",option.costs.other_known_cost.value);
      setField("quoteTransportDuration",option.duration_minutes);setField("quoteTransportConnections",option.connections);setField("quoteTransportVehicleOccupancy",option.vehicle_occupancy);
      setField("quoteTransportRefundable",option.refundable_amount);setField("quoteTransportNonrefundable",option.nonrefundable_amount);
      setField("quoteTransportCancelFee",option.change_cancel_fee);setField("quoteTransportCancelDeadline",option.cancellation_deadline);
      setField("quoteTransportPolicy",option.policy_status);
      $("transportQuoteForm").closest("details").open=true;$("quoteTransportProvider").focus();
    }else{
      setField("lodgingEditId",id);setField("quoteLodgingCategory",option.category);setField("quoteLodgingProvider",option.provider);
      setField("quoteLodgingProperty",option.property);setField("quoteLodgingLocation",option.location);setField("quoteLodgingCheckIn",option.check_in);
      setField("quoteLodgingCheckOut",option.check_out);setField("quoteLodgingNights",option.nights);setField("quoteLodgingRooms",option.rooms);setField("quoteLodgingOccupancy",option.occupancy);
      setField("quoteLodgingBase",option.costs.base_stay_price.value);setField("quoteLodgingTaxes",option.costs.taxes.value);setField("quoteLodgingMandatory",option.costs.mandatory_fees.value);
      setField("quoteLodgingResort",option.costs.resort_destination_fees.value);setField("quoteLodgingCleaning",option.costs.cleaning_fee.value);
      setField("quoteLodgingParking",option.costs.parking.value);setField("quoteLodgingPet",option.costs.pet_fee.value);
      setField("quoteLodgingOtherMandatory",option.costs.other_mandatory_cost.value);setField("quoteLodgingDeposit",option.costs.deposit_hold.value);
      setField("quoteLodgingBreakfastCost",option.costs.breakfast.value);setField("quoteLodgingWifiCost",option.costs.wifi.value);setField("quoteLodgingOptional",option.costs.optional_cost.value);
      setField("quoteLodgingRefundable",option.refundable_amount);setField("quoteLodgingNonrefundable",option.nonrefundable_amount);
      setField("quoteLodgingCancelFee",option.cancellation_fee);setField("quoteLodgingChangeFee",option.change_fee);setField("quoteLodgingCancelDeadline",option.cancellation_deadline);
      setField("quoteLodgingPolicy",option.policy_status);setField("quoteLodgingLocationContext",option.distance_location_context);
      $("quoteLodgingParkingIncluded").checked=option.amenities.parking===true;
      $("quoteLodgingBreakfastIncluded").checked=option.amenities.breakfast===true;
      $("quoteLodgingLocationFit").checked=option.location_fit==="MATCH";
      $("lodgingQuoteForm").closest("details").open=true;$("quoteLodgingProperty").focus();
    }
  }


  const eventTextFields = ['title','location','city','start_date_time','end_date_time','timezone','minimum_age','currency','official_event_url','notes','tags','recurrence'];
  function resetEventEditor() {
    $('eventForm').reset(); $('event_category').value='OTHER'; $('event_price_type').value='UNKNOWN'; $('event_event_status').value='UNKNOWN'; $('eventEditId').value=''; $('eventFormError').textContent='';
  }
  function eventDate(date, occurrence) {
    if(!date)return 'Date not added';
    try{
      if(occurrence.all_day)return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
      const zone=occurrence.timezone||'UTC';
      return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short',timeZone:zone}).format(new Date(date))+' '+zone;
    }catch(_){return date;}
  }
  function eventCard(event, reasons = []) {
    const p=E.priceTruth(event);
    const times=event.occurrences.map(o=>`${eventDate(o.start_date_time,o)} → ${o.end_date_time?eventDate(o.end_date_time,o):'End not added'} · ${E.occurrenceTimeState(o,Date.now())==='DATE_UNKNOWN'?'Check event dates':friendly(E.occurrenceTimeState(o,Date.now()))}`).join('; ');
    const provenance=event.occurrences.map(o=>`${o.timezone||'UNKNOWN'} · organizer: ${o.status} · source: ${o.source.source_name} · ${E.occurrenceSourceState(event,o)} · retrieved ${o.source.retrieved_at||'UNKNOWN'}`).join('; ');
    return `<article class="option-card"><span class="intel-badge">${event.record_origin==='USER_ENTERED'?'Added by you':event.record_origin==='IMPORTED'?'Imported — check details':'Source-backed event'}</span><h4>${escape(event.title)}</h4>
      <p>${escape(friendly(event.category))} · ${escape(event.location||event.city||'Add a location')} · ${escape(event.event_status==='UNKNOWN'?'Check organizer status':friendly(event.event_status))}</p>
      <p>${escape(times||'Add an event date')}</p><p>${p.unknownRequiredComponents.length===2?'Add admission prices':money(p.knownRequiredCost,event.currency)+' in known admission costs'}${p.requiredComplete?'':' · Check missing prices before budgeting.'}</p>
      <details class="method-notes"><summary>Event information notes</summary><p>These planning details are not live ticket inventory. Price type: ${escape(friendly(event.price_type))}. Coverage: ${escape(p.coverage)}. Missing required costs: ${escape(p.unknownRequiredComponents.map(friendly).join(', ')||'None')}. Known optional travel costs: ${money(p.knownOptionalCost,event.currency)}.</p><p>Minimum age: ${event.minimum_age??'Not known'}; verify eligibility. Family-friendly: ${event.family_friendly===null?'Not known':event.family_friendly?'Yes':'No'}.</p><p>${escape(provenance)}. Source/freshness: ${escape(E.sourceState(event))} · ${escape(event.source.source_name)} · retrieved ${escape(event.source.retrieved_at||'UNKNOWN')} · ${escape(event.source.notes)}. Website (not independently verified): ${escape(event.official_event_url||'Not added')}</p></details>
      ${event.notes?`<p>${escape(event.notes)}</p>`:''}${reasons.length?`<p>Why it fits: ${escape(reasons.map(friendly).join(' · '))}</p>`:''}
      <div class="button-row">${event.record_origin==='USER_ENTERED'?`<button type="button" class="secondary edit-event" data-id="${escape(event.id)}">Edit event</button>`:''}<button type="button" class="secondary remove-event" data-id="${escape(event.id)}">Remove event</button></div></article>`;
  }
  function renderEvents() {
    const filters={};
    for (const key of ['start','end','location','category','seasonal_theme','price_type','indoor_outdoor','event_status']) filters[key]=value('eventFilter_'+key);
    if (value('eventFilter_age')!=='') filters.age=Number(value('eventFilter_age'));
    if (value('eventFilter_family_friendly')!=='') filters.family_friendly=value('eventFilter_family_friendly')==='true';
    const events=E.filterEvents(trip.events,filters);
    $('eventCounts').textContent=trip.events.length?`${events.length} of ${trip.events.length} saved event(s) shown`:'';
    $('eventRecords').innerHTML=events.map(e=>eventCard(e)).join('') || `<div class="empty-state"><p>${trip.events.length?'Try another filter or add an event.':'Add a concert, festival, game or attraction to your plan.'}</p><button class="secondary open-event" type="button">Add an event</button></div>`;
    const matchingTrip={...trip,destination:value('destination'),dates:{start:value('startDate'),end:value('endDate')},identity:{purpose:value('purpose'),vibe:value('vibe')},preferences:{interests:[...document.querySelectorAll('[name="interest"]:checked')].map(x=>x.value)}};
    const matches=E.matchTripEvents(matchingTrip);
    $('eventMatches').innerHTML=matches.map(m=>eventCard(m.event,m.reasons)).join('') || '<p class="empty-state">Add trip dates and an event with matching dates and location to see it here.</p>';
  }
  const eventSelectOptions={category:E.CATEGORIES,price_type:E.PRICE_TYPES,event_status:E.STATUSES,seasonal_theme:E.SEASONS,indoor_outdoor:['UNKNOWN','INDOOR','OUTDOOR','BOTH'],family_friendly:['','true','false']};
  for (const [key,options] of Object.entries(eventSelectOptions)) {
    const labels=x=>x===''||x==='UNKNOWN'?'Not sure':x==='true'?'Yes':x==='false'?'No':friendly(x);
    $('event_'+key).innerHTML=(key==='seasonal_theme'?['',...options]:options).map(x=>`<option value="${x}">${labels(x)}</option>`).join('');
    $('eventFilter_'+key).innerHTML='<option value="">Any</option>'+options.filter(Boolean).map(x=>`<option value="${x}">${labels(x)}</option>`).join('');
  }
  $('eventForm').onsubmit=e=>{
    e.preventDefault();
    try {
      const id=value('eventEditId');
      const previous=trip.events.find(x=>x.id===id);
      const input={...(previous||{}),id:id||undefined};
      eventTextFields.forEach(k=>{input[k]=value('event_'+k)});
      input.minimum_age=optionalNumber('event_minimum_age'); input.tags=value('event_tags').split(',').map(x=>x.trim()).filter(Boolean);
      for(const k of ['category','price_type','indoor_outdoor','event_status']) input[k]=value('event_'+k);
      input.seasonal_theme=[...$('event_seasonal_theme').selectedOptions].map(o=>o.value).filter(Boolean);
      input.family_friendly=value('event_family_friendly')===''?null:value('event_family_friendly')==='true';
      input.all_day=checked('event_all_day');
      E.COSTS.forEach(k=>{input[k]=E.component(optionalNumber('event_'+k))});
      input.source={source_url:input.official_event_url,notes:value('event_source_note')};
      if(value('event_occurrences')) {
        input.occurrences=JSON.parse(value('event_occurrences'));
        if(!Array.isArray(input.occurrences) || input.occurrences.some(o=>!o || typeof o!=='object' || Array.isArray(o))) throw Error('Explicit occurrences must be an array of objects.');
      } else delete input.occurrences;
      const event=E.normalizeEvent(input);
      const index=trip.events.findIndex(x=>x.id===event.id);
      if(index<0)trip.events.push(event);else trip.events[index]=event;
      resetEventEditor();renderEvents();planningVisibility();
    } catch(err){$('eventFormError').textContent=err.message;}
  };
  $('cancelEventEdit').onclick=resetEventEditor;
  $('eventFilters').addEventListener('input',renderEvents);
  document.addEventListener('click',e=>{
    if(e.target.matches('.remove-event')){
      trip.events=trip.events.filter(x=>x.id!==e.target.dataset.id);
      if(value('eventEditId')===e.target.dataset.id) resetEventEditor();
      renderEvents();planningVisibility();
    }
    if(e.target.matches('.edit-event')){
      const event=trip.events.find(x=>x.id===e.target.dataset.id);
      if(!event || event.record_origin!=='USER_ENTERED')return;
      resetEventEditor();$('eventEditId').value=event.id;
      eventTextFields.forEach(k=>{$('event_'+k).value=event[k]??''});$('event_tags').value=event.tags.join(', ');
      for(const k of ['category','price_type','indoor_outdoor','event_status'])$('event_'+k).value=event[k];
      [...$('event_seasonal_theme').options].forEach(o=>o.selected=event.seasonal_theme.includes(o.value));
      const occurrence=event.occurrences[0];
      const defaultOccurrence=event.occurrences.length===1 && E.occurrenceMirrorsEvent(event,occurrence);
      $('event_occurrences').value=defaultOccurrence?'':JSON.stringify(event.occurrences,null,2);
      $('event_family_friendly').value=event.family_friendly===null?'':String(event.family_friendly);
      $('event_all_day').checked=event.all_day;$('event_source_note').value=event.source.notes;
      E.COSTS.forEach(k=>{$('event_'+k).value=event[k].value??''});
      $('eventEditor').open=true;$('event_title').focus();
    }
  });

  $("nextStep").onclick=()=>showStep(step+1);
  $("prevStep").onclick=()=>showStep(step-1);
  form.onsubmit=e=>{e.preventDefault();renderBlueprint();};
  $("addTraveler").onclick=()=>$("travelerRows").insertAdjacentHTML("beforeend",travelerRow());
  $("addReservation").onclick=()=>$("reservationRows").insertAdjacentHTML("beforeend",reservationRow());

  document.addEventListener("click",e=>{
    if(e.target.matches(".remove-row"))e.target.closest(".editor-row").remove();
    if(e.target.matches(".remove-option")){
      const key=e.target.dataset.kind==="transport"?"transportation_options":"lodging_options";
      trip[key]=trip[key].filter(x=>x.id!==e.target.dataset.id);
      renderIntelligence();
    }
    if(e.target.matches(".edit-option"))editOption(e.target.dataset.kind,e.target.dataset.id);
  });

  $("saveTrip").onclick=()=>{
    collect();syncRows();
    const v=validateWholeTrip(trip);
    if(!v.valid)return alert(v.errors.join("\n"));
    localStorage.setItem(B.STORAGE_KEY,JSON.stringify(trip));
    $("persistenceStatus").textContent="Trip saved in this browser.";
  };

  $("loadTrip").onclick=()=>{
    try{
      const raw=localStorage.getItem(B.STORAGE_KEY)||localStorage.getItem(B.V2_STORAGE_KEY)||localStorage.getItem(B.LEGACY_STORAGE_KEY);
      if(!raw)throw Error("No saved trip found in this browser.");
      const original=JSON.parse(raw),t=T.sanitizePersistedTripOptions(B.migrateTrip(original)),v=validateWholeTrip(t);
      if(!v.valid)throw Error(v.errors.join(" "));
      populate(t);
      $("persistenceStatus").textContent=original.schema_version<3?`Your older saved trip is ready. Save it again to keep the updated format.`:"Saved trip loaded.";
    }catch(e){$("persistenceStatus").textContent=e.message;}
  };

  $("startOver").onclick=()=>{
    if(!confirm("Start over? The saved copy remains until you save again."))return;
    populate(B.createTrip());$("planResults").hidden=true;$("persistenceStatus").textContent="Started a new local trip.";
  };

  $("exportTrip").onclick=()=>{
    collect();syncRows();
    const v=validateWholeTrip(trip);
    if(!v.valid){$("persistenceStatus").textContent=`Export blocked: ${v.errors.join(" ")}`;return;}
    const blob=new Blob([JSON.stringify(trip,null,2)],{type:"application/json"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download="suitcase-brain-trip.json";a.click();URL.revokeObjectURL(a.href);
  };

  $("importTrip").onchange=async e=>{
    try{
      if(!e.target.files?.[0])return;
      const original=JSON.parse(await e.target.files[0].text()),t=T.sanitizePersistedTripOptions(B.migrateTrip(original)),v=validateWholeTrip(t);
      if(!v.valid)throw Error(v.errors.join(" "));
      populate(t);
      $("persistenceStatus").textContent=`Trip uploaded. Save it to keep it in this browser.`;
    }catch(err){$("persistenceStatus").textContent=`Import rejected: ${err.message}`;}
    e.target.value="";
  };

  $("emergencyToggle").onclick=()=>{
    $("emergencyPanel").hidden=!$("emergencyPanel").hidden;
    $("emergencyToggle").setAttribute("aria-expanded",String(!$("emergencyPanel").hidden));
    if(!$("emergencyPanel").hidden)$("emergencyScenario").focus();
  };

  $("quoteTransportMode").innerHTML=T.TRANSPORT_MODES.map(x=>`<option value="${x}">${friendly(x)}</option>`).join("");
  $("quoteLodgingCategory").innerHTML=T.LODGING_CATEGORIES.map(x=>`<option value="${x}">${friendly(x)}</option>`).join("");

  $("transportQuoteForm").onsubmit=e=>{
    e.preventDefault();
    try{
      const option=transportFromForm(),v=T.validateTransportOption(option);
      if(!v.valid)throw Error(v.errors.join(" "));
      const index=trip.transportation_options.findIndex(x=>x.id===option.id);
      if(index<0)trip.transportation_options.push(option);else trip.transportation_options[index]=option;
      $("transportFormError").textContent="";
      resetQuoteForm("transport");renderIntelligence();
    }catch(err){$("transportFormError").textContent=err.message;}
  };

  $("lodgingQuoteForm").onsubmit=e=>{
    e.preventDefault();
    try{
      const option=lodgingFromForm(),v=T.validateLodgingOption(option);
      if(!v.valid)throw Error(v.errors.join(" "));
      const index=trip.lodging_options.findIndex(x=>x.id===option.id);
      if(index<0)trip.lodging_options.push(option);else trip.lodging_options[index]=option;
      $("lodgingFormError").textContent="";
      resetQuoteForm("lodging");renderIntelligence();
    }catch(err){$("lodgingFormError").textContent=err.message;}
  };

  $("cancelTransportEdit").onclick=()=>resetQuoteForm("transport");
  $("cancelLodgingEdit").onclick=()=>resetQuoteForm("lodging");

  $("useEiaFuelReference").onclick=async()=>{
    const selectedCurrency=value("currency")||trip.budget.currency||"USD";
    if(selectedCurrency!=="USD"){
      activeEiaFuel=null;
      $("quoteTransportFuelSourceStatus").textContent="EIA gasoline is USD per gallon. use USD or enter a pump price in your selected currency.";
      return;
    }
    const api=window.SourceIntelligence;
    if(!api?.loadFuelReference){
      $("quoteTransportFuelSourceStatus").textContent="Use a pump price for now; the weekly estimate is unavailable.";
      return;
    }
    const button=$("useEiaFuelReference");
    button.disabled=true;
    $("quoteTransportFuelSourceStatus").textContent="Loading official EIA weekly reference…";
    try{
      activeEiaFuel=await api.loadFuelReference(value("destination"));
      setField("quoteTransportFuelPrice",activeEiaFuel.value);
      setField("quoteTransportFuelBasis","EIA WEEKLY REFERENCE");
      $("quoteTransportFuelSourceStatus").textContent=`${activeEiaFuel.label} · week ending ${activeEiaFuel.period_end} · ${activeEiaFuel.freshness.status.toUpperCase()} · not a station quote`;
    }catch(err){
      activeEiaFuel=null;
      $("quoteTransportFuelSourceStatus").textContent="The weekly estimate could not load. Try again or enter a pump price.";
    }finally{button.disabled=false;}
  };

  window.addEventListener("suitcasebrain:fuel-reference",e=>{ if(e.detail) activeEiaFuel=e.detail; });
  $("quoteTransportFuelPrice").addEventListener("input",()=>{
    if(activeEiaFuel&&optionalNumber("quoteTransportFuelPrice")!=null&&Math.abs(optionalNumber("quoteTransportFuelPrice")-activeEiaFuel.value)>0.0005){
      activeEiaFuel=null;setField("quoteTransportFuelBasis","USER ENTERED PUMP PRICE");
      $("quoteTransportFuelSourceStatus").textContent="Using the pump price you entered.";
    }
  });
  $("destination").addEventListener("input",()=>{activeEiaFuel=null;});

  document.addEventListener('click',event=>{
    const reveal=event.target.closest('.reveal-planning');
    if(reveal){openedPlanningTools.add(reveal.dataset.workspace);planningVisibility();const name=reveal.dataset.workspace;const target=$(({transport:'transportWorkspace',lodging:'lodgingWorkspace',events:'eventsWorkspace',fuel:'fuelReference',weather:'weatherReference'})[name]);target?.scrollIntoView({block:'start',behavior:'auto'});}
    const add=event.target.closest('.open-quote');
    if(add){const editor=$(add.dataset.kind==='lodging'?'lodgingEditor':'transportEditor');editor.open=true;editor.querySelector('input:not([type="hidden"]),select')?.focus();}
    if(event.target.closest('.open-event')){$('eventEditor').open=true;$('event_title').focus();}
  });
  $('useFuelEstimate').onclick=()=>{openedPlanningTools.add('transport');planningVisibility();$('transportEditor').open=true;$('transportEditor .quote-advanced').open=true;$('useEiaFuelReference').click();$('quoteTransportDistance').focus();};

  feeRows();
  renderIntelligence();
  resetQuoteForm("transport");
  showStep(0,false);
})();
