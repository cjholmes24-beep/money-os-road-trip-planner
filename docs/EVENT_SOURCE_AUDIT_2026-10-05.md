# Event source audit — Events Intelligence Core V1

Work-order filename retained as requested. Actual research date: **2026-10-06**. This is a focused six-path audit, not nationwide coverage. Read-only official documentation requests were used; no events were fabricated, no calendar was scraped, no key/account was created, and no source was connected.

An initial network-policy denial was resolved by allowing the specific documentation hosts. NPS, Google developer documentation, and RFC Editor then returned HTTP 200. NYC Parks, Chicago, and Visit Orlando still returned HTTP 403; that is an observed access limitation, not proof their sources require payment or authentication. Unknown metadata is represented by null/empty arrays in the registry, never a guessed $0 API price.

## National Park Service Events API

- Official URL: https://www.nps.gov/subjects/developer/get-started.htm
- Documentation: https://www.nps.gov/subjects/developer/api-documentation.htm
- Authority: OFFICIAL_GOVERNMENT
- Cost: $0 API-key access explicitly documented
- Authentication: API key in X-Api-Key header or query; no key requested for V1.
- Secret required: True; account approval: UNKNOWN
- Browser safe: False
- Formats: JSON
- Capabilities: park events, date filters, location filters, event types, recurrence metadata
- Cadence: Publisher cadence not specified; proposed future adapter rechecks before attendance.
- Terms limits: Review API terms, limits, and per-asset rights before an adapter; API access does not license unrelated images.
- Connection status: **BLOCKED_BY_SECRET**
- Evidence/limits: Get Started explicitly calls API-key signup free. Swagger /events documents dateStart/dateEnd and expandRecurring (default false). Documentation verified 2026-10-06; no API event request made; no secret provisioned.

## NYC Parks official events calendar

- Official URL: https://www.nycgovparks.org/events
- Documentation: UNKNOWN
- Authority: OFFICIAL_PARKS_RECREATION
- Cost: UNKNOWN; no commercial/API zero-cost claim
- Authentication: UNKNOWN
- Secret required: UNKNOWN; account approval: UNKNOWN
- Browser safe: UNKNOWN; not CORS-tested
- Formats: UNKNOWN
- Capabilities: UNKNOWN
- Cadence: UNKNOWN
- Terms limits: No scraping or feed reuse authorized by this audit.
- Connection status: **BLOCKED_BY_ACCESS**
- Evidence/limits: Read-only calendar request returned HTTP 403 on 2026-10-06. Format, API price, authentication, capabilities, and CORS could not be verified.

## Chicago Department of Cultural Affairs and Special Events

- Official URL: https://www.chicago.gov/city/en/depts/dca/supp_info/events.html
- Documentation: UNKNOWN
- Authority: OFFICIAL_CITY_GOVERNMENT
- Cost: UNKNOWN; no commercial/API zero-cost claim
- Authentication: UNKNOWN
- Secret required: UNKNOWN; account approval: UNKNOWN
- Browser safe: UNKNOWN; not CORS-tested
- Formats: UNKNOWN
- Capabilities: UNKNOWN
- Cadence: UNKNOWN
- Terms limits: Public calendar identity does not authorize scraping or bulk republication.
- Connection status: **BLOCKED_BY_ACCESS**
- Evidence/limits: Read-only page request returned HTTP 403 on 2026-10-06. No structured endpoint, commercial reuse permission, cadence, or zero-cost API verified.

## Visit Orlando tourism events calendar

- Official URL: https://www.visitorlando.com/events/
- Documentation: UNKNOWN
- Authority: OFFICIAL_TOURISM_ORGANIZATION
- Cost: UNKNOWN; no commercial/API zero-cost claim
- Authentication: UNKNOWN
- Secret required: UNKNOWN; account approval: UNKNOWN
- Browser safe: UNKNOWN; not CORS-tested
- Formats: UNKNOWN
- Capabilities: UNKNOWN
- Cadence: UNKNOWN
- Terms limits: Directory presence is not organizer verification; no scraping authorized.
- Connection status: **BLOCKED_BY_ACCESS**
- Evidence/limits: Read-only page request returned HTTP 403 on 2026-10-06. Feed licensing, price, and browser/CORS support remain unknown.

