// Conjugation engine. Pure functions, no React.
//
// conjugate(verb, tenseId) -> [6 forms] in PERSONS order.
// regularForms(verb, tenseId) -> what the forms WOULD be if the verb were fully
//   regular; used to highlight the irregular letters in the UI.

const ENDINGS = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  preterito: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfecto: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
  // futuro / condicional attach to the whole infinitive (or an irregular stem)
  futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
  condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
};

const STEM_PERSONS = [0, 1, 2, 5]; // yo, tú, él, ellos — the "boot"
const PRET_IR_PERSONS = [2, 5]; // él, ellos

export function stemOf(verb) {
  return verb.inf.slice(0, -2);
}

/** Replace the LAST occurrence of `from` in `stem` with `to`. */
function changeStem(stem, from, to) {
  const i = stem.lastIndexOf(from);
  if (i < 0) return stem;
  return stem.slice(0, i) + to + stem.slice(i + from.length);
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Pretérito yo spelling for -car / -gar / -zar verbs. */
function spellPretYo(verb, stem) {
  if (verb.inf.endsWith('car')) return stem.slice(0, -1) + 'qué';
  if (verb.inf.endsWith('gar')) return stem.slice(0, -1) + 'gué';
  if (verb.inf.endsWith('zar')) return stem.slice(0, -1) + 'cé';
  return null;
}

export function regularForms(verb, tense) {
  const stem = stemOf(verb);
  const g = verb.group;
  if (tense === 'futuro' || tense === 'condicional') {
    const base = stripAccents(verb.inf);
    return ENDINGS[tense].map((e) => base + e);
  }
  return ENDINGS[tense][g].map((e) => stem + e);
}

export function conjugate(verb, tense) {
  // 1. Full overrides win.
  if (tense === 'presente' && verb.pres) return verb.pres;
  if (tense === 'preterito' && verb.pret) return verb.pret;
  if (tense === 'imperfecto' && verb.imp) return verb.imp;

  const stem = stemOf(verb);
  const g = verb.group;

  if (tense === 'futuro' || tense === 'condicional') {
    const base = verb.fut ?? stripAccents(verb.inf);
    return ENDINGS[tense].map((e) => base + e);
  }

  if (tense === 'imperfecto') {
    return ENDINGS.imperfecto[g].map((e) => stem + e);
  }

  if (tense === 'presente') {
    const [from, to] = verb.stem ? verb.stem.split('>') : [null, null];
    const changed = verb.stem ? changeStem(stem, from, to) : stem;
    return ENDINGS.presente[g].map((e, i) => {
      if (i === 0 && verb.yo) return verb.yo;
      const s = STEM_PERSONS.includes(i) ? changed : stem;
      return s + e;
    });
  }

  if (tense === 'preterito' && verb.pretStem) {
    // Strong pretérito: irregular stem + unstressed endings; -eron after j.
    const st = verb.pretStem;
    const endings = ['e', 'iste', 'o', 'imos', 'isteis', st.endsWith('j') ? 'eron' : 'ieron'];
    return endings.map((e, i) => verb.pretFix?.[i] ?? st + e);
  }

  if (tense === 'preterito') {
    // -ir stem-changers shift e→i / o→u in the 3rd persons only.
    let changed = stem;
    if (g === 'ir' && verb.stem) {
      const from = verb.stem[0];
      const to = from === 'o' ? 'u' : 'i';
      changed = changeStem(stem, from, to);
    }
    const spellYo = spellPretYo(verb, stem);
    return ENDINGS.preterito[g].map((e, i) => {
      if (i === 0 && spellYo) return spellYo;
      const s = PRET_IR_PERSONS.includes(i) ? changed : stem;
      return s + e;
    });
  }

  throw new Error(`Unknown tense: ${tense}`);
}

/**
 * Split a form into [prefix, irregularMiddle, suffix] by diffing against the
 * regular form. Empty middle = fully regular.
 */
export function irregularSpan(actual, regular) {
  if (actual === regular) return [actual, '', ''];
  let a = 0;
  while (a < actual.length && a < regular.length && actual[a] === regular[a]) a++;
  let b = 0;
  while (
    b < actual.length - a &&
    b < regular.length - a &&
    actual[actual.length - 1 - b] === regular[regular.length - 1 - b]
  ) b++;
  return [actual.slice(0, a), actual.slice(a, actual.length - b), actual.slice(actual.length - b)];
}

/**
 * Grammar-aware highlight: [prefix, irregularPart, suffix] for one form.
 * - suppletive tenses (verb.whole)          → whole word
 * - strong pretérito (verb.pretStem)        → the stem
 * - irregular future/conditional (verb.fut) → the stem
 * - everything else                         → letters that differ from the regular form;
 *   if the irregularity is a deletion (nothing to point at), whole word.
 */
export function highlight(verb, tense, idx, form) {
  if (verb.whole?.includes(tense)) return ['', form, ''];
  if (tense === 'preterito' && verb.pretStem) {
    const n = verb.pretStem.length; // hizo: 'hiz' is the stem slot
    return ['', form.slice(0, n), form.slice(n)];
  }
  if ((tense === 'futuro' || tense === 'condicional') && verb.fut) {
    return ['', form.slice(0, verb.fut.length), form.slice(verb.fut.length)];
  }
  if (tense === 'presente' && verb.stem && STEM_PERSONS.includes(idx) && !(idx === 0 && verb.yo)) {
    // Highlight the whole changed vowel (ie / ue / i), not just the inserted letter.
    const [from, to] = verb.stem.split('>');
    const at = stemOf(verb).lastIndexOf(from);
    if (at >= 0) return [form.slice(0, at), form.slice(at, at + to.length), form.slice(at + to.length)];
  }
  const regular = regularForms(verb, tense)[idx];
  const span = irregularSpan(form, regular);
  if (form !== regular && !span[1]) return ['', form, ''];
  return span;
}

/**
 * Compare a typed answer with the correct form.
 * Returns { ok, accentOnly } — accentOnly is true when the only difference is diacritics.
 */
export function checkAnswer(typed, correct, { strictAccents = true } = {}) {
  const t = typed.trim().toLowerCase();
  const c = correct.toLowerCase();
  if (t === c) return { ok: true, accentOnly: false };
  const accentOnly = stripAccents(t) === stripAccents(c);
  return { ok: accentOnly && !strictAccents, accentOnly };
}

/** One-line rule note shown on a miss. Keep these short and pattern-level. */
export function ruleNote(verb, tense, personIdx) {
  if (tense === 'presente' && verb.stem) {
    if (STEM_PERSONS.includes(personIdx)) {
      return `Stem change ${verb.stem.replace('>', '→')} in the "boot" (yo, tú, él, ellos); nosotros and vosotros keep the original stem.`;
    }
    return `Nosotros and vosotros keep the infinitive's stem; the ${verb.stem.replace('>', '→')} change only hits yo, tú, él, ellos.`;
  }
  if (tense === 'presente' && verb.yo && personIdx === 0) {
    return `Irregular yo form (${verb.yo}); the other persons follow the regular pattern.`;
  }
  if (tense === 'preterito' && verb.pretStem) {
    return 'Strong pretérito: irregular stem with unstressed endings (-e, -iste, -o, -imos, -isteis, -ieron). No written accents on yo or él.';
  }
  if (tense === 'preterito' && verb.group === 'ir' && verb.stem) {
    return `-ir stem-changers shift ${verb.stem[0]}→${verb.stem[0] === 'o' ? 'u' : 'i'} in the 3rd person only (él, ellos) in the pretérito.`;
  }
  if (tense === 'preterito' && verb.tags.includes('spell') && personIdx === 0) {
    return 'Spelling change in the yo form to keep the sound: -car → -qué, -gar → -gué, -zar → -cé.';
  }
  if (tense === 'preterito' && verb.group === 'ar') {
    return 'Regular -ar pretérito: -é, -aste, -ó, -amos, -asteis, -aron. Watch the accents on yo and él.';
  }
  if (tense === 'preterito') {
    return 'Regular -er/-ir pretérito: -í, -iste, -ió, -imos, -isteis, -ieron.';
  }
  if (tense === 'imperfecto') {
    if (verb.imp) return 'One of only three irregular imperfectos (ser, ir, ver).';
    return verb.group === 'ar'
      ? 'Regular -ar imperfecto: -aba, -abas, -aba, -ábamos, -abais, -aban. Only nosotros takes an accent.'
      : 'Regular -er/-ir imperfecto: -ía, -ías, -ía, -íamos, -íais, -ían. Every form carries the accent on í.';
  }
  if (tense === 'futuro') {
    return verb.fut
      ? `Irregular future stem (${verb.fut}-), regular endings: -é, -ás, -á, -emos, -éis, -án.`
      : 'Futuro = whole infinitive + -é, -ás, -á, -emos, -éis, -án. Nosotros is the only form without an accent.';
  }
  if (tense === 'condicional') {
    return verb.fut
      ? `Same irregular stem as the future (${verb.fut}-) + -ía, -ías, -ía, -íamos, -íais, -ían.`
      : 'Condicional = whole infinitive + -ía, -ías, -ía, -íamos, -íais, -ían.';
  }
  return '';
}
