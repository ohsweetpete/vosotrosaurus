// Builds the question pool from settings and draws questions, favouring
// forms that are due for review and forms with a weak history.
import { VERBS, VERB_BY_INF, verbGroups } from '../data/verbs.js';
import { conjugate } from './conjugate.js';
import { formKey, parseKey, loadSrs, dueKeys, mistakeKeys } from './store.js';

export function matchingVerbs(settings) {
  if (settings.verbs && settings.verbs.length) {
    return settings.verbs.map((inf) => VERB_BY_INF[inf]).filter(Boolean);
  }
  const groups = new Set(settings.groups);
  const maxRank = settings.tier || Infinity;
  return VERBS.filter((v) => v.rank <= maxRank && verbGroups(v).some((g) => groups.has(g)));
}

/** 1.5× for the most common verb down to 1× for the rarest in the pool. */
function frequencyWeight(verb, verbs) {
  if (verbs.length < 2) return 1;
  const pos = verbs.indexOf(verb); // verbs are sorted by rank
  return 1.5 - 0.5 * (pos / (verbs.length - 1));
}

/** Every form key this drill may ask, according to the mode. */
export function poolKeys(settings, now = Date.now()) {
  if (settings.mode === 'due') return dueKeys(now);
  if (settings.mode === 'mistakes') return mistakeKeys();
  const out = [];
  for (const v of matchingVerbs(settings)) for (const t of settings.tenses) for (const p of settings.persons) out.push(formKey(v.inf, t, p));
  return out;
}

export function poolSize(settings) {
  return poolKeys(settings).length;
}

export function makeQuestion(inf, tense, personIdx) {
  const verb = VERB_BY_INF[inf];
  const forms = conjugate(verb, tense);
  return { verb, tense, personIdx, answer: forms[personIdx], forms, key: formKey(inf, tense, personIdx) };
}

/**
 * Returns a function next(prevKey) -> question. Keeps a small recent-history
 * buffer so the same form doesn't repeat back to back.
 */
export function makeDrawer(settings) {
  const allowed = new Set(poolKeys(settings));
  const verbs = settings.mode === 'custom' || !settings.mode
    ? matchingVerbs(settings)
    : VERBS.filter((v) => [...allowed].some((k) => parseKey(k).inf === v.inf));

  const recent = [];
  const remember = (k) => {
    recent.push(k);
    if (recent.length > 8) recent.shift();
  };

  const unseen = [...allowed].filter((k) => !loadSrs()[k]); // shrinks as forms get answered
  const verbOf = (k) => VERB_BY_INF[parseKey(k).inf];
  const pickWeighted = (keys, weightFn) => {
    const total = keys.reduce((a, k) => a + weightFn(k), 0);
    let r = Math.random() * total;
    for (const k of keys) {
      r -= weightFn(k);
      if (r <= 0) return k;
    }
    return keys[keys.length - 1];
  };
  // Don't ask the same verb twice in a row (unless the pool is a specific verb list,
  // or only one verb matches). Falls back to the unfiltered list if it would empty it.
  const specific = !!(settings.verbs && settings.verbs.length) || (settings.mode && settings.mode !== 'custom');
  let lastInf = null;
  let lastSlot = null; // `${tense}|${personIdx}` of the previous question
  // Never the same tense + person twice running: the ending would just be copied from
  // the last answer. Falls back to the unfiltered list if it would empty it.
  const otherSlot = (list) => {
    if (!lastSlot) return list;
    const out = list.filter((k) => { const { tense, personIdx } = parseKey(k); return `${tense}|${personIdx}` !== lastSlot; });
    return out.length ? out : list;
  };
  const fresh = (list) => {
    const notRecent = otherSlot(list.filter((k) => !recent.includes(k)));
    if (specific || verbs.length < 2 || !lastInf) return notRecent;
    const otherVerb = notRecent.filter((k) => parseKey(k).inf !== lastInf);
    return otherVerb.length ? otherVerb : notRecent;
  };

  return function next() {
    const now = Date.now();
    const srs = loadSrs(); // live: answers earlier this session count
    const dueAll = settings.prioritiseDue ? dueKeys(now).filter((k) => allowed.has(k) && !recent.includes(k)) : [];
    const due = fresh(dueAll);
    // 1. Forms you got wrong last time and that are due again come first
    //    (same verb as last question is fine here: it's the one giving trouble).
    const lapsed = otherSlot(dueAll.filter((k) => {
      const h = srs[k]?.hist ?? [];
      return h.length && h[h.length - 1] === 0;
    }));
    let k = null;
    if (lapsed.length) {
      k = lapsed[Math.floor(Math.random() * Math.min(lapsed.length, 3))];
    } else {
      // 2. Mostly untouched forms (common verbs first), some due reviews.
      const unseenFresh = fresh(unseen);
      const wantNew = unseenFresh.length && (!due.length || Math.random() < 0.7);
      if (wantNew) {
        k = pickWeighted(unseenFresh, (key) => frequencyWeight(verbOf(key), verbs));
        unseen.splice(unseen.indexOf(k), 1);
      } else if (due.length) {
        k = due[Math.floor(Math.random() * Math.min(due.length, 5))];
      }
    }
    if (!k) {
      // 3. Everything seen and nothing due: weighted random, weak forms and common verbs favoured.
      const pool = fresh([...allowed]);
      const list = pool.length ? pool : [...allowed];
      k = pickWeighted(list, (key) => {
        const e = srs[key];
        let w = 1;
        if (e) {
          const acc = e.hist.length ? e.hist.reduce((a, b) => a + b, 0) / e.hist.length : 1;
          w = acc < 0.6 ? 2 : acc < 0.85 ? 1.3 : 0.7;
        }
        return w * frequencyWeight(verbOf(key), verbs);
      });
    }
    remember(k);
    const { inf, tense, personIdx } = parseKey(k);
    lastInf = inf;
    lastSlot = `${tense}|${personIdx}`;
    const e = srs[k];
    return { ...makeQuestion(inf, tense, personIdx), due: !!(e && e.due <= now), isNew: !e };
  };
}
