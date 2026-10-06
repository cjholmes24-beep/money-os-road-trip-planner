# Money OS Travel Intelligence Doctrine

Status: canonical product doctrine
Working consumer engine name: **Suitcase Brain**
Owner-cost rule: **$0 unless the owner explicitly approves spend**
Economic rule: **Earn first → reinvest second → scale third**

## Mission

Suitcase Brain is the public travel, local-discovery, event, group-logistics, and vendor-opportunity intelligence layer powered by Money OS.

The product does not begin with "search hotels." It begins with the traveler or business need:

> What are you trying to do, who is involved, when are you free, and what can you afford?

The engine then helps the user discover, plan, price, compare, save, book, navigate, adapt, recover, and reconcile.

## Core lifecycle

DISCOVER → PLAN → PRICE → COMPARE → SAVE → FUND → COMMIT → BOOK → TRAVEL → EXPERIENCE → ADAPT → RECOVER → RETURN → RECONCILE

Revenue may occur only where a legitimate provider relationship exists. Recommendation quality comes before commission.

## Hard rules

1. Never fabricate a live price, fee, event, review, safety fact, discount, availability state, eligibility rule, or commission.
2. Every externally sourced fact must carry source, retrieval time, geography, freshness, and fact type: LIVE, PUBLISHED, RECENT, WEEKLY GOVERNMENT DATA, HISTORICAL/TYPICAL, USER-ENTERED, COMMUNITY-REPORTED, or UNKNOWN.
3. Public recommendations must not rank an affiliate partner above a better-fitting non-partner merely because the affiliate pays.
4. Money OS must not count attributed or pending affiliate revenue as cleared money.
5. No paid ads, paid data, paid APIs, paid hosting, domains, subscriptions, inventory, deposits, or speculative spend without explicit owner approval.
6. Prefer official/open/government/provider sources and approved affiliate feeds. Do not use unauthorized scraping.
7. Sensitive identity or culture preferences are opt-in. Never infer race, ethnicity, religion, sexual orientation, disability, or similar characteristics.
8. Safety guidance must use evidence and dates; do not stigmatize whole neighborhoods or repeat unsupported accusations.
9. Alcohol or cannabis travel information may cover lawful rules and planning, but the system must not help users evade law enforcement or illegal-market restrictions.
10. When travel goes wrong, traveler safety and loss minimization outrank monetization.

## Canonical trip intake

A trip record may contain:

- origin and destination, including "find me somewhere"
- fixed or flexible dates
- total budget and contingency target
- number of travelers, ages, and group composition
- trip purpose: solo, couple, friends, family, reunion, business, event, vendor, reset, culture, nightlife, adventure, learning, celebration, cruise, outdoors, other
- payment split and traveler funding/commitment state
- transportation preferences and limits
- lodging preferences and amenities
- culture/community interests
- food/cuisine interests
- activity/adventure interests
- nightlife/age-fit preferences
- pets/service-animal/accessibility needs
- business-trip/expense-recordkeeping mode
- loyalty/member/discount programs explicitly supplied by the user
- risk tolerance, walking tolerance, driving preference, and no-drive-after-drinking mode

## Intelligence modules

### Trip Intent Engine
Determines the purpose, group type, desired pace, vibe, budget posture, and experience goals.

### Destination Discovery Engine
Finds destinations when the user knows the experience but not the place. Compares fit, travel effort, seasonality, expected cost, and relevant events.

### Timing Engine
Handles departure/arrival windows, airport buffers, transit timing, rush-hour effects, event congestion, seasonality, and time-sensitive reservations.

### Transportation Engine
Compares driving, flights, rail, bus, public transit, taxi, rideshare, rental car, peer-to-peer vehicle rental where lawful/available, airport transfer, Sprinter/minibus/charter/party/tour bus, cruise-port transport, and group transport.

### Fuel/Parking/Tolls Engine
Uses current or recent fuel references, route fuel math, rental refueling strategy, tolls, parking rates, meter/app/QR requirements, and overnight/event parking.

### Lodging Intelligence
Hotels, apartments, cabins, resorts, hostels, and other lawful inventory. Compare price, total fees, location, amenities, parking, cancellation terms, accessibility, pet rules, quality and recent review evidence.

