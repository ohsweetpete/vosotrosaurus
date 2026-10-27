import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VERBS, VERB_BY_INF, PERSONS, TENSES, GROUPS, TIERS, verbTypeTags, verbGroups } from '../data/verbs.js';
import { conjugate } from '../lib/conjugate.js';
import { verbStats, verbLevel, LEVELS } from '../lib/stats.js';
import { loadSrs, loadBrowse, saveBrowse } from '../lib/store.js';
import { Form } from './Drill.jsx';
import { go, startOneOffDrill, useIsMobile } from '../App.jsx';
import Dropdown, { usePopover } from '../components/Dropdown.jsx';
import { example, tenseUsage, contrast, specialNote, tenseLabel } from '../lib/usage.js';

/** Verbs matching the query (infinitive, meaning or any conjugated form) and the filters. */
function search(query, tier, group, level, levels) {
  const q = query.trim().toLowerCase();
  const out = [];
  for (const v of VERBS) {
    if (tier && v.rank > tier) continue;
    if (!verbGroups(v).some((g) => group.includes(g))) continue;
    if (!level.includes(levels[v.inf]?.level)) continue;
    if (!q) { out.push(v); continue; }
    if (v.inf.includes(q) || v.en.toLowerCase().includes(q)) { out.push(v); continue; }
    for (const t of TENSES) {
      if (conjugate(v, t.id).some((f) => f.startsWith(q))) { out.push(v); break; }
    }
  }
  return out;
}

const GROUP_SHORT = { 'regular-ar': '-ar', 'regular-er': '-er', 'regular-ir': '-ir', stem: 'Stem', spell: 'Spelling', irregular: 'Irregular' };
const GROUP_LABEL = { 'regular-ar': 'Regular -ar', 'regular-er': 'Regular -er', 'regular-ir': 'Regular -ir', stem: 'Stem-changers', spell: 'Spelling-changers', irregular: 'Irregulars' };

const TYPE_TAG = (v) => (v.tags.includes('irregular') ? 'irreg' : v.stem ? 'stem' : v.tags.includes('spell') ? 'spell' : `-${v.group}`);


