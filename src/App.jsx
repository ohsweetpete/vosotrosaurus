import React, { useEffect, useState } from 'react';
import Home from './screens/Home.jsx';
import Setup from './screens/Setup.jsx';
import Drill from './screens/Drill.jsx';
import Progress from './screens/Progress.jsx';
import Verbs from './screens/Verbs.jsx';
import { loadSettings, saveSettings, migrateSrs, loadBrowse } from './lib/store.js';
import { GROUPS } from './data/verbs.js';

migrateSrs();

// Tiny hash router: #/, #/setup, #/drill, #/progress, #/verbs, #/verbs/pedir
function useRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '');
    const [path, ...rest] = h.split('/');
    return { path: path || 'home', param: rest.join('/') || null };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** True below 800px; re-evaluates on resize. */
export function useIsMobile(query = '(max-width: 800px)') {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, [query]);
  return m;
}

export function go(path) {
  window.location.hash = `#/${path}`;
}

/** Full mascot for the Home page. */
export function Mascot({ size = 160, tight = false }) {
  // tight: crop to the dino's real bounds (no shadow, no empty margin) for inline/lockup use.
  const vb = tight ? '48 84 262 204' : '0 0 320 320';
  const h = tight ? Math.round(size * (204 / 262)) : size;
  return (
    <svg role="img" aria-label="Vosotrosaurus, a friendly green T-rex" width={size} height={h} viewBox={vb} fill="none">
      {!tight && <ellipse cx="170" cy="292" rx="110" ry="12" fill="var(--panel)" />}
      <path d="M60 236c30 0 50-10 72-30" stroke="var(--brand)" strokeWidth="30" strokeLinecap="round" />
      <path d="M118 240c-6-56 10-104 54-120 40-14 86 8 94 52 6 34-6 60-22 78H118z" fill="var(--brand)" />
      <path d="M150 236v44M206 236v44" stroke="var(--brand)" strokeWidth="34" strokeLinecap="round" />
      <path d="M136 280h30M192 280h30" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" />
      <path d="M196 112c40-18 84-10 100 20 10 20 0 40-24 46l-78 6z" fill="var(--brand)" />
      <path d="M216 160c20 4 40 2 58-4" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M236 160l4 10 6-10M254 158l4 10 6-11" fill="#fff" />
      <circle cx="244" cy="128" r="12" fill="#fff" />
      <circle cx="247" cy="129" r="6" fill="var(--ink)" />
      <circle cx="249" cy="127" r="2" fill="#fff" />
      <path d="M222 112c8-6 18-8 28-4" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      <path d="M166 186c-10 2-16 10-14 20" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" />
      <path d="M196 190c-6 4-8 12-4 20" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" />
      <path d="M150 110l8-14 8 14M170 104l8-14 8 14M190 100l8-14 8 14" fill="var(--accent)" />
    </svg>
  );
}

const LINKS = [
  ['home', 'Home'],
  ['setup', 'Practice'],
  ['verbs', 'Verbs'],
  ['progress', 'Progress'],
];

const ICONS = {
  home: <><path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-6h4v6" /></>,
  setup: <><path d="M15 4l5 5L8 21H3v-5z" /><path d="M13 6l5 5" /></>,
  verbs: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3z" /></>,
  progress: <><path d="M5 20v-8" /><path d="M12 20V5" /><path d="M19 20v-5" /><path d="M3 20h18" /></>,
};

function Icon({ name }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

/** Phone-only bottom tab bar (hidden by CSS on wider screens and during a drill). */
function BottomNav({ active }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {LINKS.map(([p, label]) => (
        <a key={p} href={`#/${p}`} className={active === p ? 'active' : ''} aria-current={active === p ? 'page' : undefined}>
          <Icon name={p} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

/** True when the Verbs browse filters exclude something (tier capped, or a type / level unticked). */
function useBrowseFiltered() {
  const calc = () => { const b = loadBrowse(); return !!b && (b.tier > 0 || (b.group && b.group.length < GROUPS.length) || (b.level && b.level.length < 4)); };
  const [on, setOn] = useState(calc);
  useEffect(() => {
    const h = () => setOn(calc());
    window.addEventListener('browse-changed', h);
    return () => window.removeEventListener('browse-changed', h);
  }, []);
  return on;
}

function TopBar({ active }) {
  const links = LINKS;
  const filtered = useBrowseFiltered();
  return (
    <header className="topbar-wrap">
    <div className="topbar">
      <a className="brand" href="#/" aria-label="Vosotrosaurus home">
        <span className="brand-mascot"><Mascot size={42} tight /></span>
        <span className="brand-text">Vosotrosaurus</span>
      </a>
      <nav className="nav">
        {links.map(([p, label]) => (
          <a key={p} href={`#/${p}`} className={`${active === p ? 'active' : ''} nav-${p}`}>{label}</a>
        ))}
      </nav>
      <div className="topbar-right">
        {active === 'verbs' && (
          <button type="button" className={`topbar-find ${filtered ? 'filtered' : ''}`} onClick={() => window.dispatchEvent(new CustomEvent('open-verb-picker'))}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span>{filtered ? 'Filtered verbs' : 'Search verbs'}</span>
            <kbd>/</kbd>
          </button>
        )}
      </div>
      {active === 'verbs' && (
        <button
          type="button"
          className={`topbar-search ${filtered ? 'filtered' : ''}`}
          aria-label={filtered ? 'Browse verbs (filtered)' : 'Browse verbs'}
          onClick={() => window.dispatchEvent(new CustomEvent('open-verb-picker'))}
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </button>
      )}
    </div>
    </header>
  );
}

export default function App() {
  const route = useRoute();
  const [settings, setSettingsState] = useState(loadSettings);
  const setSettings = (next) => {
    const merged = typeof next === 'function' ? next(settings) : next;
    setSettingsState(merged);
    saveSettings(merged);
  };

  if (route.path === 'drill') {
    return (
      <div className="app">
        <Drill settings={settings} setSettings={setSettings} />
      </div>
    );
  }

  let screen;
  switch (route.path) {
    case 'setup':
      screen = <Setup settings={settings} setSettings={setSettings} />;
      break;
    case 'progress':
      screen = <Progress />;
      break;
    case 'verbs':
      screen = <Verbs inf={route.param} settings={settings} setSettings={setSettings} />;
      break;
    default:
      screen = <Home settings={settings} setSettings={setSettings} />;
  }

  return (
    <div className="app">
      <TopBar active={route.path} />
      <main className="page">{screen}</main>
      <BottomNav active={route.path} />
    </div>
  );
}
