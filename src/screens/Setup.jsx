import React, { useMemo, useState } from 'react';
import { TENSES, GROUPS, PERSONS, VERBS, TIERS } from '../data/verbs.js';
import { poolSize, matchingVerbs } from '../lib/questions.js';
import { dueKeys, mistakeKeys, loadDrillDefaults, saveDrillDefaults, drillDefaults, sameDrillSettings } from '../lib/store.js';
import { go, useIsMobile } from '../App.jsx';

function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const LENGTHS = [
  { id: 10, label: '10' },
  { id: 20, label: '20' },
  { id: 50, label: '50' },
  { id: 0, label: '∞' },
];

const GROUP_LABEL = {
  'regular-ar': 'Regular -ar',
  'regular-er': 'Regular -er',
  'regular-ir': 'Regular -ir',
  stem: 'Stem-changers',
  spell: 'Spelling-changers',
  irregular: 'Irregulars',
};

const PERSON_SHORT = ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'vosotros', 'ellos/Uds.'];

const MODES = [
  { id: 'custom', label: 'Custom' },
  { id: 'due', label: 'Due reviews' },
  { id: 'mistakes', label: 'Mistakes' },
];

/** Single-select control: bordered cells, one black. */
function Segmented({ options, value, onChange, label, cols, fit }) {
  return (
    <div className="segmented" role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, ${fit ? 'auto' : '1fr'})` }}>
      {options.map((o) => (
        <button key={o.id} type="button" className={`chip ${value === o.id ? 'on' : ''}`} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Multi-select control: chips sized to their text, black when on. */
function ChipRow({ options, values, onToggle, label, mono }) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`chip ${mono ? 'mono' : ''} ${values.includes(o.id) ? 'on' : ''}`}
          aria-pressed={values.includes(o.id)}
          onClick={() => onToggle(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Label({ children }) {
  return <div className="eyebrow setup-label"><span>{children}</span></div>;
}

function OptionRow({ label, hint, children }) {
  return (
    <div className="option-row">
      <div className="option-label">
        <div>{label}</div>
        {hint && <div className="muted xs">{hint}</div>}
      </div>
      <div className="option-control">{children}</div>
    </div>
  );
}

export default function Setup({ settings, setSettings }) {
  const isMobile = useIsMobile();
  const [verbText, setVerbText] = useState(settings.verbs.join(', '));
  const [optionsOpen, setOptionsOpen] = useState(false);
  const set = (patch) => setSettings({ ...settings, ...patch });
  const mode = settings.mode || 'custom';
  const [savedDefaults, setSavedDefaults] = useState(loadDrillDefaults);
  const [justSaved, setJustSaved] = useState(false);
  const isDefault = sameDrillSettings(settings, drillDefaults());
  const saveDefault = () => { setSavedDefaults(saveDrillDefaults(settings)); setJustSaved(true); setTimeout(() => setJustSaved(false), 1500); };
  const resetDefault = () => { const d = drillDefaults(); setVerbText((d.verbs || []).join(', ')); set(d); };

  const applyVerbText = (text) => {
    setVerbText(text);
    const wanted = text.split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    set({ verbs: wanted.filter((w) => VERBS.some((v) => v.inf === w)) });
  };
  const unknown = useMemo(() => {
    const wanted = verbText.split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    return wanted.filter((w) => !VERBS.some((v) => v.inf === w));
  }, [verbText]);

  const due = useMemo(() => dueKeys().length, []);
  const mistakes = useMemo(() => mistakeKeys().length, []);
  const { nVerbs, pool } = useMemo(
    () => ({ nVerbs: matchingVerbs(settings).length, pool: poolSize(settings) }),
    [settings.mode, settings.tier, settings.groups, settings.verbs, settings.tenses, settings.persons], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const canStart = mode === 'custom'
    ? settings.tenses.length > 0 && settings.persons.length > 0 && nVerbs > 0
    : pool > 0;
  const capped = settings.length > 0 && pool > 0 && pool < settings.length;

  const note = !canStart
    ? mode === 'custom'
      ? 'Pick at least one tense, one person and one verb group.'
      : mode === 'due' ? 'Nothing is due for review right now.' : 'No outstanding mistakes. Nice.'
    : capped
      ? `Only ${pool} forms match, so this drill will be ${pool} questions.`
      : null;

  const promptSeg = (
    <Segmented
      label="Prompt language"
      fit={!isMobile}
      options={[{ id: 'es', label: 'ES' }, { id: 'en', label: 'EN' }, { id: 'both', label: 'Both' }]}
      value={settings.promptLang}
      onChange={(id) => set({ promptLang: id })}
    />
  );
  const optionSummary = [
    { es: 'Spanish prompt', en: 'English prompt', both: 'Both prompts' }[settings.promptLang],
    settings.strictAccents ? 'strict accents' : 'lenient accents',
    settings.prioritiseDue ? 'due first' : null,
    settings.showHints ? 'hints on' : 'hints off',
  ].filter(Boolean).join(' · ');

  const lengthSeg = <Segmented label="Drill length" options={LENGTHS} value={settings.length} onChange={(id) => set({ length: id })} fit={!isMobile} />;
  const startBtn = (
    <button type="button" className="btn primary setup-start" disabled={!canStart} onClick={() => go('drill')}>
      Start drill →
    </button>
  );
  const noteEl = note && <div className={`setup-note ${canStart ? 'muted' : 'danger'}`}>{note}</div>;

  return (
    <div className="grid grid-sidebar setup">
      <div className="setup-col">
        <div className="setup-head">
          <h1 className="page-title">Set up a drill</h1>
          <div className="setup-defaults">
            {justSaved ? (
              <span className="muted">Saved ✓</span>
            ) : isDefault ? (
              <span className="muted">{savedDefaults ? 'Your default' : 'App default'}</span>
            ) : (
              <>
                <button type="button" onClick={saveDefault}>Save as default</button>
                <span className="muted">·</span>
                <button type="button" onClick={resetDefault}>Reset</button>
              </>
            )}
          </div>
        </div>

        <section className="box setup-modes">
          <Label>Mode</Label>
          <div className="chip-row" role="group" aria-label="Drill mode">
            {MODES.map((m) => {
              const n = m.id === 'due' ? due : m.id === 'mistakes' ? mistakes : null;
              return (
                <button key={m.id} type="button" className={`chip ${mode === m.id ? 'on' : ''}`} aria-pressed={mode === m.id} onClick={() => set({ mode: m.id })}>
                  {m.label}{n != null && <span className="chip-count">{n}</span>}
                </button>
              );
            })}
          </div>
        </section>

        {mode === 'custom' ? (
          <>
            <section className="box">
              <Label>Tenses</Label>
              <ChipRow label="Tenses" options={TENSES.map((t) => ({ id: t.id, label: t.label }))} values={settings.tenses} onToggle={(id) => set({ tenses: toggle(settings.tenses, id) })} />
            </section>

            <section className="box">
              <Label>Verbs</Label>
              <Segmented label="Frequency tier" options={TIERS} value={settings.tier} onChange={(id) => set({ tier: id })} fit={!isMobile} />
              <ChipRow
                label="Verb groups"
                options={GROUPS.map((g) => ({ id: g.id, label: GROUP_LABEL[g.id] }))}
                values={settings.verbs.length ? [] : settings.groups}
                onToggle={(id) => set({ groups: toggle(settings.groups, id) })}
              />
              <div className="specific-row">
                <input
                  id="pick"
                  type="text"
                  value={verbText}
                  placeholder="…or specific verbs: tener, ir, hacer"
                  aria-label="Specific verbs"
                  onChange={(e) => applyVerbText(e.target.value)}
                />
                {settings.verbs.length > 0 && (
                  <button type="button" className="btn ghost small" onClick={() => applyVerbText('')}>Clear</button>
                )}
              </div>
              {settings.verbs.length > 0 && (
                <div className="muted sm">Drilling {settings.verbs.length} specific {settings.verbs.length === 1 ? 'verb' : 'verbs'}; tier and groups are ignored.</div>
              )}
              {unknown.length > 0 && <div className="sm danger">Not in the list: {unknown.join(', ')}</div>}
            </section>

            <section className="box">
              <Label>Persons</Label>
              <ChipRow
                label="Persons"
                options={PERSONS.map((p, i) => ({ id: i, label: isMobile ? PERSON_SHORT[i] : p }))}
                values={settings.persons}
                onToggle={(i) => set({ persons: toggle(settings.persons, i).sort((a, b) => a - b) })}
              />
            </section>
          </>
        ) : (
          <section className="box">
            <Label>Pool</Label>
            <div className="mode-blurb">
              {mode === 'due'
                ? (due ? `${due} ${due === 1 ? 'form is' : 'forms are'} due: the ones spaced repetition says you're about to forget.` : 'Nothing is due right now. Forms come back a day after you first get them right.')
                : (mistakes ? `${mistakes} ${mistakes === 1 ? 'form' : 'forms'} you missed last time, across every tense and verb.` : 'Nothing outstanding. Every form you\'ve missed has since been answered correctly.')}
            </div>
          </section>
        )}

        <section className={`box setup-options ${optionsOpen ? 'open' : ''}`}>
          <button type="button" className="eyebrow setup-label options-toggle" aria-expanded={optionsOpen} onClick={() => setOptionsOpen((o) => !o)}>
            <span>Options <span className="chev" aria-hidden="true">{optionsOpen ? '▴' : '▾'}</span></span>
          </button>
          {optionsOpen ? (
            isMobile ? (
              <>
                <OptionRow label="Show the verb as">{promptSeg}</OptionRow>
                <OptionRow label="Strict accents" hint="habló ≠ hablo">
                  <input type="checkbox" checked={settings.strictAccents} onChange={(e) => set({ strictAccents: e.target.checked })} aria-label="Strict accents" />
                </OptionRow>
                <OptionRow label="Prioritise forms due for review">
                  <input type="checkbox" checked={settings.prioritiseDue} onChange={(e) => set({ prioritiseDue: e.target.checked })} aria-label="Prioritise forms due for review" />
                </OptionRow>
                <OptionRow label="Show verb-type hint" hint="stem-changer, irregular…">
                  <input type="checkbox" checked={settings.showHints} onChange={(e) => set({ showHints: e.target.checked })} aria-label="Show verb-type hint" />
                </OptionRow>
              </>
            ) : (
              <div className="options-row">
                <label className="option-inline"><span>Show the verb as</span>{promptSeg}</label>
                <label className="option-inline"><input type="checkbox" checked={settings.strictAccents} onChange={(e) => set({ strictAccents: e.target.checked })} /><span>Strict accents</span></label>
                <label className="option-inline"><input type="checkbox" checked={settings.prioritiseDue} onChange={(e) => set({ prioritiseDue: e.target.checked })} /><span>Prioritise due reviews</span></label>
                <label className="option-inline"><input type="checkbox" checked={settings.showHints} onChange={(e) => set({ showHints: e.target.checked })} /><span>Show verb-type hint</span></label>
              </div>
            )
          ) : (
            <button type="button" className="muted options-summary" onClick={() => setOptionsOpen(true)}>{optionSummary}</button>
          )}
        </section>

        {!isMobile && (
          <section className="box setup-length">
            <Label>Length</Label>
            <div className="length-row">
              {lengthSeg}
              {startBtn}
              {noteEl}
            </div>
          </section>
        )}
      </div>

      {isMobile && (
        <aside className="setup-aside">
          <div className="setup-bar">
            <div className="setup-length-row">
              <span className="eyebrow">Length</span>
              {lengthSeg}
            </div>
            {startBtn}
            {noteEl}
          </div>
        </aside>
      )}
    </div>
  );
}
