(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EventIntelligence = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CATEGORIES = 'CONCERT MUSIC_FESTIVAL FOOD_FESTIVAL CULTURAL_FESTIVAL HOLIDAY PARADE CONVENTION EXPO SEMINAR WORKSHOP BUSINESS ART AUTO TECH COMIC_GAMING SPORTS FAMILY OUTDOOR ADVENTURE NIGHTLIFE COMEDY KARAOKE TRIVIA DANCE MARKET FOOD_TRUCK_EVENT COMMUNITY OTHER'.split(' ');
  const SEASONS = 'NEW_YEAR VALENTINES SPRING_BREAK MARDI_GRAS EASTER_SPRING MEMORIAL_DAY PRIDE_MONTH JUNETEENTH JULY_4 LABOR_DAY HALLOWEEN THANKSGIVING CHRISTMAS HOLIDAY_LIGHTS NEW_YEARS_EVE FALL_FESTIVAL SUMMER WINTER OTHER'.split(' ');
  const STATUSES = 'ANNOUNCED SCHEDULED REGISTRATION_OPEN REGISTRATION_CLOSED SOLD_OUT POSTPONED CANCELED COMPLETED UNKNOWN'.split(' ');
  const PRICE_TYPES = ['FREE', 'PAID', 'DONATION', 'VARIABLE', 'UNKNOWN'];
  const TRUTH_STATES = ['VERIFIED', 'PUBLISHED', 'USER_ENTERED', 'UNKNOWN', 'NOT_APPLICABLE'];
  const COSTS = ['base_price', 'mandatory_fees', 'parking_cost', 'optional_cost'];
  const TEXT_FIELDS = ['id', 'title', 'summary', 'organizer', 'venue', 'location', 'city', 'state_region', 'country', 'timezone', 'start_date_time', 'end_date_time', 'last_verified', 'notes'];
  const trustedRecords = new WeakSet();
  const uid = () => globalThis.crypto?.randomUUID?.() || `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const text = x => typeof x === 'string' ? x.trim().slice(0, 2000) : '';
  const numeric = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  const clone = x => JSON.parse(JSON.stringify(x));
  function httpsUrl(raw) {
    try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch (_) { return ''; }
  }
  function sourceMetadata(input = {}, trusted = false) {
    return {
      fact_type: trusted && ['PUBLISHED', 'VERIFIED'].includes(input.fact_type) ? input.fact_type : 'USER_ENTERED',
      source_id: text(input.source_id), source_name: trusted ? text(input.source_name) || 'UNKNOWN' : 'Traveler',
      source_url: httpsUrl(input.source_url), retrieved_at: trusted ? text(input.retrieved_at) : '',
      published_at: trusted ? text(input.published_at) : '', geography: text(input.geography),
      freshness_seconds: trusted && numeric(input.freshness_seconds) && input.freshness_seconds > 0 ? input.freshness_seconds : null,
      notes: text(input.notes)
    };
  }
  function component(value = null, state = 'USER_ENTERED', trusted = false) {
    const clean = numeric(value) ? value : null;
    if (state === 'NOT_APPLICABLE') return { value: null, state };
    if (clean === null || state === 'UNKNOWN') return { value: null, state: 'UNKNOWN' };
    return { value: clean, state: trusted && ['VERIFIED', 'PUBLISHED'].includes(state) ? state : 'USER_ENTERED' };
  }
  function normalizeOccurrence(input = {}, eventId, trusted = false) {
    return { id: text(input.id) || uid(), event_id: eventId, start_date_time: text(input.start_date_time), end_date_time: text(input.end_date_time), timezone: text(input.timezone), all_day: input.all_day === true,
      status: STATUSES.includes(input.status) ? input.status : 'UNKNOWN', source: sourceMetadata(input.source, trusted) };
  }
  function normalizeEvent(input = {}, context = {}) {
    const trusted = context.trustedSource === true;
    const event = Object.fromEntries(TEXT_FIELDS.map(k => [k, text(input[k])]));
    event.id ||= uid();
    Object.assign(event, { category: CATEGORIES.includes(input.category) ? input.category : 'OTHER',
      tags: Array.isArray(input.tags) ? input.tags.map(text).filter(Boolean) : [], subcategories: Array.isArray(input.subcategories) ? input.subcategories.map(text).filter(Boolean) : [],
      all_day: input.all_day === true, recurrence: text(input.recurrence), seasonal_theme: Array.isArray(input.seasonal_theme) ? input.seasonal_theme.filter(s => SEASONS.includes(s)) : [],
      minimum_age: numeric(input.minimum_age) && Number.isInteger(input.minimum_age) ? input.minimum_age : null,
      family_friendly: typeof input.family_friendly === 'boolean' ? input.family_friendly : null,
      indoor_outdoor: ['INDOOR', 'OUTDOOR', 'BOTH'].includes(input.indoor_outdoor) ? input.indoor_outdoor : 'UNKNOWN',
      price_type: PRICE_TYPES.includes(input.price_type) ? input.price_type : 'UNKNOWN', currency: text(input.currency).toUpperCase() || 'USD',
      registration_required: typeof input.registration_required === 'boolean' ? input.registration_required : null,
      reservation_required: typeof input.reservation_required === 'boolean' ? input.reservation_required : null,
      event_status: STATUSES.includes(input.event_status) ? input.event_status : 'UNKNOWN',
      official_event_url: httpsUrl(input.official_event_url), official_ticket_url: httpsUrl(input.official_ticket_url),
      source: sourceMetadata(input.source, trusted), record_origin: trusted ? 'SOURCE_BACKED' : 'USER_ENTERED' });
    if (!trusted) event.last_verified = '';
    COSTS.forEach(k => { const c = input[k]; event[k] = component(object(c) ? c.value : c, object(c) ? c.state : 'USER_ENTERED', trusted); });
    event.occurrences = Array.isArray(input.occurrences) ? input.occurrences.map(o => normalizeOccurrence(o, event.id, trusted)) :
      [normalizeOccurrence({ ...event, status: event.event_status }, event.id, trusted)];
    const validation = validateEvent(event);
    if (!validation.valid) throw Error(validation.errors.join(' '));
    if (trusted) { trustedRecords.add(event); deepFreeze(event); }
    return event;
  }
  function deepFreeze(x) { Object.values(x).forEach(v => { if (object(v) || Array.isArray(v)) deepFreeze(v); }); return Object.freeze(x); }
  // Timed values require explicit offsets. Date-only all-day values use civil dates,
  // with an inclusive end day; no host timezone or guessed DST conversion is used.
  function validDate(value, allDay) {
    if (!value) return true;
    const pattern = allDay ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!pattern.test(value) || !Number.isFinite(Date.parse(value))) return false;
    const day = value.slice(0, 10);
    return new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day;
  }
  function validSource(s) {
    return object(s) && ['USER_ENTERED', 'PUBLISHED', 'VERIFIED', 'UNKNOWN'].includes(s.fact_type) &&
      ['source_id', 'source_name', 'source_url', 'retrieved_at', 'published_at', 'geography', 'notes'].every(k => typeof s[k] === 'string') &&
      (!s.source_url || httpsUrl(s.source_url)) && (s.freshness_seconds === null || numeric(s.freshness_seconds));
  }
  function validateOccurrence(o, eventId) {
    const errors = [];
    if (!object(o)) return { valid: false, errors: ['Occurrence must be an object.'] };
    if (typeof o.id !== 'string' || !o.id || o.event_id !== eventId) errors.push('Invalid occurrence identity.');
    if (typeof o.timezone !== 'string' || typeof o.all_day !== 'boolean' || !STATUSES.includes(o.status) || !validSource(o.source)) errors.push('Invalid occurrence metadata.');
    for (const k of ['start_date_time', 'end_date_time']) if (typeof o[k] !== 'string' || !validDate(o[k], o.all_day)) errors.push(`Invalid occurrence ${k}.`);
    if (o.end_date_time && (!o.start_date_time || Date.parse(o.end_date_time) < Date.parse(o.start_date_time))) errors.push('Occurrence end requires a start and cannot precede it.');
    return { valid: !errors.length, errors };
  }
  function validateEvent(e) {
    const errors = [];
    if (!object(e)) return { valid: false, errors: ['Event must be an object.'] };
    if (!TEXT_FIELDS.every(k => typeof e[k] === 'string') || !e.id || !e.title?.trim()) errors.push('Event identity/title/text fields are required.');
    if (!CATEGORIES.includes(e.category) || !PRICE_TYPES.includes(e.price_type) || !STATUSES.includes(e.event_status) || !['USER_ENTERED', 'SOURCE_BACKED', 'IMPORTED'].includes(e.record_origin)) errors.push('Invalid event category, price, status, or origin.');
    if (!/^[A-Z]{3}$/.test(e.currency || '') || !['INDOOR', 'OUTDOOR', 'BOTH', 'UNKNOWN'].includes(e.indoor_outdoor)) errors.push('Invalid currency or indoor/outdoor state.');
    for (const k of ['family_friendly', 'registration_required', 'reservation_required']) if (e[k] !== null && typeof e[k] !== 'boolean') errors.push(`Invalid ${k}.`);
    if (e.minimum_age !== null && (!numeric(e.minimum_age) || !Number.isInteger(e.minimum_age))) errors.push('Invalid minimum age.');
    for (const k of ['tags', 'subcategories', 'seasonal_theme']) if (!Array.isArray(e[k]) || !e[k].every(v => typeof v === 'string') || (k === 'seasonal_theme' && e[k].some(s => !SEASONS.includes(s)))) errors.push(`Invalid ${k}.`);
    if (typeof e.recurrence !== 'string' || typeof e.all_day !== 'boolean' || !validDate(e.start_date_time, e.all_day) || !validDate(e.end_date_time, e.all_day) || (e.end_date_time && (!e.start_date_time || Date.parse(e.end_date_time) < Date.parse(e.start_date_time)))) errors.push('Invalid concept dates/recurrence.');
    if (!validSource(e.source)) errors.push('Invalid event source.');
    for (const k of ['official_event_url', 'official_ticket_url']) if (typeof e[k] !== 'string' || (e[k] && !httpsUrl(e[k]))) errors.push(`Invalid HTTPS ${k}.`);
    COSTS.forEach(k => { const c = e[k]; if (!object(c) || !TRUTH_STATES.includes(c.state) || (['UNKNOWN', 'NOT_APPLICABLE'].includes(c.state) ? c.value !== null : !numeric(c.value))) errors.push(`Invalid ${k} component.`); });
    if (!Array.isArray(e.occurrences)) errors.push('Occurrences must be an array.');
    else {
      const ids = new Set();
      e.occurrences.forEach(o => { errors.push(...validateOccurrence(o, e.id).errors); if (ids.has(o?.id)) errors.push('Duplicate occurrence id.'); ids.add(o?.id); });
    }
    return { valid: !errors.length, errors };
  }
  function validateEvents(events) {
    const errors = [];
    if (!Array.isArray(events)) return { valid: false, errors: ['events must be an array.'] };
    const ids = new Set();
    events.forEach((e, i) => { validateEvent(e).errors.forEach(err => errors.push(`Event ${i + 1}: ${err}`)); if (ids.has(e?.id)) errors.push('Duplicate event id.'); ids.add(e?.id); });
    return { valid: !errors.length, errors };
  }
  function sanitizePersistedEvents(events) {
    const v = validateEvents(events);
    if (!v.valid) throw Error(v.errors.join(' '));
    return clone(events).map(e => {
      const wasSourceBacked = e.record_origin === 'SOURCE_BACKED';
      const unverifiedSnapshot = wasSourceBacked || e.record_origin === 'IMPORTED';
      COSTS.forEach(k => { if (['VERIFIED', 'PUBLISHED'].includes(e[k].state)) e[k].state = 'USER_ENTERED'; });
      const downgrade = s => unverifiedSnapshot ? {
        ...s,
        fact_type: 'UNKNOWN',
        notes: text(s?.notes).includes('runtime re-verification')
          ? text(s?.notes)
          : [text(s?.notes), 'Imported source-backed snapshot requires runtime re-verification.'].filter(Boolean).join(' ')
      } : sourceMetadata(s);
      e.source = downgrade(e.source);
      e.last_verified = '';
      e.occurrences.forEach(o => { o.source = downgrade(o.source); });
      if (wasSourceBacked) e.record_origin = 'IMPORTED';
      return e;
    });
  }
  function occurrenceTimeState(o, now) {
    const current = typeof now === 'number' ? now : Date.parse(now);
    if (!Number.isFinite(current) || !validDate(o?.start_date_time, o?.all_day) || !validDate(o?.end_date_time, o?.all_day) || (o?.end_date_time && Date.parse(o.end_date_time) < Date.parse(o.start_date_time)) || !o?.start_date_time) return 'DATE_UNKNOWN';
    // All-day dates can be compared with a known IANA zone; absent/invalid zone fails closed.
    let start, end;
    if (o.all_day) {
      if (!o.timezone) return 'DATE_UNKNOWN';
      let day;
      try { const parts = new Intl.DateTimeFormat('en-US', { timeZone: o.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(current)); const get = t => parts.find(p => p.type === t).value; day = `${get('year')}-${get('month')}-${get('day')}`; } catch (_) { return 'DATE_UNKNOWN'; }
      if (day < o.start_date_time) return 'UPCOMING';
      if (day > (o.end_date_time || o.start_date_time)) return 'PAST';
      return 'IN_PROGRESS';
    }
    start = Date.parse(o.start_date_time); end = Date.parse(o.end_date_time);
    if (current < start) return 'UPCOMING';
    if (!Number.isFinite(end)) return 'DATE_UNKNOWN';
    return current < end ? 'IN_PROGRESS' : 'PAST';
  }
  function priceTruth(e) {
    const required = ['base_price', 'mandatory_fees'];
    const unknownRequired = required.filter(k => e[k].state === 'UNKNOWN');
    const known = keys => keys.reduce((n, k) => n + (numeric(e[k].value) && !['UNKNOWN', 'NOT_APPLICABLE'].includes(e[k].state) ? e[k].value : 0), 0);
    return { knownRequiredCost: known(required), knownOptionalCost: known(['parking_cost', 'optional_cost']), unknownRequiredComponents: unknownRequired,
      coverage: `${required.length - unknownRequired.length} of ${required.length} required components resolved`, requiredComplete: !unknownRequired.length,
      label: unknownRequired.length ? 'REQUIRED PRICE INCOMPLETE' : 'KNOWN REQUIRED COST COMPLETE' };
  }
  const norm = s => text(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const contains = (s, q) => !!norm(q) && (` ${norm(s)} `).includes(` ${norm(q)} `);
  function dateOverlap(o, start, end) {
    if (!o || !validDate(o.start_date_time, o.all_day) || !validDate(o.end_date_time, o.all_day) || !start || !end || !validDate(start, true) || !validDate(end, true) || end < start || !o.start_date_time) return false;
    // Travel-date matching uses the occurrence's written local civil dates, not UTC day shifts.
    // An unknown timed end supports its explicit start day only, never an invented duration.
    const a = o.start_date_time.slice(0, 10), b = (o.end_date_time || o.start_date_time).slice(0, 10);
    return a <= end && b >= start;
  }
  const locationText = e => [e.location, e.city, e.state_region, e.country].join(' ');
  function filterEvents(events, filters = {}) {
    return events.filter(e => validateEvent(e).valid &&
      (!filters.start && !filters.end || e.occurrences.some(o => dateOverlap(o, filters.start || filters.end, filters.end || filters.start))) &&
      (!filters.category || e.category === filters.category) && (!filters.location || contains(locationText(e), filters.location)) &&
      (!filters.seasonal_theme || e.seasonal_theme.includes(filters.seasonal_theme)) && (!filters.price_type || e.price_type === filters.price_type) &&
      (typeof filters.family_friendly !== 'boolean' || e.family_friendly === filters.family_friendly) &&
      (filters.age == null || numeric(filters.age) && e.minimum_age !== null && filters.age >= e.minimum_age) &&
      (!filters.indoor_outdoor || e.indoor_outdoor === filters.indoor_outdoor) && (!filters.event_status || e.event_status === filters.event_status));
  }
  function matchTripEvents(trip, events = trip.events || []) {
    const query = [...(trip.preferences?.interests || []), trip.identity?.purpose, trip.identity?.vibe].filter(Boolean);
    return filterEvents(events, { start: trip.dates?.start, end: trip.dates?.end || trip.dates?.start }).filter(e =>
      trip.dates?.start && e.occurrences.some(o => dateOverlap(o, trip.dates.start, trip.dates.end || trip.dates.start)) &&
      e.event_status !== 'CANCELED' && e.event_status !== 'POSTPONED' &&
      (e.minimum_age === null || !(trip.travelers || []).some(t => /^\d+$/.test(t.age_band || '') && Number(t.age_band) < e.minimum_age)) &&
      e.occurrences.some(o => !['CANCELED', 'POSTPONED'].includes(o.status) && dateOverlap(o, trip.dates.start, trip.dates.end || trip.dates.start)) &&
      (!trip.destination || contains(locationText(e), trip.destination) || contains(trip.destination, e.city || e.location))
    ).map(e => {
      const reasons = ['DATE OVERLAP'];
      if (trip.destination) reasons.push('DESTINATION TEXT MATCH');
      if (query.some(q => contains(e.tags.join(' ') + ' ' + e.title + ' ' + e.summary, q))) reasons.push('INTEREST MATCH');
      if (query.some(q => contains(e.category.replaceAll('_', ' '), q))) reasons.push('CATEGORY MATCH');
      const ages = (trip.travelers || []).map(t => /^\d+$/.test(t.age_band || '') ? Number(t.age_band) : null);
      if (e.minimum_age !== null && ages.length === Number(trip.traveler_count) && ages.every(a => a !== null && a >= e.minimum_age)) reasons.push('EXPLICIT AGE COMPATIBILITY');
      return { event: e, reasons };
    });
  }
  function sourceState(e, now = Date.now(), source = e.source) {
    if (e.record_origin === 'USER_ENTERED') return 'USER ENTERED';
    if (e.record_origin === 'IMPORTED') return 'UNVERIFIED SNAPSHOT';
    if (!trustedRecords.has(e)) return 'UNVERIFIED SNAPSHOT';
    const age = now - Date.parse(source.retrieved_at), ttl = source.freshness_seconds;
    return !Number.isFinite(age) || age < 0 || !ttl ? 'UNKNOWN' : age > ttl * 1000 ? 'STALE' : 'FRESH';
  }
  function officialUrl(e, kind = 'event') { return trustedRecords.has(e) && sourceState(e) === 'FRESH' ? httpsUrl(kind === 'ticket' ? e.official_ticket_url : e.official_event_url) || null : null; }
  async function isolateSource(id, loader) {
    try {
      const events = await loader();
      const v = validateEvents(events);
      if (!v.valid || events.some(e => e.record_origin !== 'SOURCE_BACKED' || !trustedRecords.has(e))) throw Error();
      return { source_id: id, status: 'AVAILABLE', events };
    } catch (_) {
      return { source_id: id, status: 'UNAVAILABLE', events: [], error: 'EVENT SOURCE UNAVAILABLE' };
    }
  }
  return { CATEGORIES, SEASONS, STATUSES, PRICE_TYPES, COSTS, TRUTH_STATES, component, normalizeEvent, normalizeOccurrence, validateEvent, validateOccurrence, validateEvents, sanitizePersistedEvents, occurrenceTimeState, priceTruth, dateOverlap, filterEvents, matchTripEvents, sourceState, occurrenceSourceState: (e, o, now = Date.now()) => e.occurrences.includes(o) ? sourceState(e, now, o.source) : 'UNKNOWN', officialUrl, isolateSource };
});
