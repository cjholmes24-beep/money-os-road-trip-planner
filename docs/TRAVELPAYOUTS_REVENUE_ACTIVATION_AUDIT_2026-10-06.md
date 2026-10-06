# Travelpayouts revenue activation audit — 2026-10-06

Official public Help Center articles were retrieved on 2026-10-06 using the publisher's public article API. This audit does not establish account-specific program access, earnings, payouts, or live Drive behavior. No account was logged into, no token requested, and no provider click/booking generated. The existing public Drive loader remains unchanged.

## What Drive does

[What is Travelpayouts Drive](https://support.travelpayouts.com/hc/en-us/articles/21844777943058-What-is-Travelpayouts-Drive) describes content/visitor analysis, existing-link switching, keyword linking, native recommendation blocks, link previews, and targeted offers. The documented recommendation examples include hotels, tours, car rentals, and activities. Changes appear gradually and not every page is affected. Drive is the repository's already-approved public monetization surface; that is not proof every category or brand on the account is enabled.

[Drive functionalities and settings](https://support.travelpayouts.com/hc/en-us/articles/32083238510482-Drive-functionalities-and-settings) documents switching regular brand-site links, direct affiliate-program links, and affiliate-network links. Supported shorteners are listed in that article. Link switching uses connected programs selected in the project. Some functionality is limited to English travel content. Targeted offers are an independently managed mechanism: the article describes an offer opening when a user clicks an empty area, up to twice per month for roughly 20% of the audience. This brick does not trigger, simulate, intercept, or recreate that behavior.

[Drive FAQ](https://support.travelpayouts.com/hc/en-us/articles/32097258847378-FAQ-about-Drive) says sufficient travel content is needed, program access still depends on the project, and Drive chooses brands for most automatic functionality. Link switching adds `noopener`, `nofollow`, and `sponsored`. Drive does not provide a documented general-purpose eligibility/click JavaScript callback in the reviewed articles. DOM appearance alone is therefore not used to assert an eligible click.

[Manual Drive editor](https://support.travelpayouts.com/hc/en-us/articles/37402879881106-How-to-manually-manage-Drive-blocks-and-affiliate-links) is an authenticated owner visual editor. It only offers blocks available for the current page and requires saving changes. This task does not access that editor or modify its account settings.

## Program approval

[How to start working with affiliate programs](https://support.travelpayouts.com/hc/en-us/articles/360021216060-How-to-start-working-with-affiliate-programs), updated 2026-09-28, states that since April 27, 2026 eligible programs can be connected automatically after project creation, while some programs require review or are unavailable under brand rules. This supersedes an assumption that every program requires a separate manual application. It still does not prove that this project's specific brands/categories are approved.

The opportunity registry covers FLIGHTS, ACCOMMODATION, RENTAL_CARS, TRANSFERS, BUS_RAIL, CRUISES, ESIM, ACTIVITIES, TRAVEL_INSURANCE, and FLIGHT_COMPENSATION as travel needs, not a list of approved brands. All direct URL flags are false. `Travelpayouts_Drive_eligible` remains null where this project's eligibility is not verified. No brand or affiliate URL is invented. Official documentation lists general capabilities; account approval and the exact destination URL are separate prerequisites for a newly configured direct action.

## Click, booking and commission reporting

[How to check Drive performance](https://support.travelpayouts.com/hc/en-us/articles/24544291537554-How-to-check-Drive-performance) directs partners to Reports → Content Analytics, with Clicks/Bookings tabs, page breakdowns, date/tool/program filters.

[Content analytics](https://support.travelpayouts.com/hc/en-us/articles/22641653439506-Content-analytics) documents visits, clicks, bookings, pending/confirmed/canceled states, potential income and earnings. It also states:

- Some widget clicks are not included in click statistics.
- Page performance only appears for selected days with Travelpayouts-tool clicks.
- Some shortened-link/widget events are missing from the content-analytics view but bookings can still be recorded elsewhere.

The local browser dashboard is not a substitute for those reports and cannot measure unique visitors or identify every Drive-injected click.

[Reports overview](https://support.travelpayouts.com/hc/en-us/articles/203955733-Travelpayouts-Reports-overview) documents Performance and Bookings reports, click/impression/purchase statistics, CSV downloads with applied filters, and Pending/Confirmed/Canceled bookings. Confirmed earnings will arrive in a later payout; they are not automatically cash received.

[Pending and Canceled bookings](https://support.travelpayouts.com/hc/en-us/articles/5119715661714-Pending-and-Canceled-bookings) explains that brand confirmation depends on each program and canceled bookings may represent unused/canceled service or rules violations.

[Missing bookings](https://support.travelpayouts.com/hc/en-us/articles/5119524852114-Why-a-booking-is-missing-from-my-reports) documents reporting delays and attribution loss scenarios, including incognito/tab/session behavior. Cookie periods, attribution rules, confirmation timing, and permitted traffic vary by program. This brick assumes no universal cookie duration or guaranteed conversion.

## APIs, exports and secrets

[Booking statistics API](https://support.travelpayouts.com/hc/en-us/articles/360019864079-API-of-affiliate-programs-booking-statistics) requires a registered partner's API token in `X-Access-Token`. It exposes booking/action data and aggregate metrics for connected programs, subject to rate limits. Its `paid`/confirmed booking earnings are not by themselves a cash receipt.

[Balance and payment API](https://support.travelpayouts.com/hc/en-us/articles/5169505760402-API-of-affiliates-balance-and-payment) also requires a private API token and exposes balances, payment history and payment associations. A future adapter must reconcile the right payment/commission references, reversals, currencies, and actual receipt evidence before emitting CLEARED_REVENUE.

[Payouts report](https://support.travelpayouts.com/hc/en-us/articles/204395417-Payouts-report) separates finance/payout history and invoices from booking confirmation. Payment timing depends on thresholds/methods and can include bank processing delays. No cleared revenue is inferred from an invoice, confirmed booking, or scheduled payment alone.

The public Drive loader is designed for browser installation and contains a public project identifier, not an API reporting secret. A reporting token must never be embedded in client code, public JSON, URLs, exports, or this dashboard. No reporting secret binding or Travelpayouts-related variable name was found in this environment; no secret value was inspected. No live report API is connected, no private account report was downloaded, and CORS/API-account authorization was not tested.

Dashboard CSV export requires the owner's authenticated Travelpayouts account. V1 accepts a narrow, redacted canonical JSON transformation/import, not arbitrary raw CSV/API output with possible personal data. Imports are labeled PROVIDER REPORTED / USER IMPORTED — UNVERIFIED. They remain useful for local review but cannot unlock independently verified money milestones.

## Implementation decisions and remaining activation requirements

1. Preserve the exact installed Drive loader and affiliate disclosures. No new Drive setting, paid service, program enrollment, or affiliate URL introduced.
2. Improve useful planning content and contextual checklists on existing pages. Show provider links only through runtime-verified approved capabilities; an unavailable provider action remains explicit.
3. Track opt-in local category selections separately from eligible action visibility/clicks. Never simulate Drive offers or turn checklist clicks into provider clicks.
4. Keep imported report claims separate from independently verified revenue. A trusted cleared adapter must supply actual payout receipt evidence; pending/confirmed booking data is insufficient.
5. To activate new direct links, first verify this project's approval and exact provider URLs through the owner account. To centralize Drive/report analytics later, use authenticated official exports/APIs with private server-side secret handling and a separate $0 infrastructure review. Neither is a prerequisite to use the local V1 planner/dashboard.

No owner cost or earned revenue is claimed. The only existing monetization behavior is the already-approved Drive installation; new direct/provider-report integrations remain unconfigured.
