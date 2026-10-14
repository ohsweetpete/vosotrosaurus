import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PERSONS, TENSES, verbTypeLabel } from '../data/verbs.js';
import { conjugate, highlight, checkAnswer, ruleNote, stemOf } from '../lib/conjugate.js';
import { makeDrawer, poolSize } from '../lib/questions.js';
import { recordAnswer, dueKeys } from '../lib/store.js';
import { formHistory } from '../lib/stats.js';
import { go, useIsMobile } from '../App.jsx';

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'];

/** Renders a form with its irregular letters highlighted. */
export function Form({ verb, tense, idx, forms }) {
  const [a, mid, b] = highlight(verb, tense, idx, forms[idx]);
  return (
    <>
      {a}
      {mid && <span className="irr">{mid}</span>}
      {b}
    </>
  );
}

function Paradigm({ q }) {
  const tense = TENSES.find((t) => t.id === q.tense);
  return (
    <div className="box left">
      <div className="eyebrow">Full paradigm · {tense.label}</div>
      <div className="paradigm">
        {PERSONS.map((p, i) => (
          <React.Fragment key={p}>
            <div className={`p ${i === q.personIdx ? 'hl' : ''}`}>{p}</div>
            <div className={i === q.personIdx ? 'hl' : ''}>
              <Form verb={q.verb} tense={q.tense} idx={i} forms={q.forms} />
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="muted sm paradigm-foot">
        Irregular parts highlighted in green.
      </div>
    </div>
  );
}

export default function Drill({ settings, setSettings }) {
  const isMobile = useIsMobile();
  const draw = useMemo(() => makeDrawer(settings), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState(() => draw());
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('ask'); // ask | feedback | done
  const [result, setResult] = useState(null); // { ok, accentOnly, finalOk }
  const [hint, setHint] = useState(false);
  const [n, setN] = useState(0);
  const [score, setScore] = useState({ ok: 0, bad: 0 });
  const [misses, setMisses] = useState([]);
  const [trail, setTrail] = useState([]); // true/false per answered question (∞ mode header beads)
  const inputRef = useRef(null);

  const pool = useMemo(() => poolSize(settings), []); // eslint-disable-line react-hooks/exhaustive-deps
  const total = settings.length ? Math.min(settings.length, pool) : 0;
  const tense = TENSES.find((t) => t.id === q.tense);
  const person = PERSONS[q.personIdx];

  useEffect(() => {
    if (phase === 'ask') inputRef.current?.focus();
  }, [phase, q]);


  const check = () => {
    if (!typed.trim()) return;
    const r = checkAnswer(typed, q.answer, { strictAccents: settings.strictAccents });
    setResult({ ...r, finalOk: r.ok });
    setPhase('feedback');
  };

  const commitAndNext = (finalOk) => {
    recordAnswer(q.key, finalOk);
    const nextN = n + 1;
    setScore((s) => ({ ok: s.ok + (finalOk ? 1 : 0), bad: s.bad + (finalOk ? 0 : 1) }));
    if (!finalOk) setMisses((m) => [...m, { verb: q.verb.inf, person, tense: tense.label, answer: q.answer, typed }]);
    setTrail((t) => [...t, finalOk]);
    setN(nextN);
    if (total && nextN >= total) {
      setPhase('done');
      return;
    }
    setQ(draw());
    setTyped('');
    setHint(false);
    setResult(null);
    setPhase('ask');
  };

  const skip = () => {
    setResult({ ok: false, accentOnly: false, finalOk: false, skipped: true });
    setPhase('feedback');
  };

  const insertAccent = (ch) => {
    const el = inputRef.current;
    if (!el) return setTyped((t) => t + ch);
    const start = el.selectionStart ?? typed.length;
    const end = el.selectionEnd ?? typed.length;
    const next = typed.slice(0, start) + ch + typed.slice(end);
    setTyped(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    });
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // keep this Enter from reaching the feedback screen's global listener
      check();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      skip();
    }
  };

  // Enter on the feedback screen advances. Bound to the drill container (not window), so
  // keystrokes inside a modal or dropdown elsewhere never reach it. The container is focused
  // when feedback appears so Enter works without clicking anything first.
  const drillRef = useRef(null);
  useEffect(() => {
    if (phase !== 'feedback') return undefined;
    const el = drillRef.current;
    if (!el) return undefined;
    el.focus({ preventScroll: true });
    const on = (e) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLAnchorElement)) {
        e.preventDefault();
        commitAndNext(result.finalOk);
      }
    };
    el.addEventListener('keydown', on);
    return () => el.removeEventListener('keydown', on);
  }); // re-bound each render so it sees fresh state

  const setPrompt = (promptLang) => setSettings({ ...settings, promptLang });

  const prompt = (big) => {
    const es = <div className={big ? 'verb-big' : 'verb-en'}>{q.verb.inf}</div>;
    const en = <div className={big ? 'verb-en big' : 'verb-en'}>{q.verb.en}</div>;
    if (settings.promptLang === 'en') return <>{en}{phase === 'feedback' && es}</>;
    if (settings.promptLang === 'both') return <>{es}{en}</>;
    return <>{es}{phase === 'feedback' && en}</>;
  };

  const langSeg = (
    <div className="seg drill-lang" role="group" aria-label="Prompt language">
      {[['es', 'ES'], ['en', 'EN'], ['both', 'Both']].map(([id, label]) => (
        <button key={id} type="button" className={`chip ${settings.promptLang === id ? 'on' : ''}`} aria-pressed={settings.promptLang === id} onClick={() => setPrompt(id)}>{label}</button>
      ))}
    </div>
  );

  // ---------- done ----------
  if (phase === 'done') {
    const pct = n ? Math.round((score.ok / n) * 100) : 0;
    const due = settings.mode === 'due' ? 0 : dueKeys().length;
    const again = () => { setN(0); setScore({ ok: 0, bad: 0 }); setMisses([]); setTrail([]); setQ(draw()); setTyped(''); setHint(false); setResult(null); setPhase('ask'); };
    const review = () => { setSettings({ ...settings, mode: 'due', length: due > 50 ? 50 : 0 }); again(); };
    return (
      <>
        <div className="drill-bar-wrap"><div className="drill-bar">
          <a href="#/" className="muted drill-quit">← Home</a>
          <div className="drill-count mono">{n} / {n}</div>
        </div></div>
        <div className="drill drill-done">
          <div className="done-head">
            <div className="eyebrow">Drill complete</div>
            <div className="done-score">{pct}%</div>
            <div className="muted md">{score.ok} right · {score.bad} missed · {n} {n === 1 ? 'question' : 'questions'}</div>
          </div>

          {misses.length > 0 && (
            <section className="done-misses">
              <div className="eyebrow">Missed this session</div>
              <div className="miss-list">
                {misses.map((m, i) => (
                  <a className="miss-row" key={i} href={`#/verbs/${m.verb}`}>
                    <span className="miss-what"><strong>{m.verb}</strong> · {m.person} · {m.tense}</span>
                    <span className="miss-fix mono">
                      <span className="wrong">{m.typed || '(blank)'}</span>
                      <span className="muted">→</span>
                      <span className="right">{m.answer}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="actions done-actions">
            {due > 0 ? (
              <button type="button" className="btn primary" onClick={review}>Review {due} due →</button>
            ) : (
              <button type="button" className="btn primary" onClick={again}>Again →</button>
            )}
            {due > 0 && <button type="button" className="btn ghost" onClick={again}>Again</button>}
            <a href="#/setup" className="btn ghost">Change setup</a>
            <a href="#/progress" className="btn ghost">Progress</a>
          </div>
        </div>
      </>
    );
  }

  // ---------- ask / feedback ----------
  const hist = phase === 'feedback' ? formHistory(q.key) : null;

  return (
    <>
      <div className="drill-bar-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={total || undefined} aria-valuenow={n}>
        {total > 0 && <div className="drill-fill" style={{ width: `${(n / total) * 100}%` }} />}
        <div className="drill-bar">
          <a href="#/setup" className="muted drill-quit">← Quit</a>
          {total === 0 && (
            <div className="drill-beads" aria-hidden="true">
              {trail.map((ok, i) => <span key={i} className={ok ? 'ok' : 'bad'} />)}
            </div>
          )}
          <div className="drill-count mono">{n + 1}{total ? ` / ${total}` : ''}</div>
        </div>
      </div>

      <div className="drill" ref={drillRef} tabIndex={-1}>
        <div className="tags">
          <span className="strong">{tense.label}</span>
          {!isMobile && <span>{tense.mood}</span>}
          {settings.showHints && <span>{verbTypeLabel(q.verb)}</span>}
          {q.due && <span className="tag-review">Review</span>}
          {q.isNew && <span className="tag-new">New</span>}
        </div>

        {phase === 'ask' && (
          <>
            <div>{prompt(true)}</div>

            <div className="answer-row">
              <label htmlFor="answer" className="pronoun">{person}</label>
              <input
                id="answer"
                ref={inputRef}
                className="answer-input"
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={onKey}
                placeholder="…"
              />
            </div>

            <div className="accents">
              {ACCENTS.map((ch) => (
                <button key={ch} type="button" onClick={() => insertAccent(ch)} aria-label={`Insert ${ch}`}>{ch}</button>
              ))}
            </div>

            {hint && (
              <div className="muted md">
                Stem: <span className="mono">{stemOf(q.verb)}-</span>
                {q.verb.stem && ` · ${q.verb.stem.replace('>', '→')}`}
                {q.verb.yo && q.tense === 'presente' && q.personIdx === 0 && ' · irregular yo'}
              </div>
            )}

            <div className="actions">
              <button type="button" className="btn primary" onClick={check} disabled={!typed.trim()}>Check</button>
              <button type="button" className="btn ghost" onClick={() => setHint(true)} disabled={hint}>Hint</button>
              <button type="button" className="btn ghost" onClick={skip}>Skip</button>
            </div>
            {langSeg}
          </>
        )}

        {phase === 'feedback' && (
          <div className="feedback">
            <div className="stack-lg">
              <div className="fb-head">
                <div className="verb-big fb-verb">
                  {q.verb.inf}{!isMobile && <span className="pronoun fb-person"> · {person}</span>}
                </div>
                {isMobile && <div className="pronoun fb-pronoun">{person}</div>}
                <div className="verb-en">{q.verb.en}</div>
              </div>

              <div className={`verdict ${result.finalOk ? 'ok' : 'bad'}`}>
                <div className="eyebrow verdict-label">
                  {result.skipped ? 'Skipped' : result.finalOk ? (result.accentOnly ? 'Correct (accent slip)' : 'Correct') : result.accentOnly ? 'Accent missing' : 'Not quite'}
                </div>
                <div className="pair">
                  {!result.skipped && (
                    <div>
                      <div className="l">You wrote</div>
                      <div className={`v ${result.finalOk ? '' : 'wrong'}`}>{typed}</div>
                    </div>
                  )}
                  <div>
                    <div className="l">Correct</div>
                    <div className="v right">
                      <Form verb={q.verb} tense={q.tense} idx={q.personIdx} forms={q.forms} />
                    </div>
                  </div>
                </div>
                <div className="md lh">{ruleNote(q.verb, q.tense, q.personIdx)}</div>
                <div className="links">
                  <a href={`#/verbs/${q.verb.inf}/${q.tense}/${q.personIdx}`} className="btn link sm">See it in context →</a>
                  {!result.finalOk && !result.skipped && (
                    <button type="button" onClick={() => setResult({ ...result, finalOk: true })}>Accept as typo</button>
                  )}
                </div>
              </div>

              <div className="actions actions-start">
                <button type="button" className="btn primary" onClick={() => commitAndNext(result.finalOk)}>
                  Next → <kbd className="kbd-hint kbd-on-primary">Enter</kbd>
                </button>
                <span className="muted sm">
                  {result.finalOk ? 'Scheduled for later review' : 'Added to review queue · back in ~10 min'}
                </span>
              </div>
            </div>

            <div className="stack">
              <Paradigm q={q} />
              {hist && hist.hist.length > 0 && (
                <div className="muted sm">
                  <span className="eyebrow block-eyebrow">Your history · {q.verb.inf} · {person} · {tense.label}</span>
                  <span className="mono">{hist.hist.map((h) => (h ? '✓' : '✗')).join(' ')}</span>
                  {' · '}
                  {Math.round((hist.hist.reduce((a, b) => a + b, 0) / hist.hist.length) * 100)}%
                  {hist.lastSeen && ` · last seen ${timeAgo(hist.lastSeen)}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isMobile && <div className="drill-foot">
        <span>
          {misses.length ? <>Last miss: <span className="mono">{misses[misses.length - 1].verb} · {misses[misses.length - 1].person} → {misses[misses.length - 1].answer}</span></> : 'No misses yet this session'}
        </span>
        <span className="kbd-hint">Keyboard: <kbd>Enter</kbd> check / next · <kbd>Esc</kbd> skip</span>
      </div>}
    </>
  );
}

function timeAgo(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export { conjugate };
