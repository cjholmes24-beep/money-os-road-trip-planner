# Transportation + Lodging Source Audit — 2026-10-03 work order

Research checked: 2026-10-04 UTC. Owner cost introduced: **$0**. Capability claims below rely on provider-owned or official-standard documentation. A public documentation page does not by itself grant account approval, redistribution rights, an affiliate relationship, or permission to expose credentials in browser code.

## Decision summary

Connected now: the existing EIA weekly gasoline snapshot and existing Travelpayouts Drive installation. Added now: a provider-neutral GTFS Schedule normalization foundation, but **no agency feed is represented as nationally live**. No safe live airfare, rental-car, lodging, intercity bus/rail inventory, taxi/rideshare, shuttle, or transfer source was connected. Those categories remain `PROVIDER ACCESS REQUIRED`, `NOT CONNECTED`, or `UNKNOWN`.

## Audited sources

### U.S. Energy Information Administration weekly gasoline
- **Category:** driving fuel reference
- **Official documentation URL:** https://www.eia.gov/opendata/documentation.php
- **Authority type:** official U.S. government / source of truth for the published series
- **Cost:** $0
- **Authentication required?** No for the PET bulk download already used
- **Account approval required?** No
- **Server-side secret required?** No
- **Safe for static browser?** The checked-in snapshot is safe; refresh remains GitHub Actions/Python
- **CORS / technical limitations:** weekly regional/national average, not route-aware or station-specific
- **Data provided:** dated retail gasoline reference averages
- **Price data?** Yes, reference only
- **Availability / schedule / policy data?** No / weekly period / no
- **Affiliate relationship?** None
- **Terms / usage limitations:** preserve source, period, geography, and limitation; never call it an actual pump quote
- **Refresh expectation:** weekly
- **Status:** `CONNECTED`

### General Transit Feed Specification (GTFS Schedule)
- **Category:** public transit schedules
- **Official documentation URL:** https://gtfs.org/documentation/schedule/reference/
- **Authority type:** open standard; each publishing transit agency remains authoritative for its feed
- **Cost:** $0 standard; agency feeds vary
- **Authentication / account approval / server secret:** standard requires none; individual feeds may differ
- **Safe for static browser?** Format parser is safe; a feed is only safe after agency URL, license/terms, size, CORS, and freshness review
- **CORS / technical limitations:** ZIP/CSV ingestion and cross-origin access vary; large feeds are unsuitable for bundling nationally
- **Data provided:** agencies, routes, stops, trips, service dates, scheduled times; fares are optional
- **Price / availability / schedule / policy?** Optional fare / no inventory / yes / no
- **Affiliate relationship?** None
- **Terms / usage limitations:** GTFS is a format, not blanket permission for every agency feed
- **Refresh expectation:** feed-specific; official best practices call for current/upcoming service
- **Status:** `SAFE_TO_CONNECT_NOW` (adapter foundation only)

### GTFS Realtime
- **Category:** transit trip updates, service alerts, vehicle positions
- **Official documentation URL:** https://gtfs.org/documentation/realtime/reference/
- **Authority type:** open standard; agency feed is authoritative
- **Cost:** $0 standard; feed access varies
- **Authentication / approval / secret:** agency-specific
- **Safe for static browser?** Not universally; Protocol Buffers support and feed CORS/access vary
- **CORS / technical limitations:** binary Protocol Buffers; must pair correctly with GTFS Schedule and isolate failures
- **Data provided:** trip updates, alerts, vehicle positions
- **Price / availability / schedule / policy?** No / operational status only / updates / no
- **Affiliate relationship?** None
- **Terms / refresh:** agency-specific and short-lived
- **Status:** `RESEARCH_ONLY`

### Travelpayouts Drive
- **Category:** affiliate routing surface
- **Official documentation URL:** https://support.travelpayouts.com/hc/en-us/articles/212246627-For-developers-and-travel-startups
- **Authority type:** affiliate / booking relationship, **not a source of truth for unrelated facts**
- **Cost:** $0
- **Authentication / approval:** existing site loader and existing relationship only
- **Server-side secret required?** No secret is present in the current loader
- **Safe for static browser?** Existing provider loader is already installed
- **Data provided:** provider-managed monetization/link behavior, not normalized factual inventory supplied to this engine
- **Price / availability / schedule / policy?** Not consumed by Suitcase Brain
- **Affiliate relationship?** Existing Drive only
- **Terms / usage limitations:** does not prove approval for individual programs or direct links
- **Refresh expectation:** provider-managed
- **Status:** `CONNECTED`

