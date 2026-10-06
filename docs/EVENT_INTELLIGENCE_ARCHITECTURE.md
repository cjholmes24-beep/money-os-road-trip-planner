# Events Intelligence Core V1

## Scope and modules

`event-intelligence.js` is a dependency-free UMD module used by Node and the browser. `planner-ui.js` edits and presents browser-local events. No live feed, inventory, backend, paid service, vendor economics, geospatial calculation, affiliate ranking, or public event pages are introduced. Production starts with no event records. Test fixtures are explicitly synthetic and remain in tests.

## Canonical record and occurrences

`normalizeEvent` creates event identity, title/summary, category, tags/subcategories, organizer/venue/location/city/region/country, timezone, concept start/end/all-day, recurrence description, seasonal themes, minimum age, explicit nullable family/registration/reservation flags, indoor/outdoor, price type/currency, four monetary components, organizer status, candidate HTTPS event/ticket URLs, source metadata, last verification, notes, origin, and explicit occurrences. Categories imply no facts. Seasons are tags and do not manufacture events.

Each occurrence has its own id, event_id, start/end, timezone, all_day, organizer status, and source. Single/multi-day concepts default to one occurrence. Recurring/seasonal concepts may have several explicit occurrences; recurrence remains descriptive and never expands into future records. The editor's optional JSON occurrence array enables multiple dates; it is authoritative over concept summary dates. Event/occurrence IDs must be unique within their respective collection.

Timed dates require ISO 8601 with Z or an explicit offset, avoiding host-timezone guesses and DST ambiguity. All-day dates are YYYY-MM-DD with an inclusive end day; their current time state uses a supplied IANA timezone and fails closed without it. A future ICS adapter must convert its exclusive DTEND. `occurrenceTimeState(occurrence, now)` is deterministic: UPCOMING, IN_PROGRESS, PAST, DATE_UNKNOWN. At timed end the occurrence is past. Missing timed end becomes DATE_UNKNOWN once the start has passed; duration is never invented. Organizer status is independent: a past scheduled event stays SCHEDULED, cancellation stays CANCELED, and a failed source is UNAVAILABLE rather than canceled or sold out.

## Monetary truth

`base_price`, `mandatory_fees`, `parking_cost`, and `optional_cost` carry `{value,state}`. States match existing truth doctrine. Null/blank/boolean/invalid inputs do not become numeric zero. FREE is a price-type statement, not an instruction to invent zero fees. `priceTruth` reports known required and optional costs, unresolved required fields, coverage, and completeness. V1 required admission cost is base plus mandatory fees. Parking is optional travel cost; mandatory parking/admission obligations belong in mandatory fees. This separation is explicit in the editor. No cheapest lens or FX conversion is provided.

## Trust and failure isolation

Only runtime adapter code using `normalizeEvent(input, {trustedSource:true})` can create SOURCE_BACKED runtime records. This is a code capability, never a persisted data property. Trusted normalized records are deeply frozen and held in a private WeakSet. Ordinary normalization forces USER_ENTERED monetary/source facts regardless of incoming VERIFIED/PUBLISHED/OFFICIAL claims. There is no OFFICIAL truth state.

Both candidate URLs require HTTPS without URL credentials. `officialUrl` additionally requires the original runtime object and fresh metadata. JSON copies cannot recreate this capability. The UI shows user URLs as unverified text, not booking links.

`sanitizePersistedEvents` first validates the complete structure, then clones and downgrades PUBLISHED/VERIFIED money to USER_ENTERED. SOURCE_BACKED snapshot provenance is retained but source truth becomes UNKNOWN, last_verified clears, and its display state is UNVERIFIED SNAPSHOT. User source identity is reset to Traveler. Original source-backed retrieval times are retained without claiming recency. Fresh runtime objects need a retrieval date and explicit TTL; expired facts display STALE. `isolateSource` converts thrown errors, rejected promises, and invalid collections into source-local UNAVAILABLE without returning private errors or modifying any trip data.

## Filtering and trip matches

`filterEvents` supports inclusive civil-date windows, category, location text, seasonal theme, price type, explicit family fit, known minimum-age eligibility, indoor/outdoor, and organizer status. Unknown age/family facts do not satisfy those filters. Location matching is token-based text, not distance or routing.

`matchTripEvents` requires date overlap. When destination is supplied, location text must match. It excludes canceled/postponed concepts and occurrences and explicitly incompatible recorded traveler ages. It returns event/reason pairs in input order: DATE OVERLAP, DESTINATION TEXT MATCH, INTEREST MATCH, CATEGORY MATCH, and EXPLICIT AGE COMPATIBILITY. Age compatibility requires numeric ages for the entire planned party; Adult/senior bands never imply a number. Incomplete age records remain unknown. Interests/purpose/vibe supply explainable text/category reasons, never an opaque score. Affiliate fields are not read. Date matching uses written local occurrence dates; absent end supports only the known start day.

## Schema V3 and storage

`trip-intelligence.js` loads the events dependency and adds `events: []`, schema_version 3, and `suitcase-brain.trip.v3`. Load checks V3 then V2 then V1 storage, preserving old saved copies. Migration chains V1→V2→V3; V2 transport/lodging collections are cloned intact, then the existing UI transport/lodging trust sanitizer applies. V3 clone/load validates and sanitizes events too. Future schemas, non-array events, corrupt records, invalid occurrence references/dates/costs/URLs, and duplicate IDs are rejected. UI save/export validate the complete trip; load/import reject invalid input without replacing the working trip. Events stay browser-local and survive save/load/export/import.

## Presentation and validation

Plan My Trip adds mobile event CRUD, explicit multiple occurrences, local filters, origin counts, and EVENTS & EXPERIENCES matches in its blueprint. Time state, organizer status, cost coverage, source/freshness, and unknowns remain visible. Empty states explicitly distinguish NO MATCHING EVENT DATA and LIVE EVENT SOURCE NOT CONNECTED. Existing Travelpayouts disclosure/loader, EIA/NWS, transport/lodging, group funding/dropout/cancellation, sitemap and robots remain.

CI runs the original harness plus event regressions, JavaScript syntax, JSON registry validation, static UI/source boundaries, links/sitemap/disclosure, and secret scanning. Browser smoke testing uses real Chromium at 390px with external requests blocked, synthetic test input, and no production data changes.
