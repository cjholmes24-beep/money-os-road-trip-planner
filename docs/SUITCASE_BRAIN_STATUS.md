# Suitcase Brain Travel Intelligence — Status

Date: 2026-10-06
Architecture cost: **$0 owner cost**
Current task-branch browser-local schema: **V3** (V1→V2→V3 and V2→V3 import/save migration supported; this brick is pending PR review)

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

## Events Intelligence Core V1 (pending PR review)

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
