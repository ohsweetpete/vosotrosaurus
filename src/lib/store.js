// localStorage-backed settings, SRS state and answer log.
// Everything is wrapped in try/catch so a blocked storage never breaks the app.

const KEYS = {
  settings: 'conjugar.settings.v1',
  srs: 'conjugar.srs.v1',
  log: 'conjugar.log.v1',
  browse: 'conjugar.browse.v1',
  defaults: 'conjugar.defaults.v1',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// ---------- settings ----------
export const DEFAULT_SETTINGS = {
  tenses: ['presente', 'preterito', 'imperfecto'],
  groups: ['regular-ar', 'regular-er', 'regular-ir', 'stem', 'spell', 'irregular'],
  persons: [0, 1, 2, 3, 4, 5],
  verbs: [], // specific infinitives; empty = all matching groups
  tier: 50, // max frequency rank to include; 0 = all verbs
  promptLang: 'es', // 'es' | 'en' | 'both'
  showHints: true,
  strictAccents: true,
  length: 20, // 0 = endless
  prioritiseDue: true,
  dailyGoal: 50,
  mode: 'custom', // 'custom' | 'due' | 'mistakes'
};

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}
export function saveSettings(s) {
  write(KEYS.settings, s);
}

// ---------- browse filters (Verbs page), persisted ----------
export function loadBrowse() {
  return read(KEYS.browse, null);
}
export function saveBrowse(f) {
  write(KEYS.browse, f);
  window.dispatchEvent(new CustomEvent('browse-changed'));
}

// ---------- user's saved drill defaults (Practice page) ----------
const DRILL_KEYS = ['mode', 'tenses', 'tier', 'groups', 'verbs', 'persons', 'length', 'promptLang', 'strictAccents', 'prioritiseDue', 'showHints'];
export function loadDrillDefaults() {
  return read(KEYS.defaults, null);
}
export function saveDrillDefaults(settings) {
  const snap = Object.fromEntries(DRILL_KEYS.map((k) => [k, settings[k]]));
  write(KEYS.defaults, snap);
  return snap;
}
/** The user's saved defaults, or the app's. */
export function drillDefaults() {
  const saved = loadDrillDefaults();
  return saved ? { ...saved, mode: 'custom' } : Object.fromEntries(DRILL_KEYS.map((k) => [k, DEFAULT_SETTINGS[k]]));
}
export function sameDrillSettings(a, b) {
  return DRILL_KEYS.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
}

// ---------- SRS ----------
// key = `${inf}|${tense}|${personIdx}`
// entry = { reps, lapses, interval (ms), due (epoch ms), ease, hist: [0/1,...] }
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

export function formKey(inf, tense, personIdx) {
  return `${inf}|${tense}|${personIdx}`;
}
export function parseKey(key) {
  const [inf, tense, p] = key.split('|');
  return { inf, tense, personIdx: Number(p) };
}

export function loadSrs() {
  return read(KEYS.srs, {});
}

/**
 * Simplified SM-2 tuned for a large pool of forms.
 *  - right first time → 1 day, then 4 days, then × ease
 *  - wrong            → 10 min, stays short until answered right; then 1 day
 *  - right before due → recorded, but the schedule doesn't move
 */
function applyAnswer(e, ok, now) {
  const wasLapsed = e.hist.length > 0 && e.hist[e.hist.length - 1] === 0;
  const early = e.hist.length > 0 && e.due > now; // asked again before it was due (pool exhausted)
  e.hist = [...e.hist.slice(-9), ok ? 1 : 0];
  if (ok && early) return e; // counts for accuracy, but only spaced reviews move the schedule
  if (ok) {
    e.reps += 1;
    if (wasLapsed) e.interval = 1 * DAY;
    else if (e.reps === 1) e.interval = 1 * DAY;
    else if (e.reps === 2) e.interval = 4 * DAY;
    else e.interval = Math.round(e.interval * e.ease);
    e.ease = Math.min(3.0, e.ease + 0.05);
  } else {
    e.reps = 0;
    e.lapses += 1;
    e.interval = 10 * MIN;
    e.ease = Math.max(1.3, e.ease - 0.2);
  }
  e.due = now + e.interval;
  return e;
}
const freshEntry = (now) => ({ reps: 0, lapses: 0, interval: 0, due: now, ease: 2.5, hist: [] });

export function recordAnswer(key, ok, now = Date.now()) {
  const srs = loadSrs();
  const e = applyAnswer(srs[key] ?? freshEntry(now), ok, now);
  srs[key] = e;
  write(KEYS.srs, srs);
  appendLog({ key, ok: ok ? 1 : 0, t: now });
  return e;
}

/** Rebuilds the schedule by replaying the answer log under the current rules. Runs once per rule version. */
export function migrateSrs() {
  const FLAG = 'conjugar.srs.rules';
  const VERSION = '2'; // 2: early (not-yet-due) correct answers no longer advance the schedule
  try {
    if (localStorage.getItem(FLAG) === VERSION) return;
    const log = loadLog().slice().sort((a, b) => a.t - b.t);
    if (log.length) {
      const srs = {};
      for (const { key, ok, t } of log) srs[key] = applyAnswer(srs[key] ?? freshEntry(t), !!ok, t);
      write(KEYS.srs, srs);
    }
    localStorage.setItem(FLAG, VERSION);
  } catch {
    /* ignore */
  }
}

export function dueKeys(now = Date.now()) {
  const srs = loadSrs();
  return Object.entries(srs)
    .filter(([, e]) => e.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

/** Forms you got wrong the last time you saw them, most recent lapse first. */
export function mistakeKeys() {
  const srs = loadSrs();
  return Object.entries(srs)
    .filter(([, e]) => e.hist.length && e.hist[e.hist.length - 1] === 0)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

// ---------- answer log (for stats) ----------
export function loadLog() {
  return read(KEYS.log, []);
}
function appendLog(entry) {
  const log = loadLog();
  log.push(entry);
  // keep the log bounded
  if (log.length > 20000) log.splice(0, log.length - 20000);
  write(KEYS.log, log);
}

export function resetAll() {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

