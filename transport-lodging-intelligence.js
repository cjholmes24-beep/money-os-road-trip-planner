(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TransportLodgingIntelligence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TRUTH_STATES = ["VERIFIED", "PUBLISHED", "USER_ENTERED", "UNKNOWN", "NOT_APPLICABLE"];
  const TRANSPORT_MODES = ["DRIVE", "FLIGHT", "RENTAL_CAR", "BUS", "RAIL", "PUBLIC_TRANSIT", "RIDESHARE", "TAXI", "AIRPORT_TRANSFER", "SHUTTLE", "GROUP_VAN", "SPRINTER", "MINIBUS", "CHARTER_BUS", "CRUISE_PORT_TRANSFER", "OTHER"];
  const LODGING_CATEGORIES = ["HOTEL", "MOTEL", "RESORT", "APARTMENT", "VACATION_RENTAL", "CABIN", "HOSTEL", "BED_AND_BREAKFAST", "CAMPGROUND", "OTHER"];
  const POLICY_STATES = ["VERIFIED", "PUBLISHED", "USER_ENTERED", "UNKNOWN"];
  const AVAILABILITY_STATES = ["VERIFIED", "PUBLISHED", "USER_ENTERED", "UNKNOWN", "UNAVAILABLE"];
  const RELATIONSHIP_STATES = ["APPROVED", "AVAILABLE_BUT_NOT_VERIFIED", "PROVIDER_ACCESS_REQUIRED", "NO_RELATIONSHIP", "UNKNOWN"];
  const LINK_STATES = ["VERIFIED", "NOT_VERIFIED", "NOT_AVAILABLE"];
  const TRANSPORT_COSTS = ["base_price", "taxes", "mandatory_fees", "optional_fees", "baggage", "seat_fees", "parking", "tolls", "fuel", "rental_fees", "young_driver_fee", "additional_driver_fee", "one_way_drop_fee", "refueling_exposure", "airport_terminal_transport", "estimated_local_transport", "gratuity", "deposit_hold", "other_known_cost"];
  const TRANSPORT_MANDATORY = ["base_price", "taxes", "mandatory_fees", "baggage", "seat_fees", "parking", "tolls", "fuel", "rental_fees", "young_driver_fee", "additional_driver_fee", "one_way_drop_fee", "refueling_exposure", "airport_terminal_transport", "gratuity", "other_known_cost"];
  const LODGING_COSTS = ["base_stay_price", "taxes", "mandatory_fees", "resort_destination_fees", "cleaning_fee", "parking", "pet_fee", "deposit_hold", "breakfast", "wifi", "other_mandatory_cost", "optional_cost"];
  const LODGING_MANDATORY = ["base_stay_price", "taxes", "mandatory_fees", "resort_destination_fees", "cleaning_fee", "parking", "pet_fee", "other_mandatory_cost"];
  const AMENITIES = ["pool", "private_pool", "hot_tub", "cold_plunge", "fire_pit", "waterfront", "lake", "river", "mountain_view", "beach_access", "dock", "fishing", "kitchen", "washer_dryer", "parking", "breakfast", "gym", "accessible_room", "pet_friendly", "workspace", "meeting_space", "group_rooms"];

  const uid = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const finite = value => Number.isFinite(Number(value)) && Number(value) >= 0;
  const component = (value = null, state = "UNKNOWN", source = null) => ({ value: state === "UNKNOWN" || state === "NOT_APPLICABLE" || value === "" ? null : Number(value), state, source });
  const safeText = value => typeof value === "string" ? value.trim().slice(0, 1000) : "";
  const validComponent = item => item && TRUTH_STATES.includes(item.state) && ((item.state === "UNKNOWN" || item.state === "NOT_APPLICABLE") ? item.value == null : finite(item.value));
  const sum = (items, names) => names.reduce((total, name) => total + (finite(items[name]?.value) && !["UNKNOWN", "NOT_APPLICABLE"].includes(items[name]?.state) ? Number(items[name].value) : 0), 0);
  const unknowns = (items, names) => names.filter(name => !items[name] || items[name].state === "UNKNOWN");

  function sourceMetadata(input = {}, defaultFactType = "USER_ENTERED") {
    return { fact_type: input.fact_type || defaultFactType, source_id: safeText(input.source_id), source_name: safeText(input.source_name) || (defaultFactType === "USER_ENTERED" ? "Traveler" : "UNKNOWN"), source_url: safeText(input.source_url), retrieved_at: safeText(input.retrieved_at), published_at: safeText(input.published_at), geography: safeText(input.geography), freshness_seconds: finite(input.freshness_seconds) ? Number(input.freshness_seconds) : null, status: input.status || (defaultFactType === "USER_ENTERED" ? "fresh" : "unavailable"), confidence: input.confidence || (defaultFactType === "USER_ENTERED" ? "medium" : "low"), notes: safeText(input.notes) };
  }

  function bookingOpportunity(input = {}) {
    const relationship_status = RELATIONSHIP_STATES.includes(input.relationship_status) ? input.relationship_status : "UNKNOWN";
    const url_status = LINK_STATES.includes(input.url_status) ? input.url_status : "NOT_AVAILABLE";
    const url = /^https:\/\//.test(input.verified_booking_url || "") ? input.verified_booking_url : "";
    return { category: safeText(input.category), provider: safeText(input.provider), relationship_status, affiliate_relationship: safeText(input.affiliate_relationship) || "UNKNOWN", url_status: url_status === "VERIFIED" && url ? "VERIFIED" : url_status === "VERIFIED" ? "NOT_VERIFIED" : url_status, verified_booking_url: url_status === "VERIFIED" && url ? url : "", source_provider: safeText(input.source_provider), attribution_capability: safeText(input.attribution_capability) || "UNKNOWN", last_verified: safeText(input.last_verified), notes: safeText(input.notes) };
  }

  function baseCosts(names, raw = {}, state = "UNKNOWN") {
    return Object.fromEntries(names.map(name => {
      const item = raw[name];
      if (item && typeof item === "object") return [name, component(item.value, TRUTH_STATES.includes(item.state) ? item.state : "UNKNOWN", item.source || null)];
      return [name, component(item, item === undefined || item === null || item === "" ? "UNKNOWN" : state)];
    }));
  }

  function normalizeTransportOption(input = {}, context = {}) {
    const user = context.origin !== "SOURCE_BACKED";
    const costs = baseCosts(TRANSPORT_COSTS, input.costs || input, user ? "USER_ENTERED" : "UNKNOWN");
    return { id: safeText(input.id) || uid(), record_origin: user ? "USER_ENTERED" : "SOURCE_BACKED", mode: TRANSPORT_MODES.includes(input.mode) ? input.mode : "OTHER", provider: safeText(input.provider) || "UNKNOWN", service_name: safeText(input.service_name), origin: safeText(input.origin), destination: safeText(input.destination), departure_time: safeText(input.departure_time), arrival_time: safeText(input.arrival_time), duration_minutes: input.duration_minutes === "" || input.duration_minutes == null ? null : Number(input.duration_minutes), connections: input.connections === "" || input.connections == null ? null : Number(input.connections), traveler_count: Number(input.traveler_count), vehicle_occupancy: input.vehicle_occupancy == null || input.vehicle_occupancy === "" ? null : Number(input.vehicle_occupancy), trip_direction: input.trip_direction === "ROUND_TRIP" ? "ROUND_TRIP" : "ONE_WAY", fare_class: safeText(input.fare_class) || "unknown", driving_details: { distance_miles: input.driving_details?.distance_miles == null ? null : Number(input.driving_details.distance_miles), mpg: input.driving_details?.mpg == null ? null : Number(input.driving_details.mpg), fuel_price: input.driving_details?.fuel_price == null ? null : Number(input.driving_details.fuel_price), fuel_reference: safeText(input.driving_details?.fuel_reference) || "ACTUAL STATION PRICE — NOT CONNECTED" }, costs, currency: safeText(input.currency) || "USD", refundable_amount: input.refundable_amount === "" || input.refundable_amount == null ? null : Number(input.refundable_amount), nonrefundable_amount: input.nonrefundable_amount === "" || input.nonrefundable_amount == null ? null : Number(input.nonrefundable_amount), change_cancel_fee: input.change_cancel_fee === "" || input.change_cancel_fee == null ? null : Number(input.change_cancel_fee), cancellation_deadline: safeText(input.cancellation_deadline), policy_status: POLICY_STATES.includes(input.policy_status) ? input.policy_status : "UNKNOWN", availability_status: AVAILABILITY_STATES.includes(input.availability_status) ? input.availability_status : (user ? "USER_ENTERED" : "UNKNOWN"), baggage_included: input.baggage_included === true ? true : input.baggage_included === false ? false : null, group_suitability: safeText(input.group_suitability) || "UNKNOWN", mileage_limit: safeText(input.mileage_limit) || "UNKNOWN", insurance_selection: safeText(input.insurance_selection) || "UNKNOWN", source: sourceMetadata(input.source, user ? "USER_ENTERED" : "UNKNOWN"), booking: bookingOpportunity(input.booking), notes: safeText(input.notes) };
  }

  function normalizeLodgingOption(input = {}, context = {}) {
    const user = context.origin !== "SOURCE_BACKED";
    const costs = baseCosts(LODGING_COSTS, input.costs || input, user ? "USER_ENTERED" : "UNKNOWN");
    const amenities = Object.fromEntries(AMENITIES.map(name => [name, input.amenities?.[name] === true ? true : input.amenities?.[name] === false ? false : null]));
    return { id: safeText(input.id) || uid(), record_origin: user ? "USER_ENTERED" : "SOURCE_BACKED", category: LODGING_CATEGORIES.includes(input.category) ? input.category : "OTHER", provider: safeText(input.provider) || "UNKNOWN", property: safeText(input.property) || "UNKNOWN", location: safeText(input.location), check_in: safeText(input.check_in), check_out: safeText(input.check_out), nights: Number(input.nights), rooms: Number(input.rooms), occupancy: Number(input.occupancy), base_nightly_rate: input.base_nightly_rate === "" || input.base_nightly_rate == null ? null : Number(input.base_nightly_rate), costs, amenities, currency: safeText(input.currency) || "USD", distance_location_context: safeText(input.distance_location_context), location_fit: input.location_fit === "MATCH" || input.location_fit === "NO_MATCH" ? input.location_fit : "UNKNOWN", refundable_amount: input.refundable_amount === "" || input.refundable_amount == null ? null : Number(input.refundable_amount), nonrefundable_amount: input.nonrefundable_amount === "" || input.nonrefundable_amount == null ? null : Number(input.nonrefundable_amount), cancellation_fee: input.cancellation_fee === "" || input.cancellation_fee == null ? null : Number(input.cancellation_fee), change_fee: input.change_fee === "" || input.change_fee == null ? null : Number(input.change_fee), cancellation_deadline: safeText(input.cancellation_deadline), policy_status: POLICY_STATES.includes(input.policy_status) ? input.policy_status : "UNKNOWN", availability_status: AVAILABILITY_STATES.includes(input.availability_status) ? input.availability_status : (user ? "USER_ENTERED" : "UNKNOWN"), source: sourceMetadata(input.source, user ? "USER_ENTERED" : "UNKNOWN"), booking: bookingOpportunity(input.booking), notes: safeText(input.notes) };
  }

  function validateOption(option, kind) {
    const errors = [], transport = kind === "transport", names = transport ? TRANSPORT_COSTS : LODGING_COSTS;
    if (!option || typeof option !== "object") return { valid: false, errors: ["Option must be an object."] };
    if (transport && !TRANSPORT_MODES.includes(option.mode)) errors.push("Invalid transport mode.");
    if (!transport && !LODGING_CATEGORIES.includes(option.category)) errors.push("Invalid lodging category.");
    names.forEach(name => { if (!validComponent(option.costs?.[name])) errors.push(`Invalid cost component: ${name}.`); });
    const positive = transport ? ["traveler_count"] : ["nights", "rooms", "occupancy"];
    positive.forEach(name => { if (!Number.isInteger(option[name]) || option[name] < 1) errors.push(`${name} must be a positive integer.`); });
    ["duration_minutes", "connections", "vehicle_occupancy", "refundable_amount", "nonrefundable_amount", "change_cancel_fee", "base_nightly_rate", "cancellation_fee", "change_fee"].forEach(name => { if (option[name] != null && !finite(option[name])) errors.push(`${name} must be nonnegative or unknown.`); });
    return { valid: !errors.length, errors };
  }

  function priceCompleteness(option, kind) {
    const transport = kind === "transport", all = transport ? TRANSPORT_COSTS : LODGING_COSTS, mandatory = transport ? TRANSPORT_MANDATORY : LODGING_MANDATORY;
    const resolved = all.filter(name => option.costs[name]?.state !== "UNKNOWN").length;
    const missingMandatory = unknowns(option.costs, mandatory);
    const deposit = option.costs.deposit_hold?.state === "UNKNOWN" ? null : option.costs.deposit_hold?.value;
    const knownBase = sum(option.costs, transport ? ["base_price"] : ["base_stay_price"]);
    const knownMandatoryAddOns = sum(option.costs, mandatory.filter(x => !["base_price", "base_stay_price"].includes(x)));
    const knownOptionalAddOns = sum(option.costs, transport ? ["optional_fees", "estimated_local_transport"] : ["optional_cost", "breakfast", "wifi"]);
    const knownTotal = knownBase + knownMandatoryAddOns + knownOptionalAddOns;
    const cancellationUnknown = option.policy_status === "UNKNOWN";
    const cancellationExposure = cancellationUnknown ? null : (finite(option.nonrefundable_amount) ? Number(option.nonrefundable_amount) : 0) + (finite(option.change_cancel_fee) ? Number(option.change_cancel_fee) : 0) + (finite(option.cancellation_fee) ? Number(option.cancellation_fee) : 0);
    return { knownBase, knownMandatoryAddOns, knownOptionalAddOns, knownTotal, resolvedComponents: resolved, expectedComponents: all.length, unknownCostComponents: unknowns(option.costs, all), unknownMandatoryComponents: missingMandatory, mandatoryComplete: !missingMandatory.length, depositHold: deposit, potentialCancellationExposure: cancellationExposure, label: !missingMandatory.length ? "KNOWN COSTS COMPLETE" : `${missingMandatory.length} MANDATORY FEE${missingMandatory.length === 1 ? "" : "S"} UNKNOWN`, coverageLabel: `${resolved} of ${all.length} expected cost components resolved` };
  }

  function cancellationExposure(option) {
    if (option.policy_status === "UNKNOWN") return { status: "UNKNOWN", label: "POLICY UNKNOWN — VERIFY BEFORE BOOKING", potentialExposure: null };
    const exposure = (finite(option.nonrefundable_amount) ? Number(option.nonrefundable_amount) : 0) + (finite(option.change_cancel_fee) ? Number(option.change_cancel_fee) : 0) + (finite(option.cancellation_fee) ? Number(option.cancellation_fee) : 0);
    return { status: option.policy_status, label: exposure ? "KNOWN CANCELLATION EXPOSURE" : "NO ENTERED CANCELLATION LOSS", potentialExposure: exposure };
  }

  function lens(label, eligible, metric, direction = "min", reason = "") {
    if (!eligible.length || eligible.some(x => metric(x) == null || !Number.isFinite(metric(x)))) return { label, winner_id: null, status: "NOT ENOUGH VERIFIED DATA TO COMPARE", basis: reason };
    const values = eligible.map(x => ({ id: x.id, value: metric(x) }));
    const target = Math[direction](...values.map(x => x.value));
    const winners = values.filter(x => x.value === target);
    return winners.length === 1 ? { label, winner_id: winners[0].id, status: "COMPARABLE", basis: reason, value: target } : { label, winner_id: null, status: "TIE — NO SINGLE WINNER", basis: reason, value: target };
  }

  function compareTransport(options = []) {
    const valid = options.filter(x => validateOption(x, "transport").valid);
    const complete = valid.filter(x => priceCompleteness(x, "transport").mandatoryComplete);
    const policyKnown = valid.filter(x => x.policy_status !== "UNKNOWN");
    return [
      lens("LOWEST KNOWN COST", complete, x => priceCompleteness(x, "transport").knownTotal, "min", "Only options with all expected mandatory costs resolved."),
      lens("FASTEST KNOWN OPTION", valid, x => x.duration_minutes, "min", "Known door-to-door duration entered or sourced."),
      lens("FEWEST UNKNOWN COSTS", valid, x => priceCompleteness(x, "transport").unknownCostComponents.length, "min", "Count of unresolved expected cost components."),
      lens("MOST FLEXIBLE KNOWN POLICY", policyKnown, x => cancellationExposure(x).potentialExposure, "min", "Lowest known nonrefundable and cancellation-fee exposure."),
      lens("LOWEST UPFRONT CASH REQUIREMENT", valid.filter(x => priceCompleteness(x, "transport").depositHold != null), x => priceCompleteness(x, "transport").depositHold, "min", "Known deposit or hold only."),
      lens("GROUP-FRIENDLY", valid.filter(x => x.vehicle_occupancy != null), x => x.vehicle_occupancy, "max", "Largest explicitly entered vehicle occupancy.")
    ];
  }

  function compareLodging(options = []) {
    const valid = options.filter(x => validateOption(x, "lodging").valid), complete = valid.filter(x => priceCompleteness(x, "lodging").mandatoryComplete), policyKnown = valid.filter(x => x.policy_status !== "UNKNOWN");
    return [
      lens("LOWEST KNOWN TOTAL", complete, x => priceCompleteness(x, "lodging").knownTotal, "min", "Only stays with all expected mandatory costs resolved."),
      lens("LOWEST KNOWN TOTAL PER NIGHT", complete, x => priceCompleteness(x, "lodging").knownTotal / x.nights, "min", "Complete known total divided by entered nights."),
      lens("FEWEST UNKNOWN MANDATORY FEES", valid, x => priceCompleteness(x, "lodging").unknownMandatoryComponents.length, "min", "Count of unresolved mandatory components."),
      lens("MOST FLEXIBLE KNOWN CANCELLATION", policyKnown, x => cancellationExposure(x).potentialExposure, "min", "Lowest known cancellation exposure."),
      lens("LOWEST DEPOSIT/HOLD", valid.filter(x => priceCompleteness(x, "lodging").depositHold != null), x => priceCompleteness(x, "lodging").depositHold, "min", "Known deposit or hold only."),
      lens("PARKING INCLUDED", valid.filter(x => x.amenities.parking === true), () => 1, "max", "Explicitly entered or sourced parking inclusion."),
      lens("BREAKFAST INCLUDED", valid.filter(x => x.amenities.breakfast === true), () => 1, "max", "Explicitly entered or sourced breakfast inclusion."),
      lens("BEST LOCATION FIT", valid.filter(x => x.location_fit === "MATCH"), () => 1, "max", "Traveler-entered location preference match only.")
    ];
  }

  function drivingFuelCost({ distance_miles, trip_direction = "ONE_WAY", mpg, fuel_price }) {
    if (![distance_miles, mpg, fuel_price].every(finite) || Number(distance_miles) <= 0 || Number(mpg) <= 0) throw new Error("Distance and MPG must be positive; fuel price must be nonnegative.");
    const miles = Number(distance_miles) * (trip_direction === "ROUND_TRIP" ? 2 : 1);
    return { miles, gallons: miles / Number(mpg), cost: miles / Number(mpg) * Number(fuel_price) };
  }

  function normalizeGtfsSchedule(tables = {}, serviceDate = "") {
    const agencies = (tables.agency || []).map(x => ({ id: x.agency_id || "default", name: x.agency_name || "UNKNOWN", url: x.agency_url || "", timezone: x.agency_timezone || "UNKNOWN" }));
    const routes = (tables.routes || []).map(x => ({ id: x.route_id, agency_id: x.agency_id || agencies[0]?.id || "default", short_name: x.route_short_name || "", long_name: x.route_long_name || "", type: x.route_type || "UNKNOWN" }));
    const stops = (tables.stops || []).map(x => ({ id: x.stop_id, name: x.stop_name || "UNKNOWN", latitude: x.stop_lat == null ? null : Number(x.stop_lat), longitude: x.stop_lon == null ? null : Number(x.stop_lon) }));
    const byTrip = new Map(); (tables.stop_times || []).forEach(x => { const a = byTrip.get(x.trip_id) || []; a.push(x); byTrip.set(x.trip_id, a); });
    const trips = (tables.trips || []).map(x => { const times = (byTrip.get(x.trip_id) || []).sort((a,b) => Number(a.stop_sequence)-Number(b.stop_sequence)); return { id: x.trip_id, route_id: x.route_id, service_id: x.service_id, service_date: serviceDate || "UNKNOWN", origin_stop_id: times[0]?.stop_id || "UNKNOWN", destination_stop_id: times.at(-1)?.stop_id || "UNKNOWN", scheduled_departure: times[0]?.departure_time || "UNKNOWN", scheduled_arrival: times.at(-1)?.arrival_time || "UNKNOWN", transfer_count: null }; });
    return { agencies, routes, stops, trips, status: trips.length ? "PUBLISHED" : "UNAVAILABLE" };
  }

  function isolateProvider(providerId, loader) {
    try { return { provider_id: providerId, status: "AVAILABLE", data: loader(), error: null }; }
    catch (_) { return { provider_id: providerId, status: "UNAVAILABLE", data: null, error: "PROVIDER UNAVAILABLE" }; }
  }

  function bookingUrl(option) { return option?.booking?.url_status === "VERIFIED" && /^https:\/\//.test(option.booking.verified_booking_url || "") ? option.booking.verified_booking_url : null; }

  return { TRUTH_STATES, TRANSPORT_MODES, LODGING_CATEGORIES, POLICY_STATES, AVAILABILITY_STATES, RELATIONSHIP_STATES, LINK_STATES, TRANSPORT_COSTS, LODGING_COSTS, AMENITIES, component, normalizeTransportOption, normalizeLodgingOption, validateTransportOption: x => validateOption(x, "transport"), validateLodgingOption: x => validateOption(x, "lodging"), priceCompleteness, cancellationExposure, compareTransport, compareLodging, drivingFuelCost, normalizeGtfsSchedule, sourceMetadata, bookingOpportunity, bookingUrl, isolateProvider };
});