### Stay Quality Guard
Weights recent review evidence and recurring complaint categories such as cleanliness, pests, plumbing, odor, noise, room condition, parking, accessibility, service, and location accuracy. Report sourced evidence instead of defamatory conclusions.

### Food & Daily-Cost Intelligence
Airport food, groceries, restaurants, food trucks, cuisine, budget/midrange/upscale/luxury, coffee/water/snacks, cooking-at-lodging strategies, and realistic daily ranges.

### Culture, Community & Vibe Engine
Opt-in discovery for cultural history, locally owned businesses, Black-owned businesses when publicly self-identified or reliably documented, Caribbean/Jamaican, Latino, Asian and other cultural interests, LGBTQ-friendly spaces/events, religious or community interests, music scenes, and local heritage.

### Scene & Age-Fit Engine
Classifies venues by published rules and evidence-supported crowd tendencies: family, mixed-age, younger adult, mature, college-heavy, casual, dressy, upscale, lounge, bar, club, rooftop, beach, live music, etc. Never invent formal age restrictions.

### Events & Seasonal Calendar
Concerts, sports, festivals, food events, cultural events, fairs, parades, conventions, seminars, expos, holiday events, Halloween attractions, New Year's, Mardi Gras/Fat Tuesday, decade/theme nights, bingo, comedy, interactive entertainment, and recurring seasonal experiences.

### Adventure & Outdoors
Beaches, mountains, cabins, parks, hiking, camping, fishing, hunting-license/season information from official agencies, snorkeling, diving, sailing, jet skiing, parasailing, kayaking, rafting, skiing, ziplining, ATV/UTV, caves, scenic drives, horseback riding, airboat/alligator tours, helicopter tours and similar activities.

### Cruise Intelligence
Fare/cabin type, occupancy, taxes/port charges, gratuities, packages, Wi-Fi, specialty dining, excursions, port parking, pre/post-cruise hotel, transport and insurance.

### Social & Creator Discovery
May surface public creators and public travel content relevant to a destination/niche. Do not scrape private content or imply endorsement. Record platform, area, niche, freshness and why surfaced.

### Discounts & Eligibility
Finds documented military, veteran, senior, student, member/club, loyalty, employer/corporate, group, child/family and business discounts. Existence of a discount is not proof the user qualifies.

### Business Travel & Expense Records
Separates personal/business portions, stores business purpose and supporting records, and provides current official tax-recordkeeping guidance. Never guarantee deductibility.

### Pets & Accessibility
Pet fees/rules, service-animal rules kept separate from ordinary pets, accessible lodging/transport, mobility assistance, walking load, room/vehicle features, and provider documentation.

### Safety & Risk
Uses official alerts/public data and recent sourced traveler evidence. Evaluates lodging-area conditions, route concerns, parking exposure, weather, late-night mobility, crowd disruption and transportation backup. No police-evasion guidance.

### Group Funding & Commitment
Traveler states:
INVITED → ACCEPTED → DEPOSIT_PAID → FULL_SHARE_FUNDED → BOOKED → TRAVELING → COMPLETE

The engine must model unpaid travelers, dropout exposure, shared expenses, deposits and per-person changes if group size changes.

### Trip Resilience & Failure Modes
Model cancellation deadlines, refundability, rebooking/change fees, missed transport, extra nights, one or more travelers leaving early, medical/legal emergencies and group/relationship separation.

### Emergency Exit Mode
Prioritize safe transportation, available lodging, earliest reasonable route home, documents/belongings, cancellation recovery and official emergency resources. Safety outranks commission.

### Vendor Opportunity Engine
For lawful businesses seeking demand gatherings: event/festival/vendor application discovery, deadlines, organizer source, booth/vendor fee, requirements, permits, insurance, expected attendance when published, travel cost, lodging and break-even modeling.

### "What Can We Do Right Now?"
During-trip discovery based on current time, open status, budget, group, indoor/outdoor preference, distance and transportation. Must not claim a place is open without current evidence.

## Money model

Possible revenue lanes:
- flights
- accommodations
- rental vehicles
- transfers
- rail/bus
- cruises
- eSIM/data
- activities/tickets
- travel insurance
- disruption/compensation services
- future lawful service/B2B products only after compliance review

Affiliate revenue state:
ATTRIBUTED → PENDING → PROVIDER_APPROVED → CLEARED

Canceled/reversed bookings never count as cleared revenue.