## Organizer-published iCalendar feed path (standard only)

- Official URL: https://www.rfc-editor.org/rfc/rfc5545
- Documentation: https://www.rfc-editor.org/rfc/rfc5545
- Authority: OFFICIAL_ORGANIZER_IF_FEED_OWNERSHIP_VERIFIED
- Cost: UNKNOWN; no commercial/API zero-cost claim
- Authentication: Feed-specific; no organizer feed selected.
- Secret required: UNKNOWN; account approval: UNKNOWN
- Browser safe: UNKNOWN; not CORS-tested
- Formats: ICS
- Capabilities: VEVENT, DTSTART/DTEND, TZID, RRULE, UID, STATUS
- Cadence: Feed-specific; recheck near attendance. No universal TTL.
- Terms limits: RFC defines a format, not a license to ingest any calendar. Require organizer-owned HTTPS feed, explicit reuse rights, bounded recurrence, and verified CORS before a browser adapter.
- Connection status: **RESEARCH_ONLY**
- Evidence/limits: RFC 5545 retrieved 2026-10-06. No specific feed, organizer account, cost, license, or CORS tested. ICS end is exclusive and must be adapted to the core inclusive all-day end; never copy it unchanged.

## Organizer-owned Google Calendar API path

- Official URL: https://developers.google.com/calendar/api/guides/overview
- Documentation: https://developers.google.com/calendar/api/guides/quota
- Authority: OFFICIAL_ORGANIZER_IF_CALENDAR_OWNERSHIP_VERIFIED
- Cost: UNKNOWN; no commercial/API zero-cost claim
- Authentication: Google Cloud project credentials and calendar-specific authorization; OAuth scopes documented separately.
- Secret required: True; account approval: True
- Browser safe: False
- Formats: JSON
- Capabilities: calendar events, recurrence, start/end, calendar access controls
- Cadence: Calendar-specific; API quota and change lifecycle apply.
- Terms limits: Not Google Events scraping. Official quota documentation states standard usage has no additional cost but planned excess-quota charges later in 2026. Strict no-charge configuration and organizer permission would need separate review.
- Connection status: **NOT_SUITABLE**
- Evidence/limits: Overview, auth guide, and quota guide retrieved 2026-10-06. Not selected under the $0/no-charge V1 constraint; no Cloud project or billing account created.

## Documentation evidence and decisions

NPS [Get Started](https://www.nps.gov/subjects/developer/get-started.htm) says “To access that data, you need an API key. The process is free and easy.” Its [official Swagger definition](https://www.nps.gov/subjects/developer/customcf/swagger.json?03142019) documents `/events`, JSON, geographic/date/type/tag filters, and `expandRecurring` defaulting to false. The [FAQ](https://www.nps.gov/subjects/developer/faqs.htm) describes current-day event queries. This establishes a promising free official path, not a configured credential or completed adapter. No secret is needed to use this V1 workspace, so none was requested.

Google's [quota guide](https://developers.google.com/calendar/api/guides/quota) currently states standard use has no additional cost and excess quota charges are planned later in 2026. That is unsuitable for an unconditional no-charge integration. Its [authorization guide](https://developers.google.com/calendar/api/guides/auth) also requires deliberate scope/consent choices. A public calendar or creator account is not permission to aggregate every event.

[RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) verifies recurrence/time/UID semantics only. It is not an event provider, reuse permission, or proof that an organizer feed is free. A later adapter must explicitly handle ICS exclusive DTEND, TZID, bounded recurrence, source freshness, publisher terms, and feed ownership.

Ticketmaster, Eventbrite, Meetup, Google Events, Facebook, and Instagram are not connected or scraped. No event affiliate relationship is introduced. Live nationwide data, radius search, vendor applications, and ticket inventory remain outside this brick.
