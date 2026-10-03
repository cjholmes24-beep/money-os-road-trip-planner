# Source & Freshness Contract

Status: canonical
Owner-cost rule: $0 unless explicitly approved.

Suitcase Brain must never present a sourced fact without enough metadata to explain what it is, where it came from, and how fresh it is.

## Required fact fields

Every normalized external fact must include, directly or through its source record:

- `fact_type`: LIVE, PUBLISHED, RECENT, WEEKLY_GOVERNMENT_DATA, HISTORICAL_TYPICAL, USER_ENTERED, COMMUNITY_REPORTED, or UNKNOWN
- `source_id`
- `source_name`
- `source_url`
- `retrieved_at`
- `published_at` or `period_end` when the source provides one
- `geography`
- `value` and `unit` when numeric
- `freshness_seconds` or a documented cadence
- `status`: fresh, aging, stale, unavailable
- `confidence`: high, medium, low
- `notes` for material limitations

## Freshness rules

A fact does not become false merely because it is old, but its label must change.

- live operational data: use the source lifecycle or a short TTL
- weather forecast: refresh from the source on demand; never cache as current indefinitely
- weekly government fuel data: fresh until the next normal weekly release window; label the week-ending date
- provider fees/rules: show the provider effective/retrieval date and re-check on a defined cadence
- events: freshness tightens as the event approaches; official organizer is preferred
- business hours/open status: must have current evidence before displaying OPEN NOW
- reviews: show review recency and sample size; do not turn a few comments into a universal claim
- safety: time-stamp all alerts/incidents and avoid permanent neighborhood labels
- community reports: clearly separated from official facts and decayed over time
- missing or unverifiable source metadata: label UNKNOWN; never infer recency, price, or provider policy

## Reusable fact presentation

Every fact surface should be able to show the human-readable freshness label, source name and link, retrieval time, effective/period date, confidence, and material limitations. Display labels use spaces (for example, `WEEKLY GOVERNMENT DATA` and `HISTORICAL / TYPICAL`) while normalized records may use underscore forms. User-entered values must remain distinguishable from externally verified facts.

## Source hierarchy

Prefer, in order:

1. official government / public authority
2. official provider / venue / organizer
3. approved affiliate or licensed data feed
4. reputable public directory or publication with clear provenance
5. public social/creator content where useful and permitted
6. community report

A lower-ranked source may supplement a higher-ranked source but must not silently override it.

## Failure behavior

If a refresh fails:

- keep the last known fact only if it remains useful
- mark it stale and preserve its original period/retrieval date
- never rewrite the retrieval date to make old data appear new
- never substitute an invented average
- do not break the whole trip planner because one source is unavailable

## Privacy

Browser geolocation is opt-in. Suitcase Brain should request it only after an explicit user action, use it for the requested feature, and not persist it in the static site.

## First connected sources

- U.S. Energy Information Administration: weekly gasoline reference data, keyless bulk refresh
- National Weather Service: on-demand U.S. forecast by coordinates
- Travelpayouts Drive: approved monetization surface; not a truth source for unrelated trip facts

Additional sources must conform to this contract before their facts reach the public UI.