## Distribution doctrine

Public information should be machine-readable and citeable by search and AI systems:
- canonical URLs
- sitemap
- structured data where accurate
- clear source/freshness labels
- original utility
- crawlable pages
- strong internal links
- IndexNow/search-engine submission when available at $0
- no mass-produced low-value pages

Target discovery surfaces include Google, Bing, Yahoo/Bing-powered discovery, ChatGPT Search, Claude web/search systems, Perplexity, Gemini/Google AI surfaces, and future answer engines where public crawling/indexing is permitted.

## Automation target

The owner should not manually maintain destination facts.

Target loop:
DISCOVER SOURCE → VERIFY → NORMALIZE → FRESHNESS SCORE → PUBLISH SAFE PUBLIC FACTS → INDEX/DISTRIBUTE → RECEIVE INTENT → BUILD PLAN → ROUTE ELIGIBLE BOOKING → ATTRIBUTE → RECONCILE → LEARN

Humans remain in control of business/legal decisions and any spend.

## Build order

1. Canonical intake and budget/group-risk model
2. Source/freshness data schema
3. Plan My Trip interface
4. Monetizable routing from verified providers
5. Search/AI indexing and funnel measurement
6. Weather + fuel + transport timing
7. lodging + hidden-fee + cancellation intelligence
8. events/seasonal calendar + things-to-do
9. food + culture + scene/age fit
10. reviews/quality + safety
11. group/reunion/business logistics
12. vendor opportunity engine
13. social/creator discovery
14. national automated refresh/coverage expansion

The product is not complete because a page exists. A module is green only when the intended data chain, UX, safety constraints, attribution, tests, and real-world behavior are verified.

## Transportation + lodging V1 decision boundary

Price completeness precedes price ordering. A partial price with unresolved mandatory costs cannot win a lowest-total lens. Comparisons remain separate and explainable: known cost, duration, unknown exposure, cancellation exposure, cash hold and explicit traveler fit. There is no universal best score, and commission/payout fields are forbidden inputs to traveler ordering.

Booking is a separate opportunity record. A provider relationship does not make the provider authoritative for unrelated facts, a click is not revenue, and only an HTTPS URL with `VERIFIED` link status can become a direct booking CTA. The current static product takes no customer payment, service fee, cancellation fee or booking fee.

## Events Intelligence Core V1 (pending PR review)

Schema V3 persists browser-local canonical events and explicit occurrences. The Plan My Trip event workspace supports add/edit/remove, local date/category/location/season/price/age/family/status filters, and explainable trip-date matches. Category does not imply age, cost, or family fit. Organizer status is independent of UPCOMING/IN_PROGRESS/PAST/DATE_UNKNOWN. Unknown prices stay null; complete required admission cost needs base and mandatory fees.

User-entered events cannot claim official runtime verification. Reload/import downgrades source-backed snapshots and candidate URLs require runtime trust to become official links. No live event feed, nationwide inventory, paid integration, affiliate event ranking, or vendor engine was connected. Source failures become UNAVAILABLE without replacing user records or breaking transport/lodging. See `docs/EVENT_INTELLIGENCE_ARCHITECTURE.md`, `docs/EVENT_SOURCE_AUDIT_2026-10-05.md`, and `data/event-source-registry.json`.

## Revenue Activation + Demand Capture V1 (task branch; pending review)

Existing high-intent tools and Plan My Trip now offer relevant comparison checklists with a reusable runtime-verified provider action gate. Drive and disclosures remain unchanged; no new direct affiliate URL or account approval is assumed. Optional local history is off by default and captures broad enumerated planning signals only, with view/clear/export at `/revenue-dashboard/`. It does not save destination text, exact budget/dates, identities, precise location, health, or payment data.

The dashboard separates ATTENTION, INTENT and MONEY. Clicks do not become bookings or revenue. Redacted provider-report JSON imports are labeled USER IMPORTED — UNVERIFIED and cannot unlock verified money milestones. With no live payout/report adapter, verified CLEARED REVENUE remains $0. The trip schema stays V3. No paid service, backend, customer payment, autonomous traffic, or national-trend claim was introduced. See `docs/REVENUE_ACTIVATION_ARCHITECTURE.md` and `docs/TRAVELPAYOUTS_REVENUE_ACTIVATION_AUDIT_2026-10-06.md`.
