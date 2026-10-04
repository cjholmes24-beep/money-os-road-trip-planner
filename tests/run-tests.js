"use strict";

const assert = require("assert");
const B = require("../trip-intelligence.js");
const S = require("../source-intelligence.js");
const T = require("../transport-lodging-intelligence.js");

(async () => {
  let assertions = 0;
  const ok = (v, m) => { assert(v, m); assertions++; };
  const eq = (a, b, m) => { assert.deepEqual(a, b, m); assertions++; };

  // Core V2 + V1 migration.
  let t = B.createTrip();
  eq(t.schema_version, 2);
  ok(B.validateTrip(t).valid);
  ok(B.validateTrip(JSON.parse(JSON.stringify(t))).valid, "canonical serialization");

  const v1 = JSON.parse(JSON.stringify(t));
  v1.schema_version = 1;
  delete v1.transportation_options;
  delete v1.lodging_options;
  const migrated = B.migrateTrip(v1);
  eq(migrated.schema_version, 2);
  eq(migrated.transportation_options, []);
  eq(migrated.lodging_options, []);
  ok(B.validateTrip(migrated).valid);
  assert.throws(() => B.migrateTrip({ ...v1, schema_version: 99 }), /Unsupported/); assertions++;
  assert.throws(() => B.migrateTrip(null), /object/); assertions++;

  // Existing group-money doctrine.
  t.budget = { total: 1000, reserve: 200, currency: "USD" };
  t.traveler_count = 4;
  t.travelers = [1,2,3,4].map((x,i) => ({
    label: `T${x}`,
    amount_committed: 250,
    amount_paid: i < 3 ? 250 : 0,
    commitment_state: i < 3 ? "FULL_SHARE_FUNDED" : "ACCEPTED"
  }));
  const m = B.budgetMetrics(t);
  eq([m.spendable,m.plannedShare,m.fundedAmount,m.unfundedGap,m.plannedCount,m.committed,m.funded],[800,250,750,250,4,4,3]);

  const d = B.dropoutScenario(t,1);
  eq(d.remaining,3);
  ok(Math.abs(d.newShare - 333.3333333333333) < .001);
  ok(Math.abs(d.increasePerRemaining - 83.33333333333331) < .001);
  eq(d.totalFundingShortage,500);

  const unpaid = B.dropoutScenario(t,0,true,true);
  eq(unpaid.dropouts,1);
  eq(unpaid.totalFundingShortage,250);
  eq(unpaid.remaining,3);

  const noRows = B.createTrip({ budget:{total:1200,reserve:120,currency:"USD"}, traveler_count:4 });
  const noRowsDrop = B.dropoutScenario(noRows,1);
  eq(noRowsDrop.remaining,3);
  eq(noRowsDrop.newShare,400);

  const c = B.cancellationExposure([{
    booking_price:500,deposit_paid:200,amount_paid_beyond_deposit:100,remaining_balance:200,
    refundable_amount:150,nonrefundable_amount:150,change_rebooking_fee:25,
    provider_cancellation_fee:10,provider_no_show_fee:0,
    credit_voucher_possibility:"UNKNOWN",policy_status:"USER-ENTERED"
  }]);
  eq([c.totalBookedValue,c.totalAlreadyPaid,c.remainingBalance,c.estimatedRecoverable,c.estimatedNonrefundable,c.estimatedFees,c.netEstimatedLoss],[500,300,200,150,150,35,185]);

  const f = B.hiddenFeeMetrics([
    {status:"UNKNOWN",amount:null},
    {status:"USER-ENTERED",amount:25},
    {status:"NOT APPLICABLE",amount:99}
  ]);
  eq(f,{total:25,counted:1,unknown:1});

  ok(!B.validateTrip({...t,schema_version:99}).valid);
  ok(!B.validateTrip(null).valid);
  ok(!B.validateTrip({...t,budget:{total:1,reserve:2}}).valid);

  const badFee = JSON.parse(JSON.stringify(t));
  badFee.hidden_fees = [{category:"made-up fee",status:"UNKNOWN",amount:null}];
  ok(!B.validateTrip(badFee).valid);

  const badDates = JSON.parse(JSON.stringify(t));
  badDates.dates = {start:"2026-12-10",end:"2026-12-01",flexibility:"fixed"};
  ok(!B.validateTrip(badDates).valid);

  const partial = B.createTrip({
    budget:{total:1000,reserve:100,currency:"USD"},
    traveler_count:4,
    travelers:[
      {amount_committed:250,amount_paid:250,commitment_state:"FULL_SHARE_FUNDED"},
      {amount_committed:250,amount_paid:250,commitment_state:"FULL_SHARE_FUNDED"}
    ]
  });
  const group = B.resilience(partial).find(x => x.label === "Group commitment");
  eq(group.status,"WATCH");
  ok(group.reason.includes("2 planned traveler(s) have no record yet"));

  // Source freshness and alias safety.
  const fresh = S.classifyFreshness(
    {fact_type:"LIVE",retrieved_at:"2026-01-01T00:00:00Z",freshness_seconds:3600},
    Date.parse("2026-01-01T00:30:00Z")
  );
  eq([fresh.label,fresh.status],["LIVE","fresh"]);
  eq(S.classifyFreshness(
    {fact_type:"LIVE",retrieved_at:"2026-01-01T00:00:00Z",freshness_seconds:3600},
    Date.parse("2026-01-01T03:00:00Z")
  ).status,"stale");
  eq(S.classifyFreshness({}).label,"UNKNOWN");
  eq(S.classifyFreshness(
    {fact_type:"WEEKLY_GOVERNMENT_DATA",retrieved_at:"2026-01-01T00:00:00Z"},
    Date.parse("2026-01-11T00:00:00Z")
  ).status,"aging");
  eq(S.matchAlias("Los Angeles, CA","ca"),true);
  eq(S.matchAlias("Cancun, Mexico","ca"),false);
  const places = [
    {label:"California",aliases:["california","ca"]},
    {label:"U.S. average",aliases:["united states","us","u.s."]}
  ];
  eq(S.pickFuelPlace(places,"Cancun, Mexico").label,"U.S. average");

  // Numeric nulls must never become hidden zeroes.
  eq(T.sourceMetadata({freshness_seconds:null}).freshness_seconds,null);
  assert.throws(() => T.drivingFuelCost({distance_miles:100,mpg:25,fuel_price:null}), /known nonnegative/); assertions++;

  // Transport truth model: mode-specific mandatory components.
  let flight = T.normalizeTransportOption({
    mode:"FLIGHT",provider:"Traveler quote",traveler_count:2,duration_minutes:180,
    base_price:400,taxes:80,mandatory_fees:0,baggage:0,seat_fees:40,
    airport_terminal_transport:0,other_known_cost:0,optional_fees:25,
    deposit_hold:0,nonrefundable_amount:100,change_cancel_fee:25,
    policy_status:"USER_ENTERED",currency:"USD"
  });
  ok(T.validateTransportOption(flight).valid);
  const fp = T.priceCompleteness(flight,"transport");
  ok(fp.mandatoryComplete);
  eq(fp.knownTotal,520);
  eq(fp.knownOptionalAddOns,25);
  eq(fp.knownAllInTotal,545);
  eq(fp.depositHold,0);
  eq(fp.knownTotal/flight.traveler_count,260);
  eq(T.cancellationExposure(flight).potentialExposure,125);

  // Known policy with missing amounts is not treated as zero-risk.
  const incompletePolicy = T.normalizeTransportOption({
    mode:"FLIGHT",traveler_count:1,base_price:100,taxes:0,mandatory_fees:0,
    baggage:0,seat_fees:0,airport_terminal_transport:0,other_known_cost:0,
    policy_status:"USER_ENTERED"
  });
  const incompleteCancel = T.cancellationExposure(incompletePolicy);
  eq(incompleteCancel.complete,false);
  eq(incompleteCancel.potentialExposure,null);
  ok(incompleteCancel.label.includes("INCOMPLETE"));

  // Rental cost fields remain separate and additive only when relevant.
  const rental = T.normalizeTransportOption({
    mode:"RENTAL_CAR",traveler_count:2,base_price:200,taxes:20,mandatory_fees:0,
    rental_fees:40,young_driver_fee:30,additional_driver_fee:20,one_way_drop_fee:50,
    fuel:25,parking:10,tolls:5,other_known_cost:0
  });
  eq(T.priceCompleteness(rental,"transport").knownTotal,400);

  // Lodging required total excludes optional extras from ranking.
  const lodging = T.normalizeLodgingOption({
    category:"HOTEL",provider:"Traveler source",property:"Quoted hotel",nights:2,rooms:1,occupancy:2,
    base_stay_price:258,taxes:42,mandatory_fees:20,resort_destination_fees:0,
    cleaning_fee:0,parking:0,pet_fee:0,other_mandatory_cost:0,
    breakfast:30,wifi:0,optional_cost:50,deposit_hold:100,
    nonrefundable_amount:160,cancellation_fee:25,change_fee:0,
    policy_status:"USER_ENTERED",currency:"USD"
  });
  ok(T.validateLodgingOption(lodging).valid);
  const lp = T.priceCompleteness(lodging,"lodging");
  eq(lp.knownTotal,320);
  eq(lp.knownOptionalAddOns,80);
  eq(lp.knownAllInTotal,400);
  eq(lp.knownTotal/lodging.nights,160);
  eq(lp.depositHold,100);
  eq(T.cancellationExposure(lodging).potentialExposure,185);

  const sourceBacked = T.normalizeLodgingOption({
    category:"HOTEL",property:"Published property",nights:1,rooms:1,occupancy:1,
    source:{fact_type:"PUBLISHED",source_name:"Provider"}
  },{origin:"SOURCE_BACKED"});
  eq(sourceBacked.record_origin,"SOURCE_BACKED");
  eq(sourceBacked.costs.base_stay_price.state,"UNKNOWN");

  const badLodging = T.normalizeLodgingOption({category:"HOTEL",property:"Bad",nights:0,rooms:1,occupancy:1,base_stay_price:-10});
  ok(!T.validateLodgingOption(badLodging).valid);

  // Imported option collections fail closed.
  const badOptionTrip = B.createTrip();
  badOptionTrip.transportation_options = [{id:"broken"}];
  ok(!T.validateTripOptions(badOptionTrip).valid);

  // Comparison helpers.
  const completeTransport = (mode, provider, total, currency="USD", payout="UNKNOWN") => {
    const option = T.normalizeTransportOption({
      mode,provider,traveler_count:2,duration_minutes:mode==="BUS"?300:180,
      policy_status:"USER_ENTERED",nonrefundable_amount:0,change_cancel_fee:0,
      deposit_hold:0,currency,booking:{affiliate_relationship:payout}
    });
    for (const name of T.TRANSPORT_MANDATORY_BY_MODE[mode] || T.TRANSPORT_MANDATORY_BY_MODE.OTHER) {
      option.costs[name] = T.component(name==="base_price"?total:0,name==="base_price"?"USER_ENTERED":"NOT_APPLICABLE");
    }
    return option;
  };

  const ta = completeTransport("BUS","A",100,"USD","Pays more");
  const tb = completeTransport("RAIL","B",120,"USD","NO_RELATIONSHIP");
  eq(T.compareTransport([ta,tb]).find(x=>x.label==="LOWEST KNOWN COST").winner_id,ta.id);
  eq(T.compareTransport([ta,tb]).find(x=>x.label==="FASTEST KNOWN OPTION").winner_id,tb.id);
  eq(T.compareTransport([ta,tb]).find(x=>x.label==="LOWEST KNOWN COST PER TRAVELER").winner_id,ta.id);
  const incompleteForCompare=T.normalizeTransportOption({mode:"BUS",provider:"Partial",traveler_count:2,base_price:50,currency:"USD"});
  eq(T.compareTransport([ta,incompleteForCompare]).find(x=>x.label==="LOWEST KNOWN COST").status,"NOT ENOUGH VERIFIED DATA TO COMPARE");

  // Affiliate payout is ignored by traveler ranking.
  const richAffiliate = completeTransport("BUS","High payout",150,"USD","VERY_HIGH");
  const noAffiliate = completeTransport("BUS","No payout",90,"USD","NO_RELATIONSHIP");
  eq(T.compareTransport([richAffiliate,noAffiliate]).find(x=>x.label==="LOWEST KNOWN COST").winner_id,noAffiliate.id);

  // Mixed currency never produces a fake cheapest option.
  const eur = completeTransport("BUS","Euro quote",80,"EUR");
  eq(T.compareTransport([ta,eur]).find(x=>x.label==="LOWEST KNOWN COST").status,"CURRENCY CONVERSION REQUIRED");

  // Lodging comparison.
  const completeLodging = (property,total,currency="USD") => {
    const option = T.normalizeLodgingOption({
      category:"HOTEL",property,nights:2,rooms:1,occupancy:2,currency,
      policy_status:"USER_ENTERED",nonrefundable_amount:0,cancellation_fee:0,change_fee:0
    });
    T.LODGING_MANDATORY.forEach(name => {
      option.costs[name] = T.component(name==="base_stay_price"?total:0,name==="base_stay_price"?"USER_ENTERED":"NOT_APPLICABLE");
    });
    return option;
  };
  const la=completeLodging("A",300),lb=completeLodging("B",250);
  eq(T.compareLodging([la,lb]).find(x=>x.label==="LOWEST KNOWN TOTAL").winner_id,lb.id);

  // Driving and booking gates.
  const fuel=T.drivingFuelCost({distance_miles:300,trip_direction:"ROUND_TRIP",mpg:30,fuel_price:3});
  eq([fuel.miles,fuel.gallons,fuel.cost],[600,20,60]);
  eq(T.drivingFuelCost({distance_miles:300,trip_direction:"ONE_WAY",mpg:30,fuel_price:3}).cost,30);

  const booking=T.bookingOpportunity({relationship_status:"APPROVED",url_status:"VERIFIED",verified_booking_url:"javascript:alert(1)"});
  eq(booking.url_status,"NOT_VERIFIED");
  eq(T.bookingUrl({booking}),null);
  const forgedPersisted=T.bookingOpportunity({relationship_status:"APPROVED",url_status:"VERIFIED",verified_booking_url:"https://attacker.example/book"});
  eq(T.bookingUrl({booking:forgedPersisted}),null);
  const verified=T.bookingOpportunity({relationship_status:"APPROVED",url_status:"VERIFIED",verified_booking_url:"https://provider.example/book"},{trusted:true});
  ok(T.bookingUrl({booking:verified}).startsWith("https://provider.example/"));
  const liveSourceOption=T.normalizeTransportOption({
    mode:"BUS",traveler_count:1,
    costs:{
      base_price:{value:10,state:"PUBLISHED"},
      taxes:{value:0,state:"PUBLISHED"},
      mandatory_fees:{value:0,state:"PUBLISHED"},
      baggage:{value:0,state:"PUBLISHED"}
    },
    policy_status:"PUBLISHED",nonrefundable_amount:0,change_cancel_fee:0,
    availability_status:"PUBLISHED",
    source:{fact_type:"PUBLISHED",source_name:"Official source"},
    booking:{relationship_status:"APPROVED",url_status:"VERIFIED",verified_booking_url:"https://provider.example/book"}
  },{origin:"SOURCE_BACKED",trustedBooking:true});
  ok(T.bookingUrl(liveSourceOption)?.startsWith("https://provider.example/"));
  const persisted=T.sanitizePersistedTripOptions({...B.createTrip(),transportation_options:[liveSourceOption]});
  eq(persisted.transportation_options[0].record_origin,"IMPORTED");
  eq(persisted.transportation_options[0].costs.base_price.state,"USER_ENTERED");
  eq(persisted.transportation_options[0].policy_status,"USER_ENTERED");
  eq(persisted.transportation_options[0].availability_status,"UNKNOWN");
  eq(persisted.transportation_options[0].source.fact_type,"UNKNOWN");
  eq(persisted.transportation_options[0].booking.url_status,"NOT_VERIFIED");
  eq(T.bookingUrl(persisted.transportation_options[0]),null);

  // GTFS foundation does not claim service-date eligibility without calendar evaluation.
  const gtfs=T.normalizeGtfsSchedule({
    agency:[{agency_id:"A",agency_name:"Agency"}],
    routes:[{route_id:"R",agency_id:"A"}],
    trips:[{trip_id:"T",route_id:"R",service_id:"WK"}],
    stops:[{stop_id:"1",stop_name:"First"},{stop_id:"2",stop_name:"Last"}],
    stop_times:[
      {trip_id:"T",stop_id:"1",stop_sequence:"1",departure_time:"08:00:00"},
      {trip_id:"T",stop_id:"2",stop_sequence:"2",arrival_time:"09:00:00"}
    ]
  },"20261004");
  eq(gtfs.trips[0].scheduled_departure,"08:00:00");
  eq(gtfs.trips[0].scheduled_arrival,"09:00:00");
  eq(gtfs.trips[0].service_date_status,"UNVERIFIED_AGAINST_CALENDAR");
  eq(gtfs.trips[0].transfer_count,null);

  // Async provider failures remain isolated and never expose provider error details.
  const failed=await T.isolateProvider("broken",async()=>{throw Error("token leaked details")});
  const healthy=await T.isolateProvider("healthy",async()=>[1]);
  eq(failed.status,"UNAVAILABLE");
  eq(failed.error,"PROVIDER UNAVAILABLE");
  eq(healthy.data,[1]);

  console.log(`Suitcase Brain: ${assertions} assertions passed`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
