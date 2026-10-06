# Suitcase Brain — Current Handoff

Last updated: 2026-10-06
Canonical repository: `cjholmes24-beep/money-os-road-trip-planner`
Last verified product-code baseline before handoff-document commits: `0d97c38ec08aa079ab1dd8e305d4b54e92c6c062`

**Before every new work order, read GitHub `main` directly and use the current HEAD SHA. Do not assume the SHA written in this handoff is still the repository HEAD, because documentation/maintenance commits may legitimately advance `main`.**

## Purpose of this file

This is the durable thread-to-thread handoff. A new ChatGPT/Codex session should read this file before proposing new work so it can continue from the current verified state without repeating finished bricks or losing doctrine.

## Owner operating doctrine

- Owner cost remains **$0 unless explicitly approved**.
- Earn first → reinvest second → scale third.
- Do not add paid APIs, hosting, domains, ads, databases, subscriptions, inventory, deposits, or speculative spend without explicit approval.
- Never fabricate prices, availability, reviews, events, safety facts, discounts, provider rules, or revenue.
- Recommendation quality and traveler safety outrank affiliate commission.
- Do not collect customer travel payments in the current phase.
- Direct affiliate URLs must be account-verified before being hard-coded.
- Travelpayouts Drive is the currently approved monetization surface.
- Public/product logic can be open; proprietary Money OS decision logic should remain private where disclosure is unnecessary.

## Working brand

Consumer-facing working name: **Suitcase Brain**
Positioning: travel intelligence powered by Money OS.

Suitcase Brain is a working brand, not a completed trademark clearance. A preliminary collision review found no obvious exact-match travel-planning software brand, but legal/common-law/state/international clearance has not been completed.

## Current production state

The public site is deployed on GitHub Pages and currently includes:

- Suitcase Brain homepage positioning
- Plan My Trip Travel Intelligence V1
- nine-stage mobile-first trip intake
- versioned canonical browser-local trip record, now schema V3 with V1→V2→V3 and V2→V3 migration
- provider-neutral transportation and lodging option models
- mobile transportation/lodging quote workspaces with add/edit/remove/compare/save/export/import
- mode-aware transportation known-cost completeness
- lodging known-cost completeness with mandatory-vs-optional separation
- mixed-currency comparison fail-closed behavior until FX is connected
- cancellation exposure and policy-completeness handling for transport/lodging quotes
- runtime-only verified booking-link trust gate
- GTFS Schedule normalization foundation without claiming nationwide/live feed coverage
- provider capability registry separating source authority, access, secrets, and affiliate relationship
- Events Intelligence Core V1 with canonical Event + Occurrence models
- user-entered event add/edit/remove workspace
- event date/category/location/season/price/age/family/status filters
- explainable trip-date event matching
- seasonal event tags
- event price truth and source/freshness handling
- imported event snapshots downgraded from runtime trust
- focused event-source audit/registry; no live event feed connected yet
- traveler commitment/funding records
- group funding-gap logic
- one-person and two-person dropout scenarios
- unpaid-traveler scenario
- reservation/cancellation exposure records
- “What if we cancel today?” output
- 27-category hidden-fee auditor
- explainable resilience indicators
- emergency “I need to leave this trip” mode
- local save/load/start-over
- validated JSON export/import
- reusable booking-opportunity placeholders
- source/freshness contract and reusable truth states
- EIA official weekly gasoline reference
- scheduled keyless EIA fuel refresh
- opt-in National Weather Service current-location forecast
- Travelpayouts Drive
- Revenue Activation + Demand Capture V1
- ten-category monetization-opportunity registry with no fabricated direct affiliate URLs
- intent-matched next-action checklists on existing high-intent travel tools and Plan My Trip
- opt-in browser-local demand telemetry with broad non-sensitive bands only
- revenue dashboard separating ATTENTION, INTENT, and MONEY
- redacted provider-report import path that remains USER_IMPORTED — UNVERIFIED
- runtime-only provider-action and provider-report trust gates for future verified adapters
- proof milestones from qualified intent through cleared revenue without inferring money from clicks
- visible affiliate disclosure
- sitemap/canonical metadata/robots
- IndexNow automated distribution
- dependency-free test harness
- GitHub Actions Suitcase Brain validation gate

