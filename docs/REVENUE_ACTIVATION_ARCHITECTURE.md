# Revenue Activation + Demand Capture V1

## Boundaries

`revenue-intelligence.js` is a dependency-free UMD domain module. `revenue-ui.js` supplies shared action cards, optional local history, planner/calculator hooks, and the local dashboard. It does not change trip schema V3, Events, Transport/Lodging, EIA/NWS, recommendation ordering, or the installed Drive loader. No paid infrastructure, customer accounts/payments, outreach, background traffic generation, or centralized analytics is added.

## Attention, intent, and money

Local funnel states are VISITOR, PLANNER_ENGAGED, QUALIFIED_INTENT, MONETIZABLE_ACTION_AVAILABLE and PROVIDER_CLICK. Other funnel states require a separate provider-report model: ATTRIBUTED_BOOKING, COMMISSION_PENDING, PROVIDER_APPROVED and CLEARED_REVENUE, plus REVERSED/CANCELED. The demand event API rejects money states. A click never generates a money record.

Signals are PAGE_VIEWED, CALCULATOR_USED, PLANNER_STARTED, BLUEPRINT_GENERATED, TRANSPORT_COMPARISON_VIEWED, LODGING_COMPARISON_VIEWED, EVENT_MATCH_VIEWED, CATEGORY_SELECTED, PROVIDER_ACTION_SHOWN and PROVIDER_ACTION_CLICKED. Capture is opt-in, off by default, capped at the latest 1,000 events, and disabled on the diagnostic dashboard. Successful calculator events fire after existing validation/calculation. Planner starts follow actual input. Comparison signals require populated comparisons/matches and viewport visibility. Verified provider visibility requires its actual action to be visible; selecting a checklist is only CATEGORY_SELECTED.

Intent rules are explicit: reading is BROWSING, calculators/needs/planner use PLANNING, populated comparisons COMPARING, a valid blueprint with dates/destination/positive budget HIGH_INTENT, and a runtime-eligible action click MONETIZABLE_INTENT. No payout/commission or AI score enters selection/order.

## Privacy and retention

Only allowlisted dimensions are saved: category, enumerated trip-purpose band, date horizon, budget band, group-size band, transport/lodging/event interest, seasonal theme and known source-page path. Exact dates, exact budget, trip titles, destination text, addresses, personal/emergency/health notes, traveler names/contact details, geolocation, referrer URLs/query strings, payment/account data and identifiers are never copied from trip data into demand storage. The task's optional free-text destination dimension is intentionally omitted because it can contain an exact private address or personal note.

The demand model rejects unknown fields and arbitrary dimension strings; reasons are the fixed generated vocabulary. No fingerprint, persistent visitor ID, unique-visitor or national-trend claim is made. Event IDs identify individual local events only. Local page activity cannot prove organic acquisition, so FIRST ORGANIC VISITOR stays NOT PROVEN. No local data is sent to a backend or Drive. The existing Drive installation has its own disclosed affiliate processing; local opt-out does not alter it.

Separate storage keys: `suitcase-brain.demand.v1`, `suitcase-brain.reports.v1`, and local consent. Clear/export controls are browser-local. Disabling capture pauses future events; clear removes the respective history. Storage errors do not stop calculators/planning. Corrupt demand and report ledgers are isolated and can be cleared independently. Multi-tab consent changes propagate through browser storage events. Clearing telemetry does not touch saved trips.

## Actions and category registry

The registry covers ten legitimate travel-need categories, while separating installed Drive from unknown program approval and unknown category eligibility. All new direct URL availability flags are false. No affiliate URL is loaded from declarative JSON. Account approval is not inferred from a brand's existence, generic documentation, DOM link, or script installation.

`selectTripCategories` uses explicit travel preferences and need choices. It does not show every earning category by default or infer international/insurance/disruption facts from sensitive notes. Needs without a verified route get a useful comparison checklist and a clear unavailable-provider message. Priority calculators expose it after successful output; guides provide content before their optional action. Plan My Trip places NEXT USEFUL ACTIONS after the valid blueprint and supports additional explicit needs. Needs are not persisted into the trip schema; users can reselect them.

