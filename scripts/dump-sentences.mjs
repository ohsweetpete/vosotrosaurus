// Prints every verb × tense gap sentence (ES + EN) for a read-through.
// Run: node scripts/dump-sentences.mjs > sentences.txt
// Persons rotate across tenses so every subject shows up; pass --all for all 6 persons.
import { VERBS, TENSES } from '../src/data/verbs.js';
import { gapSentence, sentenceOk } from '../src/lib/sentences.js';

const all = process.argv.includes('--all');
let rot = 0;
for (const v of VERBS) {
  console.log(`\n## ${v.rank}. ${v.inf} (${v.en})`);
  for (const t of TENSES) {
    const persons = all ? [0, 1, 2, 3, 4, 5] : [rot++ % 6];
    for (const p of persons) {
      const s = gapSentence(v, t.id, p, { seed: `${v.inf}|${t.id}|${p}|dump`, tenses: TENSES.map((x) => x.id) });
      const flags = [!sentenceOk('gap', v.inf, t.id) && 'skip-gap', !sentenceOk('contrast', v.inf, t.id) && 'skip-contrast'].filter(Boolean).join(' ');
      console.log(`${t.id.padEnd(11)} ${s.es}\n${''.padEnd(11)} ${s.en}${flags ? `  [${flags}]` : ''}`);
    }
  }
}
