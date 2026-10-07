# Suitcase Brain Travel Intelligence — Status

Date: 2026-10-07
Architecture cost: **$0 owner cost**
Current browser-local schema: **V3** (V1→V2→V3 and V2→V3 import/save migration supported)

## Implemented

All Travel Intelligence V1 funding, dropout, cancellation, hidden-fee, resilience, emergency, local persistence, import/export, EIA fuel, NWS weather, Travelpayouts Drive, search/distribution and CI functions remain.

Transportation + Lodging V1 adds canonical provider-neutral models, per-component truth states, known-cost coverage, cancellation exposure, verified booking-link gates, independent comparison lenses, user-entered quote add/edit/remove, save/export/import, schema V1→V2 migration, provider-failure isolation, driving fuel math, and a GTFS Schedule normalization foundation. Comparison logic never reads affiliate payout.

## Source-backed

- EIA weekly gasoline reference (official government snapshot; not a route or station quote).
- NWS opt-in current-location forecast.
- Travelpayouts Drive as an existing affiliate surface, not factual authority.
- GTFS open-standard normalization architecture. No agency feed is presented as live nationwide data.

## Not connected / provider access required

Live airfare, baggage fees, flight availability, rental inventory, intercity inventory, route mileage, taxi/rideshare quotes, transfer/shuttle inventory, hotel/accommodation inventory, and provider cancellation policies are not connected. Travelpayouts Data API, Amadeus, Booking.com Demand API and Expedia Rapid require secrets and/or verified provider approval and are not called from the browser.

The UI says `UNKNOWN`, `NOT CONNECTED`, `PROVIDER ACCESS REQUIRED`, or `UNAVAILABLE` rather than manufacturing an answer. No safe live lodging inventory source is connected yet.

## Privacy, money, and failure behavior

Trip data stays in browser storage or user-triggered JSON files. No provider secret, payment credential, backend, customer custody, booking fee or service fee was introduced. Provider failure is isolated; user-entered records and the trip remain. Stale snapshots retain their real dates. Affiliate state stays separate from fact authority and traveler ranking.


## Cleanup audit before merge

Independent PR cleanup strengthened the V1 transport/lodging layer before merge:

- transportation cost completeness is mode-aware rather than requiring unrelated mode fees
- quote forms expose separate canonical fee fields so known-total math can actually resolve
- null/blank amounts remain unknown instead of coercing to zero
- cancellation comparisons require complete known cancellation amounts
- mixed currencies fail closed until FX conversion exists
- comparison lenses require a real comparison population
- imported and reloaded provider-backed facts are downgraded until runtime re-verification
- persisted booking URLs cannot recreate trusted clickable provider links
- EIA fuel basis can only be claimed after loading the official snapshot and is blocked for non-USD trip currency until FX exists
- provider capability records no longer assert zero commercial/API cost where current cost has not been verified
- user quote controls cannot self-declare provider-published or provider-verified policy status
- async provider failures are isolated
- transport/lodging option bodies are validated on save, load, import, export, and blueprint generation

Browser automation was unavailable for this engineering environment, so no browser smoke run is claimed. GitHub Actions supplies syntax, unit, static-site, JSON, provider-boundary, and secret-pattern validation.

## Events Intelligence Core V1

Schema V3 persists browser-local canonical events and explicit occurrences. The Plan My Trip event workspace supports add/edit/remove, local date/category/location/season/price/age/family/status filters, and explainable trip-date matches. Category does not imply age, cost, or family fit. Organizer status is independent of UPCOMING/IN_PROGRESS/PAST/DATE_UNKNOWN. Unknown prices stay null; complete required admission cost needs base and mandatory fees.

User-entered events cannot claim official runtime verification. Reload/import downgrades source-backed snapshots and candidate URLs require runtime trust to become official links. No live event feed, nationwide inventory, paid integration, affiliate event ranking, or vendor engine was connected. Source failures become UNAVAILABLE without replacing user records or breaking transport/lodging. See `docs/EVENT_INTELLIGENCE_ARCHITECTURE.md`, `docs/EVENT_SOURCE_AUDIT_2026-10-05.md`, and `data/event-source-registry.json`.


## Events cleanup audit before merge