const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** Dropdown with checkboxes and All / None. */
function MultiSelect({ label, all, options, values, onChange }) {
  const { open, setOpen, ref } = usePopover();
  const summary = values.length === options.length ? all
    : values.length === 0 ? 'None'
    : values.length === 1 ? options.find((o) => o.id === values[0])?.label
    : `${values.length} of ${options.length}`;
  return (
    <div className="select-wrap" ref={ref}>
      <span className="eyebrow">{label}</span>
      <button type="button" className={`select-btn ${open ? 'open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{summary}</span>
      </button>
      {open && (
        <div className="select-pop" role="listbox" aria-multiselectable="true" aria-label={label}>
          <div className="select-pop-tools">
            <button type="button" onClick={() => onChange(options.map((o) => o.id))}>All</button>
            <span>·</span>
            <button type="button" onClick={() => onChange([])}>None</button>
          </div>
          {options.map((o) => {
            const on = values.includes(o.id);
            return (
              <label key={o.id} className="select-opt" role="option" aria-selected={on}>
                <input type="checkbox" checked={on} onChange={() => onChange(toggle(values, o.id))} />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Search box + filter chips + ranked list. Used in the desktop sidebar and the phone picker sheet. */
function VerbPicker({ query, setQuery, tier, setTier, group, setGroup, level, setLevel, levels, list, current, onPick, autoFocus, selects }) {
  return (
    <div className="picker">
      <label className="search-field">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search verb, meaning or form"
          aria-label="Search verbs"
          autoFocus={autoFocus}
        />
        {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>✕</button>}
      </label>
      {selects ? (
        <div className="picker-selects">
          <Dropdown label="Tier" options={TIERS} value={tier} onChange={setTier} />
          <MultiSelect label="Type" all="All types" options={GROUPS.map((g) => ({ id: g.id, label: GROUP_LABEL[g.id] }))} values={group} onChange={setGroup} />
          <MultiSelect label="Level" all="All levels" options={LEVELS} values={level} onChange={setLevel} />
        </div>
      ) : (
      <div className="picker-filters">
        <div className="seg picker-seg" role="group" aria-label="Frequency tier">
          {TIERS.map((t) => (
            <button key={t.id} type="button" className={`chip ${tier === t.id ? 'on' : ''}`} aria-pressed={tier === t.id} onClick={() => setTier(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="chips picker-types" role="group" aria-label="Verb type">
          {GROUPS.map((g) => (
            <button key={g.id} type="button" className={`chip ${group.includes(g.id) ? 'on' : ''}`} aria-pressed={group.includes(g.id)} onClick={() => setGroup(toggle(group, g.id))}>
              {GROUP_SHORT[g.id]}
            </button>
          ))}
        </div>
        <div className="chips picker-levels" role="group" aria-label="Your level">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" className={`chip ${level.includes(l.id) ? 'on' : ''}`} aria-pressed={level.includes(l.id)} onClick={() => setLevel(toggle(level, l.id))}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
      )}
      <div className="muted pill-count">{list.length} {list.length === 1 ? 'verb' : 'verbs'} · ranked by frequency</div>
      <div className="verb-list">
        {list.map((v) => (
          <a key={v.inf} href={`#/verbs/${v.inf}`} className={v.inf === current ? 'active' : ''} onClick={onPick}>
            <span className="mono faint verb-rank">{v.rank}</span>
            <span className="verb-list-main">
              <span className="verb-list-inf">{v.inf}</span>
              <span className="muted verb-list-en">{v.en}</span>
            </span>
            <span className="mono faint verb-list-type">{TYPE_TAG(v)}</span>
            <span className={`level-dot level-${levels[v.inf]?.level ?? 'unseen'}`} aria-label={levels[v.inf]?.level} />
          </a>
        ))}
        {!list.length && <span className="muted sm no-match">No verbs match.</span>}
      </div>
    </div>
  );
}

