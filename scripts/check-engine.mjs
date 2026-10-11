// Sanity checks for the conjugation engine. Run: npm run check
import { VERBS, TENSES } from '../src/data/verbs.js';
import { conjugate } from '../src/lib/conjugate.js';

const expect = {
  'hablar/presente': ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
  'comer/preterito': ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron'],
  'vivir/imperfecto': ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivíais', 'vivían'],
  'pensar/presente': ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
  'volver/presente': ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'],
  'pedir/presente': ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
  'pedir/preterito': ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
  'dormir/preterito': ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
  'preferir/preterito': ['preferí', 'preferiste', 'prefirió', 'preferimos', 'preferisteis', 'prefirieron'],
  'seguir/presente': ['sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen'],
  'seguir/preterito': ['seguí', 'seguiste', 'siguió', 'seguimos', 'seguisteis', 'siguieron'],
  'jugar/presente': ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'],
  'jugar/preterito': ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugasteis', 'jugaron'],
  'buscar/preterito': ['busqué', 'buscaste', 'buscó', 'buscamos', 'buscasteis', 'buscaron'],
  'empezar/preterito': ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezasteis', 'empezaron'],
  'empezar/presente': ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
  'tener/presente': ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  'tener/preterito': ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
  'tener/futuro': ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
  'tener/condicional': ['tendría', 'tendrías', 'tendría', 'tendríamos', 'tendríais', 'tendrían'],
  'hacer/presente': ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
  'decir/presente': ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
  'venir/presente': ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
  'ser/imperfecto': ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
  'ir/presente': ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
  'ver/presente': ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
  'oír/futuro': ['oiré', 'oirás', 'oirá', 'oiremos', 'oiréis', 'oirán'],
  'hablar/futuro': ['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablaréis', 'hablarán'],
  'comer/condicional': ['comería', 'comerías', 'comería', 'comeríamos', 'comeríais', 'comerían'],
  'conocer/presente': ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
  'leer/preterito': ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'],
};

let fails = 0;
for (const [key, want] of Object.entries(expect)) {
  const [inf, tense] = key.split('/');
  const verb = VERBS.find((v) => v.inf === inf);
  if (!verb) { console.log(`MISSING VERB ${inf}`); fails++; continue; }
  const got = conjugate(verb, tense);
  if (got.join(' ') !== want.join(' ')) {
    fails++;
    console.log(`FAIL ${key}\n  got:  ${got.join(' ')}\n  want: ${want.join(' ')}`);
  }
}

// Every verb × tense must yield 6 non-empty strings.
for (const v of VERBS) {
  for (const t of TENSES) {
    const f = conjugate(v, t.id);
    if (!Array.isArray(f) || f.length !== 6 || f.some((x) => typeof x !== 'string' || !x)) {
      fails++;
      console.log(`BAD SHAPE ${v.inf}/${t.id}`, f);
    }
  }
}

// Duplicate infinitives?
const seen = new Set();
for (const v of VERBS) {
  if (seen.has(v.inf)) { fails++; console.log(`DUPLICATE ${v.inf}`); }
  seen.add(v.inf);
}

console.log(fails === 0
  ? `OK — ${Object.keys(expect).length} spot checks passed, ${VERBS.length} verbs × ${TENSES.length} tenses well-formed.`
  : `${fails} problem(s).`);
process.exit(fails ? 1 : 0);