## Current truth/source status

SOURCE-BACKED:
- U.S. Energy Information Administration weekly gasoline reference
- National Weather Service on-demand current-location forecast
- Travelpayouts Drive as an approved monetization surface only

SOURCE/USER-INPUT READY BUT NOT LIVE-INVENTORY CONNECTED:
- events: user-entered Event/Occurrence intelligence, filtering, trip-date matching, seasonal tags; no nationwide live feed
- event source adapter architecture: NPS identified as a future free official path but currently blocked by private API key requirement
- transportation quote intelligence: user-entered + EIA-derived driving fuel reference
- lodging quote intelligence: user-entered
- GTFS Schedule adapter foundation: no agency feed connected as nationwide/live inventory
- direct flight/rental/bus/rail/transfer/lodging inventory remains provider-access dependent
- provider cancellation facts remain unconnected unless user-entered or future trusted adapter supplies them
- monetization opportunity registry and revenue funnel are connected locally, but account-specific direct provider URLs remain unverified
- Travelpayouts reporting APIs are not connected; browser-local imports cannot become verified money proof

UI-READY BUT NOT LIVE-CONNECTED:
- food
- activities
- culture/community
- nightlife/age-fit
- safety
- discounts
- pets/accessibility
- business records
- provider cancellation facts
- booking opportunities

Do not display simulated live data in these modules.

## Latest completed engineering cycle

Codex PR #13 built Revenue Activation + Demand Capture V1 from main `a579e686a8617a09b98a2dc4a57896f08bdffae3`.

Codex delivered:
- reusable revenue/demand intelligence module
- explicit local funnel states from visitor activity through provider click
- provider-report money states kept separate from local click events
- ten-category monetization opportunity registry
- high-intent next-action checklists on existing travel tools
- Plan My Trip NEXT USEFUL ACTIONS
- opt-in browser-local telemetry with privacy allowlists
- local funnel history view/clear/export
- provider-report import/clear/export
- revenue dashboard separating ATTENTION, INTENT, and MONEY
- proof milestones through cleared revenue
- Travelpayouts revenue-activation audit
- expanded tests, static validation, and CI

Codex candidate reported:
- 424 dependency-free assertions passed
- 27 Chromium mobile browser checks passed
- no direct affiliate URL or provider-report API connected
- owner cost $0

Independent cleanup found and repaired:
- unknown provider-action surface values could silently fall through to VERIFIED_DIRECT
- money state counts combined USER_IMPORTED claims with future runtime-verified provider records
- the dashboard lacked a safe runtime registration hook for future verified provider reports
- cleared report chronology did not explicitly reject clearing before booking
- monetization registry validation did not reject duplicate ids or malformed routing/documentation metadata

Cleanup repairs:
- provider-action surface values now fail closed
- verified and imported money state counts are separated
- future provider adapters may register only runtime-trusted report objects
- cleared timestamps cannot precede booking dates
- registry ids/planning paths/documentation URLs receive stricter validation
- cleanup regressions added

PR #13 merged after latest-head CI success.

Verified product main:
`0d97c38ec08aa079ab1dd8e305d4b54e92c6c062`

Post-merge verification:
- Suitcase Brain checks: SUCCESS
- IndexNow notification: SUCCESS
- GitHub Pages deployment: SUCCESS
- owner cost introduced: $0
- no paid infrastructure, direct affiliate URL, provider reporting connection, or customer-payment custody introduced
- verified CLEARED REVENUE remains $0 until trusted provider evidence exists
- Travelpayouts official docs confirm Drive/content analytics can report visits, clicks, bookings and earnings, while private statistics/payment APIs require an API token; those private APIs remain unconnected