Independent PR review hardened Events Intelligence Core V1 before merge:

- persisted runtime source-backed events downgrade to IMPORTED snapshots
- imported snapshots remain UNKNOWN/unverified across repeated reloads
- source adapters cannot report USER_ENTERED collections as AVAILABLE
- trusted adapters with missing fact type fail closed to UNKNOWN
- custom single occurrences remain preserved during edit
- UI separates live source-backed records from imported unverified snapshots
- cleanup regressions pass in GitHub Actions

No live event feed, ticket inventory, vendor engine, paid integration, or event affiliate ranking was introduced.

## Revenue Activation + Demand Capture V1

Existing high-intent tools and Plan My Trip now offer relevant comparison checklists with a reusable runtime-verified provider action gate. Drive and disclosures remain unchanged; no new direct affiliate URL or account approval is assumed. Optional local history is off by default and captures broad enumerated planning signals only, with view/clear/export at `/revenue-dashboard/`. It does not save destination text, exact budget/dates, identities, precise location, health, or payment data.

The dashboard separates ATTENTION, INTENT and MONEY. Clicks do not become bookings or revenue. Redacted provider-report JSON imports are labeled USER IMPORTED — UNVERIFIED and cannot unlock verified money milestones. With no live payout/report adapter, verified CLEARED REVENUE remains $0. The trip schema stays V3. No paid service, backend, customer payment, autonomous traffic, or national-trend claim was introduced. See `docs/REVENUE_ACTIVATION_ARCHITECTURE.md` and `docs/TRAVELPAYOUTS_REVENUE_ACTIVATION_AUDIT_2026-10-06.md`.


## Revenue activation cleanup audit before merge

Independent review hardened the revenue proof boundary:

- provider-action surfaces fail closed on unknown values
- USER_IMPORTED state counts are separated from runtime-verified provider state counts
- a future provider adapter can register only runtime-trusted report objects
- cleared report timestamps cannot precede booking dates
- monetization registry ids and routing metadata receive stricter validation

No new provider reporting connection or verified direct affiliate URL was introduced. Verified cleared revenue remains $0 unless trusted provider evidence is supplied at runtime.

## First-dollar sprint V1

Eight existing priority surfaces have clearer result-first decisions/contextual tools. Local first-dollar milestones, Money Blockers and exportable category gaps are available. Drive installation is preserved; eight categories are DRIVE_ONLY with account eligibility UNKNOWN, and BUS_RAIL/CRUISES have generic intake only (NOT_READY). No category is newly certified READY_TO_EARN; no verified direct provider link or reporting adapter is configured. Cleared revenue remains unproven/$0 without legitimate runtime evidence. No paid infrastructure or trip-schema change.

## Organic Demand Engine V1

Daily read-only repository opportunity analysis, seasonal calendar windows, internal-link/metadata/structured-data/source-age auditing, and an exportable reviewed snapshot are implemented. All eight money pages have original planning answers/FAQs. One distinct flight-versus-driving page reuses the existing fuel formula and entered group flight total; no broad travel engine rebuilt. Aggregate search imports are explicit, strictly allowlisted and unverified; the dashboard keeps them in memory only. No Google/Bing API, live provider report, private credential, fake acquisition, automated article publication or paid infrastructure is introduced.

The owner-observed October 6 Travelpayouts Active/maximum and small provider-activity baseline is documented only in TRAFFIC_BASELINE_2026-10-06.md. Its acquisition source is unproven and its counts are not live dashboard truth or revenue proof. Real qualified traffic remains the first weak stage; booking and cleared payout remain separate provider evidence requirements. Scheduled analysis uses workflow artifacts/summary, never automatic commits or unchanged-URL submissions. See ORGANIC_DEMAND_ENGINE.md.


## Organic Demand Engine independent review

Independent PR review inspected the engine, scheduled workflow, site-audit logic, search-import boundary, revenue-dashboard integration, new comparison page, generated opportunity snapshot, and regression coverage. No merge-blocking code defect was found. Cleanup corrected stale documentation that still described already-merged Events, Revenue Activation, and First-Dollar work as pending review. The engine remains a read-only opportunity/distribution analyzer: it can improve and prioritize organic acquisition work, but it does not itself generate visitors, bookings, or revenue.
