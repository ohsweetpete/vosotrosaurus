// Builds the "form in context" content: one generated sentence per form plus
// the explanatory notes from src/data/usage.js.
import { TENSE_USAGE, CONTRASTS, CUES, EN_SUBJECT, VERB_CTX, SPECIAL_NOTES } from '../data/usage.js';
import { TENSES } from '../data/verbs.js';

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function enVerb(ctx, tense, personIdx) {
  const v = ctx.enV;
  const base = Array.isArray(v) ? v[0] : v.base;
  const third = Array.isArray(v) ? v[1] : null;
  const past = Array.isArray(v) ? v[2] : v.past;
  const pick = (x) => (Array.isArray(x) ? x[personIdx] : x);
  switch (tense) {
    case 'presente':
      if (Array.isArray(v)) return personIdx === 2 ? third : base;
      return pick(v.pres);
    case 'preterito':
      return pick(past);
    case 'imperfecto':
      return ctx.enImp ?? `used to ${base}`;
    case 'futuro':
      return ctx.enFut ?? `will ${base}`;
    case 'condicional':
      return ctx.enCond ?? `would ${base}`;
    default:
      return base;
  }
}

/** { es, en } example sentence for this exact form. */
export function example(verb, tense, personIdx, form) {
  const ctx = VERB_CTX[verb.inf];
  const cue = CUES[tense];
  if (!ctx) return { es: `${cap(form)} ${cue.es}.`, en: '' };
  const es = `${cap(form)} ${ctx.es} ${cue.es}.`;
  const subj = EN_SUBJECT[personIdx];
  const en = `${cap(subj)} ${enVerb(ctx, tense, personIdx)} ${ctx.en} ${cue.en}.`;
  return { es, en };
}

export function tenseUsage(tense) {
  return TENSE_USAGE[tense];
}

export function contrast(a, b) {
  return CONTRASTS[`${a}|${b}`] ?? CONTRASTS[`${b}|${a}`] ?? null;
}

export function specialNote(verb, tense) {
  return SPECIAL_NOTES[`${verb.inf}|${tense}`] ?? VERB_CTX[verb.inf]?.note ?? null;
}

export function tenseLabel(id) {
  return TENSES.find((t) => t.id === id)?.label ?? id;
}
