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
  const LODGING_COSTS = ["base_stay_price", "taxes", "mandatory_fees", "resort_destination_fees", "cleaning_fee", "parking", "pet_fee", "deposit_hold", "breakfast", "wifi", "other_mandatory_cost", "optional_cost"];
  const LODGING_MANDATORY = ["base_stay_price", "taxes", "mandatory_fees", "resort_destination_fees", "cleaning_fee", "parking", "pet_fee", "other_mandatory_cost"];
  const AMENITIES = ["pool", "private_pool", "hot_tub", "cold_plunge", "fire_pit", "waterfront", "lake", "river", "mountain_view", "beach_access", "dock", "fishing", "kitchen", "washer_dryer", "parking", "breakfast", "gym", "accessible_room", "pet_friendly", "workspace", "meeting_space", "group_rooms"];

  const TRANSPORT_MANDATORY_BY_MODE = {
    DRIVE: ["fuel", "tolls", "parking", "other_known_cost"],
    FLIGHT: ["base_price", "taxes", "mandatory_fees", "baggage", "seat_fees", "airport_terminal_transport", "other_known_cost"],
    RENTAL_CAR: ["base_price", "taxes", "mandatory_fees", "rental_fees", "young_driver_fee", "additional_driver_fee", "one_way_drop_fee", "fuel", "parking", "tolls", "other_known_cost"],
    BUS: ["base_price", "taxes", "mandatory_fees", "baggage", "other_known_cost"],
    RAIL: ["base_price", "taxes", "mandatory_fees", "other_known_cost"],
    PUBLIC_TRANSIT: ["base_price", "taxes", "mandatory_fees", "other_known_cost"],
    RIDESHARE: ["base_price", "taxes", "mandatory_fees", "gratuity", "other_known_cost"],
    TAXI: ["base_price", "taxes", "mandatory_fees", "gratuity", "other_known_cost"],
    AIRPORT_TRANSFER: ["base_price", "taxes", "mandatory_fees", "gratuity", "other_known_cost"],
    SHUTTLE: ["base_price", "taxes", "mandatory_fees", "gratuity", "other_known_cost"],
    GROUP_VAN: ["base_price", "taxes", "mandatory_fees", "tolls", "parking", "gratuity", "other_known_cost"],
    SPRINTER: ["base_price", "taxes", "mandatory_fees", "tolls", "parking", "gratuity", "other_known_cost"],
    MINIBUS: ["base_price", "taxes", "mandatory_fees", "tolls", "parking", "gratuity", "other_known_cost"],
    CHARTER_BUS: ["base_price", "taxes", "mandatory_fees", "tolls", "parking", "gratuity", "other_known_cost"],
    CRUISE_PORT_TRANSFER: ["base_price", "taxes", "mandatory_fees", "gratuity", "other_known_cost"],
    OTHER: ["base_price", "taxes", "mandatory_fees", "other_known_cost"]
  };

  const uid = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const numeric = value => value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "") && Number.isFinite(Number(value)) && Number(value) >= 0;
  const optionalNumber = value => numeric(value) ? Number(value) : null;
  const safeText = value => typeof value === "string" ? value.trim().slice(0, 1000) : "";

  function component(value = null, state = "UNKNOWN", source = null) {
    const cleanState = TRUTH_STATES.includes(state) ? state : "UNKNOWN";
    if (cleanState === "UNKNOWN" || cleanState === "NOT_APPLICABLE") return { value: null, state: cleanState, source };
    return { value: numeric(value) ? Number(value) : null, state: cleanState, source };
  }

  const validComponent = item => !!item && TRUTH_STATES.includes(item.state) &&
    (["UNKNOWN", "NOT_APPLICABLE"].includes(item.state) ? item.value == null : numeric(item.value));

  const sum = (items, names) => names.reduce((total, name) => {
    const item = items?.[name];
    return total + (item && numeric(item.value) && !["UNKNOWN", "NOT_APPLICABLE"].includes(item.state) ? Number(item.value) : 0);
  }, 0);

  const unknowns = (items, names) => names.filter(name => !items?.[name] || items[name].state === "UNKNOWN");

  function sourceMetadata(input = {}, defaultFactType = "USER_ENTERED") {
    const freshness = numeric(input.freshness_seconds) ? Number(input.freshness_seconds) : null;
    return {
      fact_type: safeText(input.fact_type) || defaultFactType,
      source_id: safeText(input.source_id),
      source_name: safeText(input.source_name) || (defaultFactType === "USER_ENTERED" ? "Traveler" : "UNKNOWN"),
      source_url: safeText(input.source_url),
      retrieved_at: safeText(input.retrieved_at),
      published_at: safeText(input.published_at),
      geography: safeText(input.geography),
      freshness_seconds: freshness,
      status: safeText(input.status) || (defaultFactType === "USER_ENTERED" ? "fresh" : "unavailable"),
      confidence: safeText(input.confidence) || (defaultFactType === "USER_ENTERED" ? "medium" : "low"),
      notes: safeText(input.notes)
    };
  }

  function validHttpsUrl(raw) {
    try {
      const url = new URL(String(raw || ""));
      return url.protocol === "https:" && !url.username && !url.password ? url.toString() : "";
    } catch (_) {
      return "";
    }
  }

  function bookingOpportunity(input = {}) {
    const relationship_status = RELATIONSHIP_STATES.includes(input.relationship_status) ? input.relationship_status : "UNKNOWN";
    const requestedStatus = LINK_STATES.includes(input.url_status) ? input.url_status : "NOT_AVAILABLE";
    const url = validHttpsUrl(input.verified_booking_url);
    const url_status = requestedStatus === "VERIFIED" ? (url ? "VERIFIED" : "NOT_VERIFIED") : requestedStatus;
    return {
      category: safeText(input.category),
      provider: safeText(input.provider),
      relationship_status,
      affiliate_relationship: safeText(input.affiliate_relationship) || "UNKNOWN",
      url_status,
      verified_booking_url: url_status === "VERIFIED" ? url : "",
      source_provider: safeText(input.source_provider),
      attribution_capability: safeText(input.attribution_capability) || "UNKNOWN",
      last_verified: safeText(input.last_verified),
      notes: safeText(input.notes)
    };
  }

  function baseCosts(names, raw = {}, defaultState = "UNKNOWN") {
    return Object.fromEntries(names.map(name => {
      const item = raw?.[name];
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return [name, component(item.value, TRUTH_STATES.includes(item.state) ? item.state : "UNKNOWN", item.source || null)];
      }
      const state = item === undefined || item === null || item === "" ? "UNKNOWN" : defaultState;
      return [name, component(item, state)];
    }));
  }

  function normalizeTransportOption(input = {}, context = {}) {
    const user = context.origin !== "SOURCE_BACKED";
    const costs = baseCosts(TRANSPORT_COSTS, input.costs || input, user ? "USER_ENTERED" : "UNKNOWN");
    return {
      id: safeText(input.id) || uid(),
      record_origin: user ? "USER_ENTERED" : "SOURCE_BACKED",
      mode: TRANSPORT_MODES.includes(input.mode) ? input.mode : "OTHER",
      provider: safeText(input.provider) || "UNKNOWN",
      service_name: safeText(input.service_name),
      origin: safeText(input.origin),
      destination: safeText(input.destination),
      departure_time: safeText(input.departure_time),
      arrival_time: safeText(input.arrival_time),
      duration_minutes: optionalNumber(input.duration_minutes),
      connections: optionalNumber(input.connections),
      traveler_count: Number(input.traveler_count),
      vehicle_occupancy: optionalNumber(input.vehicle_occupancy),
      trip_direction: input.trip_direction === "ROUND_TRIP" ? "ROUND_TRIP" : "ONE_WAY",
      fare_class: safeText(input.fare_class) || "unknown",
      driving_details: {
        distance_miles: optionalNumber(input.driving_details?.distance_miles),
        mpg: optionalNumber(input.driving_details?.mpg),
        fuel_price: optionalNumber(input.driving_details?.fuel_price),
        fuel_reference: safeText(input.driving_details?.fuel_reference) || "ACTUAL STATION PRICE — NOT CONNECTED"
      },
      costs,
      currency: (safeText(input.currency) || "USD").toUpperCase(),
      refundable_amount: optionalNumber(input.refundable_amount),
      nonrefundable_amount: optionalNumber(input.nonrefundable_amount),
      change_cancel_fee: optionalNumber(input.change_cancel_fee),
      cancellation_deadline: safeText(input.cancellation_deadline),
      policy_status: POLICY_STATES.includes(input.policy_status) ? input.policy_status : "UNKNOWN",
      availability_status: AVAILABILITY_STATES.includes(input.availability_status) ? input.availability_status : (user ? "USER_ENTERED" : "UNKNOWN"),
      baggage_included: input.baggage_included === true ? true : input.baggage_included === false ? false : null,
      group_suitability: safeText(input.group_suitability) || "UNKNOWN",
      mileage_limit: safeText(input.mileage_limit) || "UNKNOWN",
      insurance_selection: safeText(input.insurance_selection) || "UNKNOWN",
      source: sourceMetadata(input.source, user ? "USER_ENTERED" : "UNKNOWN"),
      booking: bookingOpportunity(input.booking),
      notes: safeText(input.notes)
    };
  }

  function normalizeLodgingOption(input = {}, context = {}) {
    const user = context.origin !== "SOURCE_BACKED";
    const costs = baseCosts(LODGING_COSTS, input.costs || input, user ? "USER_ENTERED" : "UNKNOWN");
    const amenities = Object.fromEntries(AMENITIES.map(name => [
      name,
      input.amenities?.[name] === true ? true : input.amenities?.[name] === false ? false : null
    ]));
    return {
      id: safeText(input.id) || uid(),
      record_origin: user ? "USER_ENTERED" : "SOURCE_BACKED",
      category: LODGING_CATEGORIES.includes(input.category) ? input.category : "OTHER",
      provider: safeText(input.provider) || "UNKNOWN",
      property: safeText(input.property) || "UNKNOWN",
      location: safeText(input.location),
      check_in: safeText(input.check_in),
      check_out: safeText(input.check_out),
      nights: Number(input.nights),
      rooms: Number(input.rooms),
      occupancy: Number(input.occupancy),
      base_nightly_rate: optionalNumber(input.base_nightly_rate),
      costs,
      amenities,
      currency: (safeText(input.currency) || "USD").toUpperCase(),
      distance_location_context: safeText(input.distance_location_context),
      location_fit: input.location_fit === "MATCH" || input.location_fit === "NO_MATCH" ? input.location_fit : "UNKNOWN",
      refundable_amount: optionalNumber(input.refundable_amount),
      nonrefundable_amount: optionalNumber(input.nonrefundable_amount),
      cancellation_fee: optionalNumber(input.cancellation_fee),
      change_fee: optionalNumber(input.change_fee),
      cancellation_deadline: safeText(input.cancellation_deadline),
      policy_status: POLICY_STATES.includes(input.policy_status) ? input.policy_status : "UNKNOWN",
      availability_status: AVAILABILITY_STATES.includes(input.availability_status) ? input.availability_status : (user ? "USER_ENTERED" : "UNKNOWN"),
      source: sourceMetadata(input.source, user ? "USER_ENTERED" : "UNKNOWN"),
      booking: bookingOpportunity(input.booking),
      notes: safeText(input.notes)
    };
  }

  function validateOption(option, kind) {
    const errors = [];
    const transport = kind === "transport";
    const names = transport ? TRANSPORT_COSTS : LODGING_COSTS;
    if (!option || typeof option !== "object" || Array.isArray(option)) return { valid: false, errors: ["Option must be an object."] };
    if (transport && !TRANSPORT_MODES.includes(option.mode)) errors.push("Invalid transport mode.");
    if (!transport && !LODGING_CATEGORIES.includes(option.category)) errors.push("Invalid lodging category.");
    if (!option.costs || typeof option.costs !== "object" || Array.isArray(option.costs)) errors.push("Missing cost component map.");
    names.forEach(name => { if (!validComponent(option.costs?.[name])) errors.push(`Invalid cost component: ${name}.`); });
    const positive = transport ? ["traveler_count"] : ["nights", "rooms", "occupancy"];
    positive.forEach(name => { if (!Number.isInteger(option[name]) || option[name] < 1) errors.push(`${name} must be a positive integer.`); });
    ["duration_minutes", "connections", "vehicle_occupancy", "refundable_amount", "nonrefundable_amount", "change_cancel_fee", "base_nightly_rate", "cancellation_fee", "change_fee"].forEach(name => {
      if (option[name] != null && !numeric(option[name])) errors.push(`${name} must be nonnegative or unknown.`);
    });
    if (transport && option.driving_details) {
      ["distance_miles", "mpg", "fuel_price"].forEach(name => {
        const v = option.driving_details[name];
        if (v != null && !numeric(v)) errors.push(`driving_details.${name} must be nonnegative or unknown.`);
      });
      if (option.driving_details.mpg === 0) errors.push("driving_details.mpg must be positive when provided.");
    }
    if (!/^[A-Z]{3}$/.test(option.currency || "")) errors.push("currency must be a three-letter code.");
    if (!POLICY_STATES.includes(option.policy_status)) errors.push("Invalid policy status.");
    if (!AVAILABILITY_STATES.includes(option.availability_status)) errors.push("Invalid availability status.");
    return { valid: errors.length === 0, errors };
  }

  function transportMandatory(mode) {
    return TRANSPORT_MANDATORY_BY_MODE[mode] || TRANSPORT_MANDATORY_BY_MODE.OTHER;
  }

  function expectedCosts(option, kind) {
    if (kind === "transport") {
      return [...new Set([...transportMandatory(option.mode), "optional_fees", "estimated_local_transport", "deposit_hold"])];
    }
    return [...new Set([...LODGING_MANDATORY, "deposit_hold", "breakfast", "wifi", "optional_cost"])];
  }

  function priceCompleteness(option, kind) {
    const transport = kind === "transport";
    const mandatory = transport ? transportMandatory(option.mode) : LODGING_MANDATORY;
    const expected = expectedCosts(option, kind);
    const resolved = expected.filter(name => option.costs?.[name]?.state !== "UNKNOWN").length;
    const missingMandatory = unknowns(option.costs, mandatory);
    const deposit = option.costs?.deposit_hold?.state === "UNKNOWN" ? null : option.costs?.deposit_hold?.value ?? null;
    const baseField = transport ? "base_price" : "base_stay_price";
    const knownBase = mandatory.includes(baseField) ? sum(option.costs, [baseField]) : 0;
    const knownMandatoryAddOns = sum(option.costs, mandatory.filter(name => name !== baseField));
    const optionalNames = transport ? ["optional_fees", "estimated_local_transport"] : ["optional_cost", "breakfast", "wifi"];
    const knownOptionalAddOns = sum(option.costs, optionalNames);
    const knownTotal = knownBase + knownMandatoryAddOns;
    const knownAllInTotal = knownTotal + knownOptionalAddOns;
    const cancellation = cancellationExposure(option);
    return {
      knownBase,
      knownMandatoryAddOns,
      knownOptionalAddOns,
      knownTotal,
      knownAllInTotal,
      resolvedComponents: resolved,
      expectedComponents: expected.length,
      unknownCostComponents: unknowns(option.costs, expected),
      unknownMandatoryComponents: missingMandatory,
      mandatoryComplete: missingMandatory.length === 0,
      depositHold: deposit,
      potentialCancellationExposure: cancellation.potentialExposure,
      cancellationComplete: cancellation.complete,
      label: missingMandatory.length === 0 ? "KNOWN COSTS COMPLETE" : `${missingMandatory.length} MANDATORY FEE${missingMandatory.length === 1 ? "" : "S"} UNKNOWN`,
      coverageLabel: `${resolved} of ${expected.length} expected cost components resolved`
    };
  }

  function cancellationExposure(option) {
    if (!option || option.policy_status === "UNKNOWN") {
      return { status: "UNKNOWN", complete: false, label: "POLICY UNKNOWN — VERIFY BEFORE BOOKING", potentialExposure: null, unknownFields: [] };
    }
    const lodging = Object.prototype.hasOwnProperty.call(option, "cancellation_fee");
    const fields = lodging ? ["nonrefundable_amount", "cancellation_fee", "change_fee"] : ["nonrefundable_amount", "change_cancel_fee"];
    const missing = fields.filter(name => !numeric(option[name]));
    if (missing.length) {
      return {
        status: option.policy_status,
        complete: false,
        label: "CANCELLATION AMOUNTS INCOMPLETE — VERIFY BEFORE BOOKING",
        potentialExposure: null,
        unknownFields: missing
      };
    }
    const exposure = fields.reduce((total, name) => total + Number(option[name]), 0);
    return {
      status: option.policy_status,
      complete: true,
      label: exposure > 0 ? "KNOWN CANCELLATION EXPOSURE" : "NO ENTERED CANCELLATION LOSS",
      potentialExposure: exposure,
      unknownFields: []
    };
  }

  function lens(label, eligible, metric, direction = "min", reason = "") {
    if (!eligible.length) return { label, winner_id: null, status: "NOT ENOUGH VERIFIED DATA TO COMPARE", basis: reason };
    const values = eligible.map(x => ({ id: x.id, value: metric(x) })).filter(x => x.value != null && Number.isFinite(x.value));
    if (values.length !== eligible.length || !values.length) return { label, winner_id: null, status: "NOT ENOUGH VERIFIED DATA TO COMPARE", basis: reason };
    const target = Math[direction](...values.map(x => x.value));
    const winners = values.filter(x => x.value === target);
    return winners.length === 1
      ? { label, winner_id: winners[0].id, status: "COMPARABLE", basis: reason, value: target }
      : { label, winner_id: null, status: "TIE — NO SINGLE WINNER", basis: reason, value: target };
  }

  function costLens(label, eligible, metric, direction = "min", reason = "") {
    const currencies = [...new Set(eligible.map(x => x.currency).filter(Boolean))];
    if (currencies.length > 1) return { label, winner_id: null, status: "CURRENCY CONVERSION REQUIRED", basis: "Options use different currencies; FX conversion is not connected." };
    return lens(label, eligible, metric, direction, reason);
  }

  function compareTransport(options = []) {
    const valid = options.filter(x => validateOption(x, "transport").valid);
    const complete = valid.filter(x => priceCompleteness(x, "transport").mandatoryComplete);
    const policyKnown = valid.filter(x => cancellationExposure(x).complete);
    const withDeposit = complete.filter(x => priceCompleteness(x, "transport").depositHold != null);
    const groupFit = valid.filter(x => numeric(x.vehicle_occupancy) && Number(x.vehicle_occupancy) >= Number(x.traveler_count));
    return [
      costLens("LOWEST KNOWN COST", complete, x => priceCompleteness(x, "transport").knownTotal, "min", "Only options with all expected mandatory costs resolved; optional extras are excluded."),
      costLens("LOWEST KNOWN COST PER TRAVELER", complete, x => priceCompleteness(x, "transport").knownTotal / x.traveler_count, "min", "Complete known required cost divided by traveler count."),
      lens("FASTEST KNOWN OPTION", valid.filter(x => x.duration_minutes != null), x => x.duration_minutes, "min", "Known door-to-door duration entered or sourced."),
      lens("FEWEST UNKNOWN COSTS", valid, x => priceCompleteness(x, "transport").unknownCostComponents.length, "min", "Count of unresolved expected components for that transport mode."),
      costLens("MOST FLEXIBLE KNOWN POLICY", policyKnown, x => cancellationExposure(x).potentialExposure, "min", "Lowest complete known nonrefundable and cancellation-fee exposure."),
      costLens("LOWEST KNOWN REQUIRED TOTAL + HOLD", withDeposit, x => priceCompleteness(x, "transport").knownTotal + priceCompleteness(x, "transport").depositHold, "min", "Known required total plus explicit deposit/hold; payment timing is not inferred."),
      lens("GROUP-FRIENDLY", groupFit, x => Number(x.vehicle_occupancy) - Number(x.traveler_count), "min", "Smallest explicitly entered vehicle capacity that still fits the whole group.")
    ];
  }

  function compareLodging(options = []) {
    const valid = options.filter(x => validateOption(x, "lodging").valid);
    const complete = valid.filter(x => priceCompleteness(x, "lodging").mandatoryComplete);
    const policyKnown = valid.filter(x => cancellationExposure(x).complete);
    const withDeposit = complete.filter(x => priceCompleteness(x, "lodging").depositHold != null);
    return [
      costLens("LOWEST KNOWN TOTAL", complete, x => priceCompleteness(x, "lodging").knownTotal, "min", "Only stays with all expected mandatory costs resolved; optional extras are excluded."),
      costLens("LOWEST KNOWN TOTAL PER NIGHT", complete, x => priceCompleteness(x, "lodging").knownTotal / x.nights, "min", "Complete known required total divided by entered nights."),
      lens("FEWEST UNKNOWN MANDATORY FEES", valid, x => priceCompleteness(x, "lodging").unknownMandatoryComponents.length, "min", "Count of unresolved mandatory components."),
      costLens("MOST FLEXIBLE KNOWN CANCELLATION", policyKnown, x => cancellationExposure(x).potentialExposure, "min", "Lowest complete known cancellation exposure."),
      costLens("LOWEST DEPOSIT/HOLD", withDeposit, x => priceCompleteness(x, "lodging").depositHold, "min", "Known deposit or hold only."),
      lens("PARKING INCLUDED", valid.filter(x => x.amenities?.parking === true), () => 1, "max", "Explicitly entered or sourced parking inclusion."),
      lens("BREAKFAST INCLUDED", valid.filter(x => x.amenities?.breakfast === true), () => 1, "max", "Explicitly entered or sourced breakfast inclusion."),
      lens("BEST LOCATION FIT", valid.filter(x => x.location_fit === "MATCH"), () => 1, "max", "Traveler-entered location preference match only.")
    ];
  }

  function drivingFuelCost({ distance_miles, trip_direction = "ONE_WAY", mpg, fuel_price }) {
    if (![distance_miles, mpg, fuel_price].every(numeric) || Number(distance_miles) <= 0 || Number(mpg) <= 0) {
      throw new Error("Distance and MPG must be positive; fuel price must be a known nonnegative number.");
    }
    const miles = Number(distance_miles) * (trip_direction === "ROUND_TRIP" ? 2 : 1);
    return { miles, gallons: miles / Number(mpg), cost: miles / Number(mpg) * Number(fuel_price) };
  }

  function normalizeGtfsSchedule(tables = {}, requestedServiceDate = "") {
    const agencies = (tables.agency || []).map(x => ({
      id: x.agency_id || "default",
      name: x.agency_name || "UNKNOWN",
      url: x.agency_url || "",
      timezone: x.agency_timezone || "UNKNOWN"
    }));
    const routes = (tables.routes || []).map(x => ({
      id: x.route_id,
      agency_id: x.agency_id || agencies[0]?.id || "default",
      short_name: x.route_short_name || "",
      long_name: x.route_long_name || "",
      type: x.route_type || "UNKNOWN"
    }));
    const stops = (tables.stops || []).map(x => ({
      id: x.stop_id,
      name: x.stop_name || "UNKNOWN",
      latitude: x.stop_lat == null ? null : Number(x.stop_lat),
      longitude: x.stop_lon == null ? null : Number(x.stop_lon)
    }));
    const byTrip = new Map();
    (tables.stop_times || []).forEach(x => {
      const rows = byTrip.get(x.trip_id) || [];
      rows.push(x);
      byTrip.set(x.trip_id, rows);
    });
    const trips = (tables.trips || []).map(x => {
      const times = (byTrip.get(x.trip_id) || []).sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));
      return {
        id: x.trip_id,
        route_id: x.route_id,
        service_id: x.service_id,
        requested_service_date: requestedServiceDate || "UNKNOWN",
        service_date_status: requestedServiceDate ? "UNVERIFIED_AGAINST_CALENDAR" : "UNKNOWN",
        origin_stop_id: times[0]?.stop_id || "UNKNOWN",
        destination_stop_id: times.at(-1)?.stop_id || "UNKNOWN",
        scheduled_departure: times[0]?.departure_time || "UNKNOWN",
        scheduled_arrival: times.at(-1)?.arrival_time || "UNKNOWN",
        transfer_count: null
      };
    });
    return { agencies, routes, stops, trips, status: trips.length ? "PUBLISHED" : "UNAVAILABLE" };
  }

  async function isolateProvider(providerId, loader) {
    try {
      const data = await loader();
      return { provider_id: providerId, status: "AVAILABLE", data, error: null };
    } catch (_) {
      return { provider_id: providerId, status: "UNAVAILABLE", data: null, error: "PROVIDER UNAVAILABLE" };
    }
  }

  function bookingUrl(option) {
    return option?.booking?.url_status === "VERIFIED" ? validHttpsUrl(option.booking.verified_booking_url) || null : null;
  }

  function validateTripOptions(trip) {
    const errors = [];
    if (!Array.isArray(trip?.transportation_options)) errors.push("transportation_options must be an array.");
    if (!Array.isArray(trip?.lodging_options)) errors.push("lodging_options must be an array.");
    (Array.isArray(trip?.transportation_options) ? trip.transportation_options : []).forEach((option, i) => {
      validateOption(option, "transport").errors.forEach(error => errors.push(`Transportation option ${i + 1}: ${error}`));
    });
    (Array.isArray(trip?.lodging_options) ? trip.lodging_options : []).forEach((option, i) => {
      validateOption(option, "lodging").errors.forEach(error => errors.push(`Lodging option ${i + 1}: ${error}`));
    });
    return { valid: errors.length === 0, errors };
  }

  return {
    TRUTH_STATES, TRANSPORT_MODES, LODGING_CATEGORIES, POLICY_STATES, AVAILABILITY_STATES,
    RELATIONSHIP_STATES, LINK_STATES, TRANSPORT_COSTS, LODGING_COSTS, LODGING_MANDATORY,
    TRANSPORT_MANDATORY_BY_MODE, AMENITIES, component, normalizeTransportOption, normalizeLodgingOption,
    validateTransportOption: x => validateOption(x, "transport"),
    validateLodgingOption: x => validateOption(x, "lodging"),
    validateTripOptions, expectedCosts, priceCompleteness, cancellationExposure, compareTransport,
    compareLodging, drivingFuelCost, normalizeGtfsSchedule, sourceMetadata, bookingOpportunity,
    bookingUrl, isolateProvider
  };
});