### Travelpayouts Data API and partner-links API
- **Category:** cached flight trend data and affiliate link creation
- **Official documentation URL:** https://travelpayouts.github.io/slate/ and https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links
- **Authority type:** affiliate data/provider tool
- **Cost:** $0 access may exist after registration/program connection
- **Authentication / account approval:** token required; program access may be required
- **Server-side secret required?** Yes for this public static site's security boundary
- **Safe for static browser?** No
- **CORS / technical limitations:** token/header, rate limits, cached/expiring trend data; not equivalent to a current bookable quote
- **Data provided:** trends/routes and partner-link generation depending on endpoint/access
- **Price / availability / schedule / policy?** Cached prices / no guaranteed availability / limited / no
- **Affiliate relationship?** Not verified beyond Drive
- **Refresh expectation:** endpoint cache/expiration; official help recommends caching
- **Status:** `BLOCKED_BY_SECRET`

### Amadeus Self-Service
- **Category:** flight and hotel APIs
- **Official documentation URL:** https://developers.amadeus.com/self-service
- **Authority type:** distribution provider
- **Cost:** test quota may be $0; production and commercial conditions require review
- **Authentication / approval:** OAuth client credentials and account
- **Server-side secret required?** Yes
- **Safe for static browser?** No
- **CORS / technical limitations:** credential exchange must not happen in public JavaScript
- **Data provided:** offers, schedules and selected hotel data according to product
- **Price / availability / schedule / policy?** Yes depending on endpoint; offer-specific limitations apply
- **Affiliate relationship?** None verified
- **Terms / refresh:** request-time; production terms apply
- **Status:** `BLOCKED_BY_SECRET`

### Booking.com Demand API
- **Category:** accommodation inventory
- **Official documentation URL:** https://developers.booking.com/demand/docs/open-api/demand-api/
- **Authority type:** booking provider
- **Cost:** no paid service added, but eligible affiliate access is required
- **Authentication / approval / secret:** partner credentials required; access not verified
- **Safe for static browser?** No
- **CORS / technical limitations:** authenticated partner integration
- **Data provided:** accommodations, availability, prices and order details according to approved access
- **Price / availability / schedule / policy?** Yes / yes / no / offer data may contain cancellation terms
- **Affiliate relationship?** Not verified
- **Terms / refresh:** live request under provider terms
- **Status:** `BLOCKED_BY_PROVIDER_ACCESS`

### Expedia Group Rapid
- **Category:** lodging inventory
- **Official documentation URL:** https://developers.expediagroup.com/rapid/lodging
- **Authority type:** booking provider
- **Cost:** no paid service added; partner onboarding is required
- **Authentication / approval / secret:** key/signature and approved partner access
- **Safe for static browser?** No
- **CORS / technical limitations:** signed requests and commercial/launch requirements
- **Data provided:** property content, shopping/availability, rates, fees, policies where supplied
- **Price / availability / schedule / policy?** Yes / yes / no / yes where supplied
- **Affiliate relationship?** Not verified
- **Refresh:** request-time
- **Status:** `BLOCKED_BY_PROVIDER_ACCESS`

### U.S. DOT Aviation Consumer Protection
- **Category:** airline consumer rules and baggage guidance
- **Official documentation URL:** https://www.transportation.gov/airconsumer/baggage-fees
- **Authority type:** official government regulatory guidance
- **Cost / auth / approval / secret:** $0 / none / none / none
- **Safe for static browser?** Yes as a cited policy resource
- **CORS / technical limitations:** not a normalized itinerary-specific fee API
- **Data provided:** regulatory guidance and carrier fee-resource context
- **Price / availability / schedule / policy?** No quote / no / no / regulatory policy only
- **Affiliate relationship?** None
- **Refresh:** policy-change review
- **Status:** `RESEARCH_ONLY`

### Direct carriers, rental firms, bus/rail operators, hotel brands, rideshare/taxi, shuttle and transfer providers
- **Category:** inventory, schedules, fees and provider policies
- **Official documentation URL:** provider-specific; none is generalized as one national feed
- **Authority type:** provider source of truth for its own published facts
- **Cost/auth/approval/secret/browser/CORS:** provider-specific
- **Data provided:** potentially schedules, quotes, fees and policies
- **Price / availability / schedule / policy:** only when explicitly published for the exact product/itinerary
- **Affiliate relationship:** none assumed
- **Terms / refresh:** each provider requires independent review; public webpages are not blanket scraping permission
- **Status:** `RESEARCH_ONLY`; live inventory remains `NOT CONNECTED`

## Rejected shortcuts

Google Travel/Hotels, Booking.com pages, Airbnb, Expedia pages, airline pages, and unofficial proxy/scraping services were not scraped. Old blog posts were not treated as proof of a current API. No generic provider URL was converted into a purported affiliate URL. No secret-bearing API was placed in client code.
