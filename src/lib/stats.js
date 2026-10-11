// Derived statistics from the answer log and SRS state.
import { VERB_BY_INF, verbGroups, GROUPS, TENSES, PERSONS } from '../data/verbs.js';
import { loadLog, loadSrs, parseKey } from './store.js';

const DAY = 24 * 60 * 60 * 1000;

/** Period → epoch ms. `days` may be a number, 'today', or 'all'. */
export function sinceFor(days) {
  if (days === 'all') return 0;
  if (days === 'today') { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  return Date.now() - days * DAY;
}
const inPeriod = (days, tense = null) => { const since = sinceFor(days); return loadLog().filter((e) => e.t >= since && (!tense || parseKey(e.key).tense === tense)); };

export function summary(days = 30) {
  const log = inPeriod(days);
  const answered = log.length;
  const correct = log.reduce((a, e) => a + e.ok, 0);
  const srs = loadSrs();
  const entries = Object.values(srs);
  const known = entries.filter((e) => e.hist.length && e.hist[e.hist.length - 1] === 1).length; // right last time
  const mastered = entries.filter((e) => e.reps >= 3).length; // right on 3 spaced reviews in a row
  return { answered, correct, accuracy: answered ? correct / answered : 0, known, mastered, tracked: entries.length };
}

export function todayStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const log = loadLog().filter((e) => e.t >= start.getTime());
  const ok = log.reduce((a, e) => a + e.ok, 0);
  return { n: log.length, ok, accuracy: log.length ? ok / log.length : 0 };
}

/** Consecutive days (ending today or yesterday) with at least one answer. */
export function streak() {
  const days = new Set(loadLog().map((e) => new Date(e.t).toDateString()));
  let n = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // allow today to be empty so a streak survives until midnight
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function bucket(log, keyFn) {
  const m = {};
  for (const e of log) {
    const k = keyFn(e);
    if (k == null) continue;
    const b = (m[k] ??= { n: 0, ok: 0 });
    b.n++;
    b.ok += e.ok;
  }
  return m;
}

export function byPerson(days = 30, tense = null) {
  const log = inPeriod(days, tense);
  const b = bucket(log, (e) => parseKey(e.key).personIdx);
  return PERSONS.map((p, i) => ({ person: p, ...(b[i] ?? { n: 0, ok: 0 }) }));
}

export function byTense(days = 30) {
  const log = inPeriod(days);
  const b = bucket(log, (e) => parseKey(e.key).tense);
  return TENSES.map((t) => ({ tense: t, ...(b[t.id] ?? { n: 0, ok: 0 }) }));
}

export function byGroup(days = 30, tense = null) {
  const log = inPeriod(days, tense);
  const b = {};
  for (const e of log) {
    const v = VERB_BY_INF[parseKey(e.key).inf];
    if (!v) continue;
    for (const g of verbGroups(v)) { const x = (b[g] ??= { n: 0, ok: 0 }); x.n++; x.ok += e.ok; }
  }
  return GROUPS.map((g) => ({ group: g, ...(b[g.id] ?? { n: 0, ok: 0 }) }));
}

/** Forms with the lowest accuracy in the period (at least `min` answers). */
export function weakestForms(limit = 5, days = 30, min = 3, tense = null) {
  const b = bucket(inPeriod(days, tense), (e) => e.key);
  return Object.entries(b)
    .filter(([, x]) => x.n >= min)
    .map(([key, x]) => ({ key, ...parseKey(key), n: x.n, ok: x.ok, acc: x.ok / x.n }))
    .filter((f) => f.acc < 1)
    .sort((a, c) => a.acc - c.acc || c.n - a.n)
    .slice(0, limit);
}

export function mostMissed(limit = 5, days = 30, tense = null) {
  const b = bucket(inPeriod(days, tense), (e) => parseKey(e.key).inf);
  return Object.entries(b)
    .map(([inf, { n, ok }]) => ({ inf, n, ok, misses: n - ok, acc: ok / n }))
    .filter((v) => v.misses > 0)
    .sort((a, c) => c.misses - a.misses || a.acc - c.acc)
    .slice(0, limit);
}

export function verbStats(inf) {
  const log = loadLog().filter((e) => parseKey(e.key).inf === inf);
  const n = log.length;
  const ok = log.reduce((a, e) => a + e.ok, 0);
  const byForm = bucket(log, (e) => e.key);
  let weakest = null;
  for (const [k, b] of Object.entries(byForm)) {
    if (b.n < 2) continue;
    const acc = b.ok / b.n;
    if (!weakest || acc < weakest.acc) weakest = { key: k, acc, ...parseKey(k) };
  }
  return { n, ok, accuracy: n ? ok / n : 0, weakest };
}

export function formHistory(key) {
  const e = loadSrs()[key];
  if (!e) return null;
  const last = loadLog().filter((x) => x.key === key).pop();
  return { hist: e.hist, lastSeen: last ? last.t : null, due: e.due, interval: e.interval };
}

export const LEVELS = [
  { id: 'unseen', label: 'Unseen' },
  { id: 'weak', label: 'Weak' },
  { id: 'learning', label: 'Learning' },
  { id: 'strong', label: 'Strong' },
];

/**
 * One level per verb from its 30 forms (5 tenses × 6 persons):
 *  unseen   – nothing answered yet
 *  weak     – under half of the seen forms were right last time
 *  learning – everything in between
 *  strong   – ≥ 85% right last time and at least half the forms seen
 */
export function verbLevel(inf, srs = loadSrs()) {
  const total = 30;
  let seen = 0, known = 0, mastered = 0;
  for (const [k, e] of Object.entries(srs)) {
    if (parseKey(k).inf !== inf) continue;
    seen += 1;
    if (e.hist.length && e.hist[e.hist.length - 1] === 1) known += 1;
    if (e.reps >= 3) mastered += 1;
  }
  const ratio = seen ? known / seen : 0;
  const level = !seen ? 'unseen' : ratio >= 0.85 && seen >= total / 2 ? 'strong' : ratio < 0.5 ? 'weak' : 'learning';
  return { level, seen, known, mastered, total };
}