`createProviderAction` requires approved runtime context, HTTPS without embedded credentials, provider identity, an explicit recognized surface, and a verification timestamp. Unknown/typoed surfaces fail closed rather than silently becoming a direct-link claim. A private WeakSet capability gates `actionUrl`; JSON cannot manufacture clickable eligibility. `RevenueActivation.registerAction` is the hook for a future verified adapter. The blueprint also bridges an existing Transport/Lodging `bookingUrl` capability only with an APPROVED relationship and valid verification metadata. Replacing/loading a trip clears previously derived actions so old routes do not survive as current recommendations. The registry and action ordering do not read commission fields.

Drive's automated offers remain independently controlled. No undocumented callback, arbitrary DOM scraper, fake click, popup trigger, guaranteed offer/discount/price, or token is added. Drive-only clicks/bookings must be assessed through official account reports; they are not invented locally.

## Provider-report import and proof

Reports have id, provider, category, external_reference (nullable), booking_date, commission_currency, commission_amount (nullable for attributed bookings), state, reported_at, cleared_at, evidence_source and record_origin. Only these keys are accepted. Provider/reference/evidence identifiers are bounded tokens, not raw private report contents. Imports cap at 1,000 records/1 MB in UI, require a version 1 envelope, validate dates/amounts/states, reject extra fields, reject duplicate provider references, and replace the local ledger atomically. Invalid imports preserve existing reports.

One latest state per stable commission/reference prevents duplicate pending/approved/cleared versions from summing. Canceled/reversed revisions supersede earlier cleared claims. Mixed currencies remain separate and there is no invented FX conversion. USD cleared payouts require whole cents and threshold summation uses integer cents. Cleared timestamps must not precede the booking date or follow the report timestamp.

All file imports and reloads are USER_IMPORTED. A claim that record_origin=PROVIDER_REPORTED is not trusted. The dashboard labels file/reload records USER IMPORTED — UNVERIFIED, keeps their state counts separate from runtime-verified provider state counts, and leaves verified CLEARED REVENUE at $0 unless a trusted runtime adapter actually supplies proof. Raw CSV is not imported; an owner must redact/transform official report data to the narrow JSON schema. Do not place names, emails, bank details, customer references identifying people, or original private report contents in identifiers.

Only `verifyProviderReport(input, {trusted:true})`, called by legitimate future provider-adapter code, creates an immutable runtime proof object in a separate private WeakSet. `RevenueActivation.registerProviderReports` accepts only those runtime-trusted objects, allowing a future authenticated adapter to populate the dashboard without weakening the import boundary. CLEARED_REVENUE additionally requires `evidenceKind: PAYOUT_RECEIPT`. Confirmed/paid booking earnings alone cannot be promoted to cash received. Serialization loses proof capability and requires re-verification. This is a code trust boundary, not a browser-based cryptographic audit or a currently configured reporting API. No production adapter supplies verified money in V1.

## Milestones and dashboard

The noindex `/revenue-dashboard/` separates ATTENTION, INTENT and MONEY. It exposes local event history, insights, consent, clear/export, report import/clear/export, provisional report summaries and proof milestones. It intentionally has no Drive loader and is excluded from the public sitemap because it handles local financial diagnostics.

FIRST QUALIFIED INTENT and FIRST ELIGIBLE PROVIDER CLICK use local diagnostics; money milestones require verified latest provider evidence. FIRST CLEARED DOLLAR/$10/$100 use verified USD cleared amounts only. Other currencies are shown separately. Recurring weekly revenue means positive verified USD clearing in four consecutive UTC Monday-based weeks; recurring daily means seven consecutive UTC days. Reversed/canceled/latest-unverified revisions cannot count as verified cleared proof. Imported claims cannot trigger any verified money milestone. Organic/unique traffic remains unproven.

## Hooks for later 24/7 optimization

The next brick can consume the normalized demand event vocabulary and `demandInsights` output alongside authenticated provider performance/payout exports. Category demand, seasonal interest, source-page action counts and gaps are local observations until a lawful aggregate pipeline exists. Pages without provider clicks may lack a verified action or have incomplete measurement; do not label them conversion failures. Destination demand requires a deliberately designed coarse public location taxonomy before capture; V1 intentionally has no free-text destination history.

Centralized conversion analysis must deduplicate real sessions without fingerprinting, honor consent/retention, exclude test/bot traffic, reconcile provider click/action/reference IDs, preserve program attribution limits and source timestamps, and distinguish approval from receipt/reversal. Review any future hosting/API/quota configuration under the $0 rule before deploying. No always-on traffic simulator or speculative earnings model belongs in that pipeline.
