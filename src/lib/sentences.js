// Gap sentences for the Sentences and Contrast modes:
// "Ayer, nosotros ____ (cenar) con la familia." built from VERB_CTX + CUE_BANK.
import { VERB_CTX, CUE_BANK, SENTENCE_SKIP, STATE_VERBS } from '../data/usage.js';
import { enVerb, esComplement, enComplement } from './usage.js';
import { conjugate } from './conjugate.js';

// Spanish subject per person; 3rd person rotates. enIdx is the English person for the verb
// (usted / ustedes take Spanish 3rd person but English "you").
export const SUBJECTS = [
  [{ es: 'yo', en: 'I', enIdx: 0, poss: 'my' }],
  [{ es: 'tú', en: 'you', enIdx: 1, poss: 'your' }],
  [{ es: 'él', en: 'he', enIdx: 2, poss: 'his' }, { es: 'ella', en: 'she', enIdx: 2, poss: 'her' }, { es: 'usted', en: 'you', enIdx: 1, poss: 'your' }],
  [{ es: 'nosotros', en: 'we', enIdx: 3, poss: 'our' }],
  [{ es: 'vosotros', en: 'you all', enIdx: 4, poss: 'your' }],
  [{ es: 'ellos', en: 'they', enIdx: 5, poss: 'their' }, { es: 'ellas', en: 'they', enIdx: 5, poss: 'their' }, { es: 'ustedes', en: 'you all', enIdx: 4, poss: 'your' }],
]

const SKIP = {
  gap: new Set(SENTENCE_SKIP.gap),
  contrast: new Set(SENTENCE_SKIP.contrast),
};

/** False when this verb × tense is excluded from a sentence mode ('gap' | 'contrast'). */
export function sentenceOk(mode, inf, tense) {
  const s = SKIP[mode];
  return !!VERB_CTX[inf] && !s.has(inf) && !s.has(`${inf}|${tense}`);
}

const STATE = new Set(STATE_VERBS);

// Complements that already carry a time phrase ("café por la mañana", "a casa temprano"):
// the cue goes in front so the two don't pile up at the end.
const TIMED = /\b(mañana|tarde|noche|temprano|a las|domingo|primavera|de repente)\b/;
const words = (s) => s.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Small seeded PRNG so one question always renders the same sentence. */
function rng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];

/**
 * { before, after, es, en, cue, subject, form } for one form.
 * before + form + after = the full Spanish sentence; the UI draws the gap between them.
 * opts.seed: anything stable per question. opts.contrast: only use contrast-safe cues.
 */
export function gapSentence(verb, tense, personIdx, opts = {}) {
  const ctx = VERB_CTX[verb.inf];
  if (!ctx) return null;
  const r = rng(opts.seed ?? `${verb.inf}|${tense}|${personIdx}`);
  const ctxWords = new Set(words(ctx.es));
  const all = CUE_BANK[tense].filter((c) => !words(c.es).some((w) => ctxWords.has(w))); // no "mañana … por la mañana"
  const timed = TIMED.test(ctx.es);
  const narrowed = all
    .filter((c) => !opts.contrast || c.contrast)
    .filter((c) => !timed || c.pos !== 'back')
    .filter((c) => !STATE.has(verb.inf) || c.state);
  const cue = pick(r, narrowed.length ? narrowed : all.length ? all : CUE_BANK[tense]);
  const subject = pick(r, SUBJECTS[personIdx]);
  const front = cue.pos === 'front' || (cue.pos === 'either' && (timed || r() < 0.5));
  const form = conjugate(verb, tense)[personIdx];
  const enV = enVerb(ctx, tense, subject.enIdx);

  const esC = esComplement(ctx, personIdx);
  const enC = enComplement(ctx, subject.poss);

  let before, after, en;
  if (front) {
    before = `${cap(cue.es)}, ${subject.es} `;
    after = ` ${esC}.`;
    en = `${cap(cue.en)}, ${subject.en} ${enV} ${enC}.`;
  } else {
    before = `${cap(subject.es)} `;
    after = ` ${esC} ${cue.es}.`;
    en = `${cap(subject.en)} ${enV} ${enC} ${cue.en}.`;
  }
  return { before, after, es: before + form + after, en, cue, subject, form, front };
}