## Standard build workflow

This workflow is mandatory for large future bricks:

1. ChatGPT inspects current main and defines the next large coherent work package.
2. ChatGPT provides the owner a complete copy/paste Codex work order with exact starting SHA.
3. Codex creates a task branch, performs the job, tests it, opens a PR, and DOES NOT merge.
4. Owner returns the Codex completion report.
5. ChatGPT audits the actual GitHub PR/code, not only the report.
6. ChatGPT performs cleanup: missing requirements, bad assumptions, math/data errors, security/privacy issues, regressions, weak tests, broken wiring.
7. ChatGPT strengthens tests/CI as needed.
8. CI must pass before merge.
9. ChatGPT merges only after verification.
10. ChatGPT verifies post-merge deployment/distribution and updates this handoff plus the build ledger.
11. Repeat.

Codex is the heavy construction crew.
ChatGPT is architecture, inspection, cleanup, final merge gate, and handoff keeper.
Owner controls priorities and green-lights the sequence.

## Current next engineering brick

Primary next brick:
**24/7 LEAD + OPPORTUNITY ENGINE V1**

This brick should convert the newly built local demand vocabulary and existing search/distribution foundation into an always-on, zero-cost opportunity loop without fake traffic or paid acquisition.

Goals:
- build a deterministic demand/opportunity queue using real site/search/provider signals that are actually available
- automate scheduled inspection of search/distribution health, content freshness, seasonal/event windows, monetizable-category coverage, and pages with intent but weak/no provider-routing capability
- produce prioritized opportunity records for human/Codex follow-up instead of blindly auto-publishing
- distinguish content opportunity, provider-routing opportunity, source-freshness opportunity, and revenue-proof opportunity
- use only lawful $0 data paths and GitHub Actions/static artifacts where appropriate
- preserve privacy and avoid fingerprinting, cold outreach, spam, fake traffic, or bot clicks
- preserve recommendation neutrality; expected commission must not override traveler fit
- keep public Pages static and secrets out of browser code
- prepare authenticated Travelpayouts reporting integration architecture without exposing tokens or claiming data not actually retrieved
- owner cost remains $0

Hard operating loop:
OBSERVE → QUALIFY → PRIORITIZE → BUILD/REFRESH → DISTRIBUTE → MEASURE → REPEAT

Do not call this 24/7 earning until real recurring provider-reported cleared revenue is proven.

Following large bricks:
1. Destination Discovery + Itinerary Brain
2. Food / Culture / Vibe / Age-Fit / Local Discovery
3. Vendor / Exhibitor Opportunity Intelligence
4. Safety / Quality / Reviews
5. Group / Reunion / Business logistics expansion
6. National search/AI authority expansion
7. continued conversion/revenue optimization

## Revenue state

The product is revenue-capable through approved affiliate infrastructure and now has Revenue Activation + Demand Capture V1, but no verified cleared revenue has been proven. Browser-local clicks or imported claims do not count as earned money.

Canonical revenue proof sequence:
FIRST ORGANIC VISITOR → FIRST AFFILIATE CLICK → FIRST BOOKING → FIRST CONFIRMED COMMISSION → FIRST CLEARED DOLLAR

Affiliate money states:
ATTRIBUTED → PENDING → PROVIDER_APPROVED → CLEARED

Only cleared provider-paid revenue counts as earned Money OS revenue.

## Handoff maintenance rule

After every meaningful build, cleanup, merge, provider integration, revenue milestone, deployment change, architecture decision, failure, or repair:

- update this file with the last verified product baseline, current capability state, and immediate next brick; always resolve the actual current main SHA live before issuing a work order
- append the event to `docs/BUILD_LEDGER.md`
- update `docs/SUITCASE_BRAIN_STATUS.md` when capability status changes
- record failures and repairs, not just successes
- never erase prior history merely because an issue was fixed

This repository documentation is the canonical operational handoff for Suitcase Brain.
