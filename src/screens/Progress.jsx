import React, { useState } from 'react';
import { TENSES, PERSONS } from '../data/verbs.js';
import { summary, byPerson, byTense, byGroup, mostMissed, weakestForms } from '../lib/stats.js';
import { resetAll, loadSettings, saveSettings } from '../lib/store.js';
import { go, useIsMobile } from '../App.jsx';
import Dropdown from '../components/Dropdown.jsx';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 7, label: 'Last 7 days' },
  { id: 30, label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];
const MIN_N = 5; // below this a bar is shown greyed: not enough answers to mean much
const PERSON_SHORT = ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'vosotros', 'ellos/Uds.'];


/** Label | bar | "72% · 180". Weakest first; thin samples greyed and last. */
function Bars({ rows, onPick, active, keepOrder, wide, clickOn = 'meter' }) {
  const sorted = [...rows]
    .filter((r) => r.n > 0)
    .sort(keepOrder ? () => 0 : (a, b) => (a.n < MIN_N) - (b.n < MIN_N) || a.ok / a.n - b.ok / b.n || b.n - a.n);
  if (!sorted.length) return <div className="muted md">Nothing in this period yet.</div>;
  return (
    <div className="bars">
      {sorted.map((r) => {
        const acc = r.ok / r.n;
        const thin = r.n < MIN_N;
        const cls = thin ? 'thin' : acc < 0.7 ? 'weak' : '';
        const label = <span className="bar-label">{r.label}</span>;
        const meter = (
          <>
            <div className="bar"><div className={cls} style={{ width: `${acc * 100}%` }} /></div>
            <span className={`mono bar-num ${thin ? 'muted' : ''}`}><span>{Math.round(acc * 100)}%</span><small>·</small><small>{r.n}</small></span>
          </>
        );
        const rowCls = `hbar bar-row ${wide ? 'wide' : ''} ${active === r.id ? 'active' : ''}`;
        // Tense rows: the word is the control (it focuses the page). Everything else: the bar + numbers are.
        return clickOn === 'label' ? (
          <div key={r.id} className={rowCls}>
            <button type="button" className="bar-click bar-click-label" title={`${r.ok}/${r.n} correct`} onClick={() => onPick(r)}>{label}</button>
            {meter}
          </div>
        ) : (
          <div key={r.id} className={rowCls}>
            {label}
            <button type="button" className="bar-click bar-click-meter" title={`${r.ok}/${r.n} correct`} onClick={() => onPick(r)}>{meter}</button>
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, children, tag, onClear, action, hint }) {
  return (
    <section className="prow">
      <div className="eyebrow prow-label">
        <span>{label}</span>
        {hint && <span className="prow-hint">{hint}</span>}
        {tag && <button type="button" className="prow-tag" onClick={onClear} title="Clear tense focus">{tag} ✕</button>}
        {action}
      </div>
      <div className="prow-body">{children}</div>
    </section>
  );
}

export default function Progress() {
  const [days, setDays] = useState(30);
  const [tenseFilter, setTenseFilter] = useState(null);
  const isMobile = useIsMobile();
  const s = summary(days);
  const tenses = byTense(days).map((t) => ({ id: t.tense.id, label: t.tense.label, n: t.n, ok: t.ok }));
  const tf = tenseFilter;
  const groups = byGroup(days, tf).map((g) => ({ id: g.group.id, label: g.group.label.replace('-changers', ''), n: g.n, ok: g.ok }));
  const persons = byPerson(days, tf).map((p, i) => ({ id: i, label: PERSON_SHORT[i], n: p.n, ok: p.ok }));
  const weakest = weakestForms(5, days, 3, tf);
  const missed = mostMissed(5, days, tf).map((m) => ({ id: m.inf, label: m.inf, n: m.n, ok: m.ok, inf: m.inf }));
  const tfLabel = tf ? TENSES.find((t) => t.id === tf)?.label : null;
  const withTense = (patch) => (tf ? { tenses: [tf], ...patch } : patch);

  const drill = (patch) => {
    const st = loadSettings();
    saveSettings({ ...st, mode: 'custom', verbs: [], length: 20, ...patch });
    go('drill');
  };
  const tLabel = (id) => TENSES.find((t) => t.id === id)?.label ?? id;

  const periodSelect = (
    <Dropdown label="Period" variant="text" align={isMobile ? 'center' : 'right'} options={PERIODS} value={days} onChange={setDays} />
  );

  return (
    <div className="progress">
      <div className="prog-head">
        <h1 className="page-title">Progress</h1>
        {periodSelect}
      </div>

      <div className="stat-strip">
        <div className="stat-tile"><span className="eyebrow">Answered</span><span className="stat-value">{s.answered.toLocaleString()}</span></div>
        <div className="stat-tile"><span className="eyebrow">Accuracy</span><span className="stat-value">{s.answered ? `${Math.round(s.accuracy * 100)}%` : '–'}</span></div>
        <div className="stat-tile" title="A form (one verb, tense and person) is mastered after 3 right answers in a row, spaced a day and then 4 days apart."><span className="eyebrow">Forms mastered</span><span className="stat-value">{s.mastered}<small>of {s.practised} practiced</small></span></div>
      </div>

      <div className="muted prog-legend">
        {isMobile ? 'Tap' : 'Click'} a tense name to focus the page on it · a bar to drill it · a form's or verb's bar to study it
      </div>

      <Row label="By tense">
        <Bars rows={tenses} onPick={(r) => setTenseFilter(tf === r.id ? null : r.id)} active={tf} clickOn="label" />
      </Row>
      <Row label="By verb group" tag={tfLabel} onClear={() => setTenseFilter(null)}>
        <Bars rows={groups} onPick={(r) => drill(withTense({ groups: [r.id] }))} />
      </Row>
      <Row label="By person" tag={tfLabel} onClear={() => setTenseFilter(null)}>
        <Bars rows={persons} onPick={(r) => drill(withTense({ persons: [r.id] }))} />
      </Row>

      <Row label="Weakest forms" hint="in this period" tag={tfLabel} onClear={() => setTenseFilter(null)}>
        {weakest.length ? (
          <Bars
            wide
            keepOrder
            rows={weakest.map((f) => ({ id: f.key, n: f.n, ok: f.ok, key: f.key, inf: f.inf, tense: f.tense, personIdx: f.personIdx, label: <><strong>{f.inf}</strong> · {PERSON_SHORT[f.personIdx]} · {tLabel(f.tense)}</> }))}
            onPick={(r) => go(`verbs/${r.inf}/${r.tense}/${r.personIdx}`)}
          />
        ) : <div className="muted md">Needs at least 3 answers per form before anything shows here.</div>}
      </Row>

      <Row
        label="Most-missed verbs"
        hint="in this period"
        tag={tfLabel}
        onClear={() => setTenseFilter(null)}
        action={missed.length > 0 && <button type="button" className="prow-action" onClick={() => drill(withTense({ verbs: missed.map((m) => m.inf) }))}>Drill these {missed.length} →</button>}
      >
        {missed.length ? (
          <>
            <Bars rows={missed} onPick={(r) => go(`verbs/${r.inf}`)} keepOrder />

          </>
        ) : <div className="muted md">No misses in this period.</div>}
      </Row>

      <div className="muted prog-foot">
        Stored in this browser only ·{' '}
        <button
          type="button"
          className="btn link danger-link"
          onClick={() => {
            const typed = window.prompt('This deletes every answer, your schedule and your settings in this browser. There is no undo.\n\nType RESET to confirm.');
            if (typed && typed.trim().toUpperCase() === 'RESET') { resetAll(); window.location.reload(); }
          }}
        >
          Reset all data
        </button>
      </div>
    </div>
  );
}
