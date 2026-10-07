# Plan My Trip consumerization — pending PR review

Starting main: `07beb35548d8e05e3a54e4f9d4cc8508ba0379b2`.
Task branch: `codex/plan-my-trip-consumerization-v1`. No merge authorized.

The public planner now leads with the trip, budget, funding concerns, meaningful comparisons, selected events, risks and relevant next steps. Internal branding and inventories of disconnected capabilities were removed. Transportation, stays, events and references appear when relevant, populated or explicitly opened through More trip planning options. Empty workspaces offer an action instead of connection-state cards.

Comparison presentation requires two valid, required-price-complete options in the same currency. The unchanged comparison engine still decides which individual results are usable; unresolved lenses are omitted. One actionable prompt replaces repeated insufficient-data cards. Missing required costs remain missing, not free.

Source, freshness, coverage, event origin, retrieval timestamps and policy details remain available in native collapsed disclosures. EIA retains its checked-in reference, source and estimate insertion behavior. NWS remains explicit current-location opt-in. Events remain user records rather than live ticket inventory. Booking links render only for existing runtime-trusted eligible actions; relevant existing tools and checklists remain useful without provider links. Commission-neutral selection and opt-in browser-local privacy controls remain intact.

The emergency plan remains immediately accessible through a calmer safety call to action. All intake fields, funding/dropout/cancellation calculations, schema V3, quote/event validation and save/load/import/export remain intact. Core trip, transport/lodging, event and revenue intelligence files are unchanged. Google verification file, canonical, sitemap, robots and the single Travelpayouts Drive loader are preserved. No services, images, providers or paid costs were added. Owner cost introduced: $0.

Validation: 777 dependency-free assertions; 16 Google verification installer tests; 105 homepage browser checks; 67 organic browser checks; 196 planner browser checks at 360/390/412/1440px cover real intake, comparisons and incomplete/mixed-currency gates, progressive visibility, collapsed source notes, funding/dropout math, schema V3 persistence, event CRUD and emergency access. Browser tests block all external requests and use explicitly synthetic fixtures. Static/site and secret-pattern validation, 13-target Google readiness, organic validation (16 valid opportunities, zero blockers), syntax and diff whitespace checks pass. CI runs the new planner regressions alongside all existing suites.

Limitations: this is presentation cleanup, not new provider access. No live fares, ticket inventory or availability are claimed. Google account ownership/indexing and actual booking/revenue outcomes remain external facts, not inferred from the redesign.
