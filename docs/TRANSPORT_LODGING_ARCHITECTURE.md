# Transportation + Lodging Intelligence Architecture

## Boundaries

V1 is browser-local, static, dependency-free, provider-neutral, and $0. `transport-lodging-intelligence.js` is the reusable domain layer; `planner-ui.js` is only an editor/presenter. Live adapters must normalize into the same models and fail closed.

## Canonical models

`TransportOption` supports drive, flight, rental car, bus, rail, public transit, rideshare, taxi, transfers, shuttle and group vehicle modes. `LodgingOption` supports hotel through campground categories and a nullable amenity map. Each expected monetary component is `{ value, state, source }`, where state is `VERIFIED`, `PUBLISHED`, `USER_ENTERED`, `UNKNOWN`, or `NOT_APPLICABLE`. Unknown is `null`, never numeric zero.

Both models carry record origin, policy/availability state, source metadata, cancellation exposure, deposit/hold and a normalized `BookingOpportunity`. A booking URL is renderable only when its link state is `VERIFIED` and it is HTTPS.

## Price and comparisons

The completeness engine reports known base, mandatory add-ons, optional add-ons, known required total, known all-in total, unknown component names/count, deposit/hold and potential cancellation exposure. Transportation mandatory components are mode-aware so a flight is not penalized for unknown rental-car fees and a private drive is not required to invent an airfare base price. A lowest-cost lens is eligible only when every relevant mandatory component is resolved. Optional extras are excluded from cheapest-required-cost ranking. Mixed currencies fail closed with `CURRENCY CONVERSION REQUIRED` because FX conversion is not connected. Other lenses remain independent; there is no magical “best” score.

Affiliate relationship and commission fields never enter a comparison function. This is regression-tested.

## Adapters and failure isolation

Normalization functions are provider adapters' contract: `normalizeTransportOption`, `normalizeLodgingOption`, `sourceMetadata`, `normalizeGtfsSchedule`, and normalized policy/booking fields. Missing provider data becomes `UNKNOWN`. Null/blank values are never treated as zero. Cancellation comparisons require complete known cancellation amounts rather than assuming missing amounts are $0. `isolateProvider` is asynchronous and converts both thrown errors and rejected provider promises to provider-local `UNAVAILABLE` without deleting trip or user-entered data.

GTFS V1 normalizes agency, route, stop, trip, service date, scheduled departure/arrival and an unknown transfer count. It does not claim routing, realtime decoding or a nationwide dataset.

## Persistence

Trip schema V2 adds `transportation_options` and `lodging_options`. `migrateTrip` performs the intentional V1→V2 additive migration. The UI checks the V2 key, then the V1 key, validates the base trip and every normalized transport/lodging option after migration, and rejects corrupt/future schemas. Export/import and browser save include both collections.

## Source truth versus booking relationship

`data/provider-capability-registry.json` records authority and affiliate status separately. EIA is a source of truth but not an affiliate. Travelpayouts Drive is an affiliate surface but is not factual authority for price, policy, schedule, quality or safety.


## EIA fuel provenance

A driving estimate may claim the EIA weekly reference only after the public EIA snapshot is actually loaded through the source adapter. The final fuel-total component remains a derived traveler estimate because route miles and MPG are user inputs; its source metadata records the EIA reference used. Manual edits clear the EIA basis.
