# Vosotrosaurus

*Conjugations that refuse to let vosotros go extinct.*

A personal web app for drilling Spanish verb conjugations. Peninsular Spanish, vosotros included.
One HTML file, no account, no server: progress lives in the browser.

## Run it

**No install needed:** open `Vosotrosaurus.html` in a browser. It is a self-contained build of the
whole app and works from a `file://` URL.

`VosotrosaurusNew.html` is the same build with its storage namespaced, so it always opens as a
brand-new user. Use it to check the first-run experience without touching your progress.

With npm available (dev loop with hot reload):

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # engine spot checks (plain node, no deps)
npm run build     # dist/ + regenerates Vosotrosaurus.html, docs/index.html, VosotrosaurusNew.html
```

If npm is blocked on this machine, edit the source and have the build run elsewhere;
`npm run check` still works locally since it has no dependencies.

## Hosting (GitHub Pages)

The build also writes `docs/index.html`. In the GitHub repo: Settings → Pages → Source
"Deploy from a branch", branch `main`, folder `/docs`. The app is then live at
`https://<user>.github.io/<repo>/`. Each visitor's progress stays in their own browser.

## What's in v1

**Home.** The dino greets you with your streak, today's count against a daily goal (50), and what's
waiting: forms due for review, or mistakes to retry. Six cards: Review due · Mistakes · Practice ·
Verbs · Progress · Coming soon. A first-time visitor gets a welcome and a "Your first drill" card instead.

**Practice.** Three modes:
- *Custom*: pick tenses, a frequency tier (Top 25 / 50 / 100 / all 200), verb groups or specific verbs,
  persons, and a length (10 / 20 / 50 / ∞). Options (prompt language ES / EN / Both, strict accents,
  prioritise due reviews, verb-type hint) collapse to one line.
- *Due reviews*: only the forms spaced repetition says you're about to forget.
- *Mistakes*: only the forms you got wrong last time.

**Drill.** Verb + pronoun + tense, type the form, instant feedback: the full paradigm with irregular
letters highlighted, a one-line rule, your history with that exact form, and a link to see it in
context. The header fills left to right as you go; in ∞ mode each answer adds a green or red square
instead. No same verb twice in a row. Enter checks and advances, Esc skips, accent bar under the input.

**Verbs.** 200 verbs ranked by corpus frequency. Full table (one tense at a time on phones), irregular
parts highlighted. Click any form for an example sentence (ES + EN), why that tense fits, trigger
words, verb-specific notes (ser/ir share a pretérito, saber = "found out" in the pretérito…), and
the same verb + person in every other tense with contrast explainers. Each verb carries a level
tag (Unseen · Weak · Learning · Strong) from your own answers. Browse with `/` (search, tier, type
and level filters), step with `←` `→`.

**Progress.** Period (Today / 7 / 30 days / all time). Answered, accuracy, forms mastered. Bars by
tense, verb group and person, weakest first, with counts (thin samples greyed). Click a tense to
focus the whole page on it; click a group or person bar to drill exactly that; click a weak form or
a missed verb to study it.

**Spaced repetition.** Every (verb, tense, person) triple is an item. Right → 1 day → 4 days → × ease;
wrong → 10 minutes and the chain resets. "Mastered" means right on three spaced reviews in a row.
Only genuine spaced reviews move the schedule; answering a form early counts for accuracy but not
for its interval. The schedule can be rebuilt from the answer log, so rule changes replay history.

**Design.** Square chips, dashed rules, one green. Desktop and phone layouts for every screen
(bottom tab bar on phones, sticky Start bar in Practice). No audio: browser TTS voices were too
robotic; revisit with a neural TTS service later.

Everything is stored in `localStorage`, per browser, no account. Keys are `conjugar.*` (the app's
original name) and are kept stable across builds, so rebuilding never loses progress.

## Layout

```
src/
  data/verbs.js        verb list + metadata (add verbs here)
  data/usage.js        tense usage notes, contrasts, per-verb sentence context + English forms
  lib/conjugate.js     the engine: regular endings, stem changes, spelling changes, overrides
  lib/store.js         settings, SRS state, answer log (localStorage), log replay
  lib/questions.js     builds the pool per mode and draws questions
  lib/stats.js         derived stats for Home / Progress / Verbs
  lib/usage.js         generates the in-context example sentence for any form
  components/          Dropdown (single-select popover used by Progress and Browse)
  screens/             Home, Setup (Practice), Drill, Progress, Verbs
  App.jsx              hash router, top bar / tab bar, mascot
scripts/check-engine.mjs   spot checks: run after editing verbs.js
scripts/singlefile.mjs     inlines the Vite build into the three HTML files
```

## Adding a verb

Add an entry to `src/data/verbs.js`. Regular verbs need only `inf`, `rank`, `en`, `group`, `tags: []`.
Stem-changers add `stem: 'e>ie'` (etc.). Irregular yo forms use `yo:`. Anything else gets a full
6-form override (`pres`, `pret`, `imp`) or an irregular future stem (`fut`). Then `npm run check`.

## Roadmap (v2 ideas)

Subjuntivo + imperativo · compound tenses (haber + participio) · reflexives · contrast mode
(pretérito vs imperfecto) · sentence-gap questions · 60-second sprint · listen-and-type ·
say-it-aloud with the Web Speech API · per-tense grammar pages · progress export/import and
sync across devices · offline/PWA install · self-hosted fonts · mascot moods.
