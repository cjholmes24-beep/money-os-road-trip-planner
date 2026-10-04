# Suitcase Brain — Current Handoff

Last updated: 2026-10-03
Canonical repository: `cjholmes24-beep/money-os-road-trip-planner`
Last verified product-code baseline before handoff-document commits: `3e8ee86876e29ec6c0daaa0f7f620ed0f8e57380`

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
- versioned canonical browser-local trip record, now schema V2 with V1 migration
- provider-neutral transportation and lodging option models
- mobile transportation/lodging quote workspaces with add/edit/remove/compare/save/export/import
- mode-aware transportation known-cost completeness
- lodging known-cost completeness with mandatory-vs-optional separation
- mixed-currency comparison fail-closed behavior until FX is connected
- cancellation exposure and policy-completeness handling for transport/lodging quotes
- runtime-only verified booking-link trust gate
- GTFS Schedule normalization foundation without claiming nationwide/live feed coverage
- provider capability registry separating source authority, access, secrets, and affiliate relationship
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
- transportation quote intelligence: user-entered + EIA-derived driving fuel reference
- lodging quote intelligence: user-entered
- GTFS Schedule adapter foundation: no agency feed connected as nationwide/live inventory
- direct flight/rental/bus/rail/transfer/lodging inventory remains provider-access dependent
- provider cancellation facts remain unconnected unless user-entered or future trusted adapter supplies them

UI-READY BUT NOT LIVE-CONNECTED:
- food
- events
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

Codex PR #9 built Transportation + Lodging Intelligence V1 from main `b17db06c12c1dbb3b4833a94ec001f10883ea527`.

Codex delivered:
- trip schema V2 with V1 migration
- canonical transport/lodging models and per-component truth states
- known-cost completeness and comparison lenses
- user-entered transportation/lodging quote workspaces
- cancellation exposure
- driving fuel math
- GTFS Schedule normalization foundation
- provider capability registry and source audit
- provider-failure isolation
- booking opportunity/URL architecture
- expanded tests and CI coverage

Independent cleanup found and repaired:
- universal transport fee assumptions that made legitimate comparisons incomplete
- combined UI fields that left canonical cost components silently unknown
- null/blank numeric coercion to zero
- known policies with missing cancellation amounts appearing zero-risk
- cross-currency comparisons without FX
- shallow import/load validation of option bodies
- forged/persisted VERIFIED booking-link trust
- persisted provider/source facts retaining runtime verification after reload/import
- user ability to self-declare provider PUBLISHED/VERIFIED policy status
- EIA reference provenance that could be claimed without loading official data
- EIA USD-per-gallon being usable under non-USD trip currency without FX
- one-option “comparison winners”
- synchronous provider failure isolation
- GTFS browser-safety and blocked-provider $0-cost claims that were too broad
- conditional/optional costs incorrectly blocking required-cost completeness

PR #9 merged after latest-head CI success.

Verified product main:
`3e8ee86876e29ec6c0daaa0f7f620ed0f8e57380`

Post-merge verified:
- Suitcase Brain checks: SUCCESS
- GitHub Pages deployment: SUCCESS
- IndexNow notification: SUCCESS
- owner cost introduced: $0
- no new live airfare/lodging/rental inventory was falsely claimed
- browser automation remained unavailable; no browser smoke run is claimed

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
**EVENTS + FESTIVALS + EXPERIENCES + SEASONAL CALENDAR ENGINE**

Goals:
- build one event graph that can serve travelers and vendors/businesses
- prioritize official organizers, tourism/public agencies, and lawful $0 sources
- normalize event dates, recurrence, venue/location, age rules, price/fee truth, organizer/application links, freshness, and cancellation/change state
- support concerts, festivals, conventions, seminars, holiday/seasonal events, culture, food, outdoor/adventure, nightlife/theme nights, family events, and other legitimate experiences
- support “What can we do right now?” architecture without inventing open-now status
- support ATTEND THIS EVENT vs SELL / VEND / EXHIBIT HERE
- model vendor deadlines, fees, requirements, permits/insurance/electric/water/load-in when officially published
- preserve provider neutrality and $0 owner cost
- do not mass-generate thin SEO pages
- no unauthorized scraping

Following large bricks, in current intended order:
1. Destination Discovery + Itinerary Brain
2. Food / Culture / Vibe / Age-Fit / Local Discovery
3. Safety / Quality / Reviews
4. Group / Reunion / Business / Vendor logistics expansion
5. National automation + search/AI authority
6. 24/7 Lead & Opportunity Engine + conversion/revenue optimization

## Revenue state

The product is revenue-capable through approved affiliate infrastructure, but no unverified claim of cleared revenue should be made.

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
