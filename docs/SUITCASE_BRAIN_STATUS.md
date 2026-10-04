# Suitcase Brain Travel Intelligence — Status

Date: 2026-10-04
Architecture cost: **$0 owner cost**
Current browser-local schema: **V2** (V1 import/save migration supported)

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
