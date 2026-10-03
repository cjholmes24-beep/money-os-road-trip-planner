(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SuitcaseBrain = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "suitcase-brain.trip.v1";
  const COMMITMENT_STATES = ["INVITED", "ACCEPTED", "DEPOSIT_PAID", "FULL_SHARE_FUNDED", "BOOKED", "TRAVELING", "COMPLETE", "DROPPED_OUT", "CANCELED"];
  const FUNDED_STATES = new Set(["FULL_SHARE_FUNDED", "BOOKED", "TRAVELING", "COMPLETE"]);
  const COMMITTED_STATES = new Set(["ACCEPTED", "DEPOSIT_PAID", ...FUNDED_STATES]);
  const FEE_CATEGORIES = ["airline baggage", "overweight baggage", "seat selection", "airport parking", "airport transfer", "rental taxes/fees", "young driver fee", "additional driver", "one-way/drop fee", "rental refueling", "tolls", "hotel parking", "resort/destination fee", "cleaning fee", "security deposit", "pet fee", "event parking", "gratuity", "cruise port charges", "cruise gratuity", "Wi-Fi", "drink package", "specialty dining", "excursion", "late checkout", "early check-in", "miscellaneous"];
  const FEE_STATUSES = ["KNOWN", "USER-ENTERED", "VERIFIED", "UNKNOWN", "NOT APPLICABLE"];
  const RESERVATION_CATEGORIES = ["flight", "hotel/lodging", "rental vehicle", "bus", "rail", "transfer", "cruise", "activity", "event", "parking", "other"];
  const POLICY_STATUSES = ["UNKNOWN", "USER-ENTERED", "VERIFIED"];
  const num = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const text = value => typeof value === "string" ? value.trim().slice(0, 1000) : "";
  const uid = () => (globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  function createTrip(overrides = {}) {
    return Object.assign({
      schema_version: SCHEMA_VERSION, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      identity: { title: "", purpose: "", vibe: "" }, origin: "", destination: "", destination_unknown: false,
      dates: { start: "", end: "", flexibility: "fixed" }, budget: { total: 0, reserve: 0, currency: "USD" },
      traveler_count: 1, travelers: [], preferences: { lodging: "compare", transport: "compare", walking: "moderate", driving: "flexible", interests: [], culture_community: "", food: "", nightlife: "", outdoor_adventure: "" },
      needs: { pet_service_animal: "", accessibility: "" }, modes: { business: false, group: false, safe_night_no_driving: false, vendor_business_opportunity: false },
      reservations: [], hidden_fees: FEE_CATEGORIES.map(category => ({ id: uid(), category, status: "UNKNOWN", amount: null, source: "", notes: "" })),
      emergency: { scenario: "", personal_safety: false, contacts: "", documents_notes: "", booking_owners: "" }
    }, overrides);
  }

  function validateTrip(value) {
    const errors = [];
    const nonnegative = (v, allowNull = false) => allowNull && (v === null || v === "") ? true : Number.isFinite(Number(v)) && Number(v) >= 0;
    if (!value || typeof value !== "object" || Array.isArray(value)) return { valid: false, errors: ["Trip JSON must be an object."] };
    if (value.schema_version !== SCHEMA_VERSION) errors.push(`Unsupported schema_version. Expected ${SCHEMA_VERSION}.`);
    for (const key of ["identity", "dates", "budget", "preferences", "needs", "modes", "emergency"]) {
      if (!value[key] || typeof value[key] !== "object" || Array.isArray(value[key])) errors.push(`Missing or invalid ${key} object.`);
    }
    if (!nonnegative(value.budget?.total) || !nonnegative(value.budget?.reserve) || num(value.budget?.reserve) > num(value.budget?.total)) errors.push("Budget values must be nonnegative and reserve cannot exceed total budget.");
    if (!Number.isInteger(Number(value.traveler_count)) || Number(value.traveler_count) < 1) errors.push("traveler_count must be a positive integer.");
    if (!Array.isArray(value.travelers) || !Array.isArray(value.reservations) || !Array.isArray(value.hidden_fees)) errors.push("Travelers, reservations, and hidden_fees must be arrays.");
    const activeTravelers = (value.travelers || []).filter(t => !["DROPPED_OUT", "CANCELED"].includes(t?.commitment_state)).length;
    if (Number(value.traveler_count) < activeTravelers) errors.push("traveler_count cannot be smaller than active traveler records.");
    if (value.dates?.start && value.dates?.end && Date.parse(value.dates.end) < Date.parse(value.dates.start)) errors.push("Trip end date cannot be before start date.");
    (value.travelers || []).forEach((traveler, i) => {
      if (!traveler || !COMMITMENT_STATES.includes(traveler.commitment_state)) errors.push(`Traveler ${i + 1} has an invalid commitment state.`);
      if (!nonnegative(traveler?.amount_committed) || !nonnegative(traveler?.amount_paid)) errors.push(`Traveler ${i + 1} has invalid money values.`);
      if (num(traveler?.amount_paid) > num(traveler?.amount_committed)) errors.push(`Traveler ${i + 1} paid amount cannot exceed committed amount.`);
    });
    (value.hidden_fees || []).forEach((fee, i) => {
      if (!FEE_CATEGORIES.includes(fee?.category)) errors.push(`Hidden fee ${i + 1} has an invalid category.`);
      if (!FEE_STATUSES.includes(fee?.status)) errors.push(`Hidden fee ${i + 1} has an invalid status.`);
      if (!nonnegative(fee?.amount, true)) errors.push(`Hidden fee ${i + 1} has an invalid amount.`);
    });
    const reservationMoneyFields = ["booking_price","deposit_paid","amount_paid_beyond_deposit","remaining_balance","refundable_amount","nonrefundable_amount","change_rebooking_fee","provider_cancellation_fee","provider_no_show_fee"];
    (value.reservations || []).forEach((reservation, i) => {
      if (!RESERVATION_CATEGORIES.includes(reservation?.category)) errors.push(`Reservation ${i + 1} has an invalid category.`);
      if (reservation?.policy_status && !POLICY_STATUSES.includes(reservation.policy_status)) errors.push(`Reservation ${i + 1} has an invalid policy status.`);
      reservationMoneyFields.forEach(field => { if (!nonnegative(reservation?.[field], true)) errors.push(`Reservation ${i + 1} has an invalid ${field}.`); });
    });
    return { valid: errors.length === 0, errors };
  }

  function budgetMetrics(trip) {
    const total = num(trip.budget?.total), reserve = Math.min(total, num(trip.budget?.reserve));
    const activeRecords = (trip.travelers || []).filter(t => !["DROPPED_OUT", "CANCELED"].includes(t.commitment_state));
    const plannedCount = Math.max(1, Number(trip.traveler_count) || activeRecords.length || 1);
    const plannedShare = total / plannedCount;
    const fundedAmount = activeRecords.reduce((sum, t) => sum + num(t.amount_paid), 0);
    const recordedCount = activeRecords.length;
    return {
      total, reserve, spendable: total - reserve, plannedShare, fundedAmount,
      unfundedGap: Math.max(0, total - fundedAmount),
      plannedCount, invited: plannedCount, recordedCount,
      unrecorded: Math.max(0, plannedCount - recordedCount),
      committed: activeRecords.filter(t => COMMITTED_STATES.has(t.commitment_state)).length,
      funded: activeRecords.filter(t => FUNDED_STATES.has(t.commitment_state) || (plannedShare > 0 && num(t.amount_paid) >= plannedShare)).length
    };
  }

  function dropoutScenario(trip, dropouts, absorb = true, unpaidFriend = false) {
    const m = budgetMetrics(trip);
    const activeRecords = (trip.travelers || []).filter(t => !["DROPPED_OUT", "CANCELED"].includes(t.commitment_state));
    const underfundedExists = activeRecords.some(t => num(t.amount_paid) < m.plannedShare) || m.unrecorded > 0;
    const affected = unpaidFriend ? (underfundedExists ? 1 : 0) : Math.min(m.plannedCount, Math.max(0, Math.floor(num(dropouts))));
    const remaining = Math.max(0, m.plannedCount - affected);
    const potentialAdditionalGap = unpaidFriend ? 0 : affected * m.plannedShare;
    const shortage = Math.max(0, m.unfundedGap + potentialAdditionalGap);
    const newShare = absorb && remaining ? m.total / remaining : m.plannedShare;
    return {
      dropouts: affected, remaining, currentShare: m.plannedShare, newShare,
      increasePerRemaining: Math.max(0, newShare - m.plannedShare),
      totalFundingShortage: shortage,
      potentialAdditionalGap,
      assumption: unpaidFriend
        ? "Models one planned traveler who does not fund a share."
        : "Models lost expected contribution; refunds of already-paid money are handled in cancellation exposure."
    };
  }

  function cancellationExposure(reservations) {
    const result = (reservations || []).reduce((r, item) => {
      const price = num(item.booking_price), paid = num(item.deposit_paid) + num(item.amount_paid_beyond_deposit);
      const cappedPaid = price > 0 ? Math.min(price, paid) : paid;
      const recoverable = Math.min(cappedPaid, num(item.refundable_amount));
      r.totalBookedValue += price;
      r.totalAlreadyPaid += cappedPaid;
      r.remainingBalance += num(item.remaining_balance);
      r.estimatedRecoverable += recoverable;
      r.estimatedNonrefundable += num(item.nonrefundable_amount);
      r.estimatedFees += num(item.change_rebooking_fee) + num(item.provider_cancellation_fee) + num(item.provider_no_show_fee);
      if (text(item.credit_voucher_possibility) && text(item.credit_voucher_possibility).toUpperCase() !== "UNKNOWN") r.creditsVouchers.push(text(item.credit_voucher_possibility));
      if (!item.policy_status || item.policy_status === "UNKNOWN") r.unknownPolicies += 1;
      return r;
    }, { totalBookedValue: 0, totalAlreadyPaid: 0, remainingBalance: 0, estimatedRecoverable: 0, estimatedNonrefundable: 0, estimatedFees: 0, creditsVouchers: [], unknownPolicies: 0 });
    result.netEstimatedLoss = Math.max(0, Math.max(result.totalAlreadyPaid - result.estimatedRecoverable, result.estimatedNonrefundable) + result.estimatedFees);
    return result;
  }

  function hiddenFeeMetrics(fees) {
    return (fees || []).reduce((r, fee) => { if (fee.status === "UNKNOWN") r.unknown += 1; else if (fee.status !== "NOT APPLICABLE") { r.counted += 1; r.total += num(fee.amount); } return r; }, { total: 0, counted: 0, unknown: 0 });
  }

  function resilience(trip) {
    const b = budgetMetrics(trip), c = cancellationExposure(trip.reservations);
    const indicator = (label, status, reason) => ({ label, status, reason });
    const commitmentStatus = b.recordedCount === 0 ? "UNKNOWN" : (b.committed >= b.plannedCount && b.unrecorded === 0 ? "STRONG" : b.committed > 0 ? "WATCH" : "EXPOSED");
    return [
      indicator("Funding readiness", b.total === 0 ? "UNKNOWN" : b.fundedAmount >= b.total ? "STRONG" : b.funded > 0 ? "WATCH" : "EXPOSED", b.total === 0 ? "Trip budget is not funded yet." : `${moneyRaw(b.fundedAmount)} of ${moneyRaw(b.total)} is recorded as paid; promises are not counted.`),
      indicator("Cancellation exposure", !trip.reservations.length ? "UNKNOWN" : c.unknownPolicies ? "WATCH" : c.netEstimatedLoss ? "EXPOSED" : "STRONG", !trip.reservations.length ? "No reservations entered." : `${c.unknownPolicies} reservation policy field(s) remain unknown; estimated loss is ${moneyRaw(c.netEstimatedLoss)}.`),
      indicator("Transportation backup", trip.preferences?.transport === "compare" ? "STRONG" : "WATCH", trip.preferences?.transport === "compare" ? "Multiple practical transport modes may be compared." : "One preferred mode is selected; record a backup before commitment."),
      indicator("Emergency reserve", b.total === 0 ? "UNKNOWN" : b.reserve >= b.total * .1 ? "STRONG" : b.reserve > 0 ? "WATCH" : "EXPOSED", b.total === 0 ? "Set a budget before reserve readiness can be evaluated." : b.reserve ? `${moneyRaw(b.reserve)} is protected from planned spend.` : "No emergency reserve is recorded."),
      indicator("Group commitment", commitmentStatus, `${b.committed} committed traveler record(s) for ${b.plannedCount} planned traveler(s); ${b.unrecorded} planned traveler(s) have no record yet; ${b.funded} are fully funded.`),
      indicator("Lodging flexibility", trip.preferences?.lodging === "compare" ? "STRONG" : "WATCH", trip.preferences?.lodging === "compare" ? "Lodging remains open for comparison." : "A lodging preference is selected; cancellation terms still need verification."),
      indicator("Schedule flexibility", trip.dates?.flexibility && trip.dates.flexibility !== "fixed" ? "STRONG" : "WATCH", trip.dates?.flexibility === "fixed" ? "Dates are fixed, reducing recovery options." : "Flexible dates can support alternatives.")
    ];
  }
  function moneyRaw(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(n)); }

  return { SCHEMA_VERSION, STORAGE_KEY, COMMITMENT_STATES, FEE_CATEGORIES, FEE_STATUSES, RESERVATION_CATEGORIES, POLICY_STATUSES, createTrip, validateTrip, budgetMetrics, dropoutScenario, cancellationExposure, hiddenFeeMetrics, resilience };
});
