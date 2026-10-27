// Sanity checks for the gap sentences. Run: npm run check
import { VERBS, TENSES } from '../src/data/verbs.js';
import { gapSentence, sentenceOk } from '../src/lib/sentences.js';

let fails = 0, n = 0;
const fail = (msg) => { fails++; if (fails <= 30) console.log('FAIL', msg); };
for (const v of VERBS) for (const t of TENSES) for (let p = 0; p < 6; p++) {
  if (!sentenceOk('gap', v.inf, t.id)) continue;
  for (const contrast of [false, true]) {
    if (contrast && !(['preterito', 'imperfecto'].includes(t.id) && sentenceOk('contrast', v.inf, t.id))) continue;
    for (let seed = 0; seed < 4; seed++) {
      n++;
      const s = gapSentence(v, t.id, p, { seed, contrast });
      const where = `${v.inf} ${t.id} ${p} seed ${seed}${contrast ? ' contrast' : ''}`;
      if (!s) { fail(`${where}: no sentence`); continue; }
      if (s.es !== s.before + s.form + s.after) fail(`${where}: parts don't add up`);
      if (!s.en.trim() || /undefined|null|[{}]/.test(s.en + s.es)) fail(`${where}: bad text "${s.es}" / "${s.en}"`);
      if (s.before.toLowerCase().includes(s.form) && s.form.length > 2) fail(`${where}: answer visible before the gap`);
      if (s.cue.es.toLowerCase().split(/\s+/).includes(s.form)) fail(`${where}: cue contains the answer`);
      if (contrast && !s.cue.contrast) fail(`${where}: non-contrast cue`);
      if (/  |\s[.,]/.test(s.es) || /  |\s[.,]/.test(s.en)) fail(`${where}: spacing "${s.es}" / "${s.en}"`);
    }
  }
}
console.log(fails ? `${fails} sentence check(s) failed of ${n}` : `All ${n} sentence checks passed.`);
process.exit(fails ? 1 : 0);
