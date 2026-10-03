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
    if (!value || typeof value !== "object" || Array.isArray(value)) return { valid: false, errors: ["Trip JSON must be an object."] };
    if (value.schema_version !== SCHEMA_VERSION) errors.push(`Unsupported schema_version. Expected ${SCHEMA_VERSION}.`);
    if (!value.identity || typeof value.identity !== "object") errors.push("Missing trip identity.");
    if (!value.budget || typeof value.budget !== "object" || num(value.budget.reserve) > num(value.budget.total)) errors.push("Budget must exist and reserve cannot exceed total budget.");
    if (!Number.isInteger(Number(value.traveler_count)) || Number(value.traveler_count) < 1) errors.push("traveler_count must be a positive integer.");
    if (!Array.isArray(value.travelers) || !Array.isArray(value.reservations) || !Array.isArray(value.hidden_fees)) errors.push("Travelers, reservations, and hidden_fees must be arrays.");
    (value.travelers || []).forEach((traveler, i) => {
      if (!traveler || !COMMITMENT_STATES.includes(traveler.commitment_state)) errors.push(`Traveler ${i + 1} has an invalid commitment state.`);
      if (num(traveler.amount_paid) > num(traveler.amount_committed)) errors.push(`Traveler ${i + 1} paid amount cannot exceed committed amount.`);
    });
    (value.hidden_fees || []).forEach((fee, i) => { if (!FEE_STATUSES.includes(fee?.status)) errors.push(`Hidden fee ${i + 1} has an invalid status.`); });
    (value.reservations || []).forEach((reservation, i) => { if (!RESERVATION_CATEGORIES.includes(reservation?.category)) errors.push(`Reservation ${i + 1} has an invalid category.`); });
    return { valid: errors.length === 0, errors };
  }

  function budgetMetrics(trip) {
    const total = num(trip.budget?.total), reserve = Math.min(total, num(trip.budget?.reserve));
    const active = (trip.travelers || []).filter(t => !["DROPPED_OUT", "CANCELED"].includes(t.commitment_state));
    const count = Math.max(1, Number(trip.traveler_count) || active.length || 1);
    const fundedAmount = (trip.travelers || []).reduce((sum, t) => sum + num(t.amount_paid), 0);
    return { total, reserve, spendable: total - reserve, plannedShare: total / count, fundedAmount, unfundedGap: Math.max(0, total - fundedAmount), invited: (trip.travelers || []).length, committed: active.filter(t => COMMITTED_STATES.has(t.commitment_state)).length, funded: active.filter(t => FUNDED_STATES.has(t.commitment_state) || num(t.amount_paid) >= total / count).length };
  }

  function dropoutScenario(trip, dropouts, absorb = true, unpaidFriend = false) {
    const m = budgetMetrics(trip), active = (trip.travelers || []).filter(t => !["DROPPED_OUT", "CANCELED"].includes(t.commitment_state));
    const affected = unpaidFriend ? active.filter(t => num(t.amount_paid) < m.plannedShare).length : Math.max(0, Math.floor(num(dropouts)));
    const remaining = Math.max(0, active.length - affected);
    const retainedFunding = unpaidFriend ? active.reduce((s, t) => s + num(t.amount_paid), 0) : Math.max(0, m.fundedAmount - affected * m.plannedShare);
    const shortage = Math.max(0, m.total - retainedFunding);
    const newShare = absorb && remaining ? m.total / remaining : m.plannedShare;
    return { dropouts: affected, remaining, currentShare: m.plannedShare, newShare, increasePerRemaining: Math.max(0, newShare - m.plannedShare), totalFundingShortage: shortage };
  }

  function cancellationExposure(reservations) {
    return (reservations || []).reduce((r, item) => {
      const price = num(item.booking_price), paid = num(item.deposit_paid) + num(item.amount_paid_beyond_deposit);
      r.totalBookedValue += price; r.totalAlreadyPaid += Math.min(price || paid, paid); r.estimatedRecoverable += num(item.refundable_amount);
      r.estimatedNonrefundable += num(item.nonrefundable_amount); r.estimatedFees += num(item.change_rebooking_fee) + num(item.provider_cancellation_fee) + num(item.provider_no_show_fee);
      if (text(item.credit_voucher_possibility) && text(item.credit_voucher_possibility).toUpperCase() !== "UNKNOWN") r.creditsVouchers.push(text(item.credit_voucher_possibility));
      if (!item.policy_status || item.policy_status === "UNKNOWN") r.unknownPolicies += 1;
      return r;
    }, { totalBookedValue: 0, totalAlreadyPaid: 0, estimatedRecoverable: 0, estimatedNonrefundable: 0, estimatedFees: 0, creditsVouchers: [], unknownPolicies: 0, get netEstimatedLoss() { return Math.max(0, this.totalAlreadyPaid - this.estimatedRecoverable + this.estimatedFees); } });
  }

  function hiddenFeeMetrics(fees) {
    return (fees || []).reduce((r, fee) => { if (fee.status === "UNKNOWN") r.unknown += 1; else if (fee.status !== "NOT APPLICABLE") { r.counted += 1; r.total += num(fee.amount); } return r; }, { total: 0, counted: 0, unknown: 0 });
  }

  function resilience(trip) {
    const b = budgetMetrics(trip), c = cancellationExposure(trip.reservations), active = Math.max(1, b.invited);
    const indicator = (label, status, reason) => ({ label, status, reason });
    return [
      indicator("Funding readiness", b.fundedAmount >= b.total ? "STRONG" : b.funded ? "WATCH" : "EXPOSED", `${moneyRaw(b.fundedAmount)} of ${moneyRaw(b.total)} is recorded as paid; promises are not counted.`),
      indicator("Cancellation exposure", !trip.reservations.length ? "UNKNOWN" : c.unknownPolicies ? "WATCH" : c.netEstimatedLoss ? "EXPOSED" : "STRONG", !trip.reservations.length ? "No reservations entered." : `${c.unknownPolicies} reservation policy field(s) remain unknown; estimated loss is ${moneyRaw(c.netEstimatedLoss)}.`),
      indicator("Transportation backup", trip.preferences?.transport === "compare" ? "STRONG" : "WATCH", trip.preferences?.transport === "compare" ? "Multiple practical transport modes may be compared." : "One preferred mode is selected; record a backup before commitment."),
      indicator("Emergency reserve", b.reserve >= b.total * .1 ? "STRONG" : b.reserve > 0 ? "WATCH" : "EXPOSED", b.reserve ? `${moneyRaw(b.reserve)} is protected from planned spend.` : "No emergency reserve is recorded."),
      indicator("Group commitment", b.invited === 0 ? "UNKNOWN" : b.committed === active ? "STRONG" : b.committed ? "WATCH" : "EXPOSED", `${b.committed} of ${b.invited} traveler records are committed; ${b.funded} are fully funded.`),
      indicator("Lodging flexibility", trip.preferences?.lodging === "compare" ? "STRONG" : "WATCH", trip.preferences?.lodging === "compare" ? "Lodging remains open for comparison." : "A lodging preference is selected; cancellation terms still need verification."),
      indicator("Schedule flexibility", trip.dates?.flexibility && trip.dates.flexibility !== "fixed" ? "STRONG" : "WATCH", trip.dates?.flexibility === "fixed" ? "Dates are fixed, reducing recovery options." : "Flexible dates can support alternatives.")
    ];
  }
  function moneyRaw(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(n)); }

  return { SCHEMA_VERSION, STORAGE_KEY, COMMITMENT_STATES, FEE_CATEGORIES, FEE_STATUSES, RESERVATION_CATEGORIES, createTrip, validateTrip, budgetMetrics, dropoutScenario, cancellationExposure, hiddenFeeMetrics, resilience };
});