export default function Verbs({ inf: param, settings, setSettings }) {
  // param = "pedir" or "pedir/preterito/5" (deep link to one form)
  const [inf, deepTense, deepPerson] = (param ?? '').split('/');
  const saved = useMemo(() => loadBrowse() || {}, []);
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState(saved.tier ?? 0);
  const [group, setGroup] = useState(() => saved.group ?? GROUPS.map((g) => g.id)); // multi-select, all on by default
  const [level, setLevel] = useState(() => saved.level ?? LEVELS.map((l) => l.id));
  useEffect(() => { saveBrowse({ tier, group, level }); }, [tier, group, level]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sel, setSel] = useState(() => (deepTense ? { tense: deepTense, personIdx: Number(deepPerson) || 0 } : null));
  const levels = useMemo(() => {
    const srs = loadSrs();
    return Object.fromEntries(VERBS.map((v) => [v.inf, verbLevel(v.inf, srs)]));
  }, []);
  const list = useMemo(() => search(query, tier, group, level, levels), [query, tier, group, level, levels]);
  const verb = VERB_BY_INF[inf] ?? list[0] ?? VERBS[0];
  const walk = list.includes(verb) ? list : VERBS; // ‹ › step within the current filter
  const idx = walk.indexOf(verb);
  const prev = walk[idx - 1];
  const next = walk[idx + 1];
  const touch = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, t: Date.now() }; };
  const onTouchEnd = (e) => {
    const s0 = touch.current; touch.current = null;
    if (!s0) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s0.x, dy = t.clientY - s0.y;
    if (Date.now() - s0.t > 600 || Math.abs(dx) < 60 || Math.abs(dy) > 40) return; // quick, mostly horizontal
    const target = dx < 0 ? next : prev;
    if (target) go(`verbs/${target.inf}`);
  };
  const stats = verbStats(verb.inf);
  const lvl = levels[verb.inf];
  const isSel = (t, i) => sel && sel.tense === t && sel.personIdx === i;
  const isMobile = useIsMobile();
  const [mobileTense, setMobileTense] = useState(deepTense || 'presente');
  const shownTenses = isMobile ? TENSES.filter((t) => t.id === mobileTense) : TENSES;
  useEffect(() => {
    const open = () => setPickerOpen(true);
    window.addEventListener('open-verb-picker', open);
    return () => window.removeEventListener('open-verb-picker', open);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if (e.key === '/' && !typing && !pickerOpen) { e.preventDefault(); setPickerOpen(true); }
      else if (e.key === 'Escape' && pickerOpen) setPickerOpen(false);
      else if (!typing && !pickerOpen && e.key === 'ArrowLeft' && prev) go(`verbs/${prev.inf}`);
      else if (!typing && !pickerOpen && e.key === 'ArrowRight' && next) go(`verbs/${next.inf}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    document.body.style.overflow = pickerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [pickerOpen]);
  useEffect(() => {
    if (sel && isMobile) setMobileTense(sel.tense);
  }, [sel, isMobile]);
  const pickTense = (t) => {
    setMobileTense(t);
    if (sel) setSel({ tense: t, personIdx: sel.personIdx });
  };
  useEffect(() => {
    if (!sel) return;
    const el = document.querySelector('.ctable .cell-btn[aria-pressed="true"]');
    if (el && isMobile) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [sel?.tense, sel?.personIdx, verb.inf]); // eslint-disable-line react-hooks/exhaustive-deps

  const drillThis = () => startOneOffDrill({ mode: 'custom', verbs: [verb.inf], length: 20 });

  return (
    <div className="verbs-layout">
      {pickerOpen && (
        <div className="sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false); }}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Browse verbs">
            <div className="sheet-head">
              <span className="sheet-title">Browse verbs</span>
              <button type="button" className="sheet-close" aria-label="Close" onClick={() => setPickerOpen(false)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <VerbPicker {...{ query, setQuery, tier, setTier, group, setGroup, level, setLevel, levels, list }} current={verb.inf} onPick={() => setPickerOpen(false)} autoFocus selects={!isMobile} />
          </div>
        </div>
      )}

      <div className="stack-lg" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="verb-head">
          <div>
            <div className="verb-title-row">
              <a href={prev ? `#/verbs/${prev.inf}` : undefined} className={`step ${prev ? '' : 'off'}`} aria-label={prev ? `Previous: ${prev.inf}` : 'First verb'}>‹</a>
              <div className="verb-big verb-title">{verb.inf}</div>
              <a href={next ? `#/verbs/${next.inf}` : undefined} className={`step ${next ? '' : 'off'}`} aria-label={next ? `Next: ${next.inf}` : 'Last verb'}>›</a>
            </div>
            <div className="verb-en verb-meaning">{verb.en}</div>
            <div className="tags verb-tags">
              <span className="strong">-{verb.group}</span>
              {verbTypeTags(verb).map((t) => <span key={t}>{t}</span>)}
            </div>
            <div className="muted verb-stats">
              {stats.n ? (
                <>
                  <div><span className={`level-dot level-${lvl.level}`} />{LEVELS.find((l) => l.id === lvl.level).label} · {lvl.mastered} of {lvl.seen} practiced {lvl.seen === 1 ? 'form' : 'forms'} mastered · {Math.round(stats.accuracy * 100)}% right</div>
                  {stats.weakest && (
                    <div>Weakest: {PERSONS[stats.weakest.personIdx]} · {TENSES.find((t) => t.id === stats.weakest.tense)?.label} ({Math.round(stats.weakest.acc * 100)}%)</div>
                  )}
                </>
              ) : <><span className="level-dot level-unseen" />Not practiced yet</>}
            </div>
          </div>
        </div>

        {isMobile && (
          <div className="seg tense-tabs" role="tablist" aria-label="Tense">
            {TENSES.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={mobileTense === t.id} className={`chip ${mobileTense === t.id ? 'on' : ''}`} onClick={() => pickTense(t.id)}>
                {t.label.replace('Condicional', 'Cond.').replace('Imperfecto', 'Imperf.')}
              </button>
            ))}
          </div>
        )}
        <div className="table-wrap">
          <div className="ctable" style={{ '--cols': shownTenses.length }}>
            <div className="th" />
            {shownTenses.map((t) => <div key={t.id} className="th">{t.label}</div>)}
            {PERSONS.map((p, i) => (
              <React.Fragment key={p}>
                <div className="p">{p}</div>
                {shownTenses.map((t) => {
                  const forms = conjugate(verb, t.id);
                  const on = isSel(t.id, i);
                  return (
                    <div key={t.id} className={`cell-wrap ${on ? 'on' : ''}`}>
                      <button
                        type="button"
                        className="cell-btn"
                        onClick={() => setSel(on ? null : { tense: t.id, personIdx: i })}
                        aria-pressed={on}
                        aria-label={`${forms[i]} in context`}
                      >
                        <Form verb={verb} tense={t.id} idx={i} forms={forms} />
                      </button>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {sel && (
          <ContextPanel verb={verb} tense={sel.tense} personIdx={sel.personIdx} onPick={(t) => setSel({ tense: t, personIdx: sel.personIdx })} />
        )}
        <div className="tap-row">
          <div className="muted tap-hint sm">
            {sel ? `${isMobile ? 'Tap' : 'Click'} another form, or the same one to close.` : `${isMobile ? 'Tap' : 'Click'} any form to see it in a sentence and when to use it.`}
          </div>
          {!isMobile && <button type="button" className="btn primary" onClick={drillThis}>Drill this verb →</button>}
        </div>

        <div className="box md lh">
          <div className="eyebrow">Pattern note</div>
          <PatternNote verb={verb} tense={isMobile ? mobileTense : null} />
        </div>
        {isMobile && (
          <button type="button" className="btn primary btn-block" onClick={drillThis}>Drill this verb →</button>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ verb, tense, personIdx, onPick }) {
  const forms = conjugate(verb, tense);
  const form = forms[personIdx];
  const person = PERSONS[personIdx];
  const ex = example(verb, tense, personIdx, form);
  const usage = tenseUsage(tense);
  const note = specialNote(verb, tense);
  const others = TENSES.filter((t) => t.id !== tense);

  return (
    <div className="box context">
      <div className="ctx-head">
        <div className="ctx-form">
          <Form verb={verb} tense={tense} idx={personIdx} forms={forms} />
        </div>
        <div className="mono muted md">{person} · {tenseLabel(tense)}</div>
      </div>

      <div>
        <div className="eyebrow mb6">In a sentence</div>
        <div className="ctx-es">{ex.es}</div>
        {ex.en && <div className="muted ctx-en">{ex.en}</div>}
      </div>

      <div className="md lh">
        <div className="eyebrow mb6">Why {tenseLabel(tense).toLowerCase()}</div>
        <div>{usage.use}</div>
        <div className="muted mt6">
          Trigger words: {usage.cues.map((c, i) => <span key={c}><em>{c}</em>{i < usage.cues.length - 1 ? ', ' : ''}</span>)}
        </div>
        {note && <div className="ctx-note">{note}</div>}
      </div>

      <div>
        <div className="eyebrow mb8">Same verb, same person, other tenses</div>
        <div className="other-tenses">
          {others.map((t) => {
            const f = conjugate(verb, t.id);
            const e = example(verb, t.id, personIdx, f[personIdx]);
            const c = contrast(tense, t.id);
            return (
              <React.Fragment key={t.id}>
                <button type="button" className="other-form" onClick={() => onPick(t.id)}>
                  <span className="other-form-word"><Form verb={verb} tense={t.id} idx={personIdx} forms={f} /></span>
                  <span className="mono muted xs">{tenseLabel(t.id)}</span>
                </button>
                <div>
                  <div>{e.es} <span className="muted">· {e.en}</span></div>
                  <div className="muted sm">Use when: {tenseUsage(t.id).short}.</div>
                  {c && <details className="contrast"><summary>{c.title}</summary><div className="contrast-body">{c.body}</div></details>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PatternNote({ verb, tense }) {
  // Each note: { tense, tag, text } → rendered as "Tense [Tag]: text" for easy scanning.
  const notes = [];
  const bootNote = (from, to) => `${from}→${to} in the "boot" (yo, tú, él, ellos); nosotros and vosotros keep the ${from}.`;
  if (verb.stem) {
    const [from, to] = verb.stem.split('>');
    notes.push({ tense: 'Presente', tag: 'Stem change', text: bootNote(from, to) });
    if (verb.group === 'ir') notes.push({ tense: 'Pretérito', tag: 'Stem change', text: `${from}→${from === 'o' ? 'u' : 'i'} in the 3rd persons only (él, ellos).` });
  }
  if (verb.yo) notes.push({ tense: 'Presente', tag: 'Irregular yo', text: `${verb.yo}; the other five persons follow the pattern.` });
  if (verb.tags.includes('spell')) notes.push({ tense: 'Pretérito', tag: 'Spelling', text: 'yo form ends -qué / -gué / -cé to keep the consonant sound.' });
  if (verb.pretStem) notes.push({ tense: 'Pretérito', tag: 'Strong stem', text: `${verb.pretStem}- + unstressed endings -e, -iste, -o, -imos, -isteis, -${verb.pretStem.endsWith('j') ? 'eron' : 'ieron'}. No accents on yo or él.` });
  else if (verb.pret) notes.push({ tense: 'Pretérito', tag: 'Irregular', text: 'the whole form changes; learn the six forms as a set.' });
  if (verb.imp) notes.push({ tense: 'Imperfecto', tag: 'Irregular', text: 'one of only three irregular verbs (ser, ir, ver).' });
  if (verb.fut) notes.push({ tense: 'Futuro / Cond.', tag: 'Irregular stem', text: `${verb.fut}- + the regular endings.` });
  if (verb.pres && !verb.yo && !verb.stem) notes.push({ tense: 'Presente', tag: 'Irregular', text: 'learn the six forms as a set.' });
  if (!notes.length) notes.push({ tense: 'All tenses', tag: 'Regular', text: `a model -${verb.group} verb; every form follows the pattern.` });
  const ORDER = ['All tenses', 'Presente', 'Pretérito', 'Imperfecto', 'Futuro / Cond.'];
  notes.sort((a, b) => ORDER.indexOf(a.tense) - ORDER.indexOf(b.tense));
  // On phones, show only the notes for the tense on screen.
  const TENSE_NAME = { presente: 'Presente', preterito: 'Pretérito', imperfecto: 'Imperfecto', futuro: 'Futuro / Cond.', condicional: 'Futuro / Cond.' };
  let shown = notes;
  if (tense) {
    const name = TENSE_NAME[tense];
    shown = notes.filter((n) => n.tense === name || n.tense === 'All tenses');
    if (!shown.length) shown = [{ tense: name, tag: 'Regular', text: `every form follows the regular -${verb.group} pattern.` }];
  }
  const family = VERBS.filter((v) => v.inf !== verb.inf && v.stem === verb.stem && v.group === verb.group && verb.stem).map((v) => v.inf);
  return (
    <div className="pattern-notes">
      {shown.map((n, i) => (
        <div className="pattern-note" key={i}>
          <span className="pattern-tense">{n.tense}</span>
          <span className="pattern-tag">{n.tag}</span>
          <span className="pattern-text">{n.text}</span>
        </div>
      ))}
      {family.length > 0 && (!tense || tense === 'presente' || (tense === 'preterito' && verb.group === 'ir')) && (
        <div className="pattern-note">
          <span className="pattern-tense">Family</span>
          <span className="pattern-tag">Same change</span>
          <span className="pattern-text">{family.join(', ')}.</span>
        </div>
      )}
    </div>
  );
}
