import React from 'react';
import { TENSES, VERBS } from '../data/verbs.js';
import { dueKeys, mistakeKeys, loadLog } from '../lib/store.js';
import { todayStats, streak, byTense, mostMissed } from '../lib/stats.js';
import { go, Mascot, useIsMobile } from '../App.jsx';

/** One home card. `to` = hash route, or onClick for cards that change settings first. */
function Card({ eyebrow, title, children, cta, to, onClick, primary, disabled, muted }) {
  const cls = `card${primary ? ' primary' : ''}${muted ? ' muted-card' : ''}`;
  const body = (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <div className="card-title">{title}</div>
      <div className="card-body">{children}</div>
      {cta && <div className="cta">{cta}</div>}
    </>
  );
  if (muted) return <div className={cls}>{body}</div>;
  if (onClick) return <button type="button" className={cls} onClick={onClick} disabled={disabled}>{body}</button>;
  return <a href={to} className={cls}>{body}</a>;
}

export default function Home({ settings, setSettings }) {
  const isMobile = useIsMobile();
  const isNew = loadLog().length === 0;
  const due = dueKeys().length;
  const today = todayStats();
  const goal = settings.dailyGoal && settings.dailyGoal !== 20 ? settings.dailyGoal : 50; // 20 was the old default, never user-chosen
  const days = streak();
  const weakest = byTense(30).filter((t) => t.n >= 5).sort((a, b) => a.ok / a.n - b.ok / b.n)[0];
  const missed = mostMissed(3, 30);
  const mistakes = mistakeKeys().length;
  const reached = today.n >= goal;

  const tenseLabel = (id) => TENSES.find((t) => t.id === id)?.label ?? id;

  const startReview = () => {
    setSettings(due ? { ...settings, mode: 'due', length: due > 50 ? 50 : 0 } : { ...settings, mode: 'custom' });
    go('drill');
  };
  const startMissed = () => {
    setSettings({ ...settings, mode: 'mistakes', length: mistakes > 50 ? 50 : 0 });
    go('drill');
  };
  const startFirst = () => {
    setSettings({ ...settings, mode: 'custom', verbs: [], tenses: ['presente'], tier: 25, length: 10 });
    go('drill');
  };

  // What the dino says.
  const dayWord = `day ${days}`;
  const status = reached
    ? `Goal reached ✓ on ${dayWord} of your streak.`
    : today.n > 0
      ? `Day ${days} of your streak · ${today.n} of ${goal} forms today.`
      : days > 0
        ? `Day ${days} of your streak · ${goal} forms to keep it alive.`
        : `${goal} forms today starts a streak.`;
  const nudge = due
    ? `${due} ${due === 1 ? 'form is' : 'forms are'} about to slip out of your head. Let's rescue ${due === 1 ? 'it' : 'them'} before ${due === 1 ? 'it goes' : 'they go'} extinct.`
    : mistakes
      ? `Nothing's due right now, but ${mistakes} ${mistakes === 1 ? 'form got' : 'forms got'} away from you last time. Want another try?`
      : 'Nothing\'s due right now. Do a quick drill today and I\'ll have something waiting for you tomorrow.';

  return (
    <>
      <section className="hero">
        <div className="hero-row">
          <div className="mascot-slot">
            <Mascot size={isMobile ? 170 : 140} />
          </div>
          <div className="hero-text">
            {isNew ? (
              <p className="speech">
                ¡Hola! I'm <span className="speech-name">Vosotrosaurus</span>. Pick a few tenses, type the forms, and I'll bring back
                anything you're about to forget. <em>Vosotros</em> included. It isn't extinct.
              </p>
            ) : (
              <>
                <p className="speech">
                  ¡Hola otra vez! <span className="speech-name">Vosotrosaurus</span> here. {status}{' '}<br />
                  {nudge}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="cards">
        {isNew ? (
          <Card primary eyebrow="Start here" title="Your first drill" cta="Start →" onClick={startFirst}>
            Presente · top 25 verbs · 10 questions.
          </Card>
        ) : (
          <Card
            primary
            eyebrow="Review due"
            title={due ? `${due} ${due === 1 ? 'form' : 'forms'} to review` : 'Nothing due yet'}
            cta={due ? 'Start review →' : 'Quick drill →'}
            onClick={startReview}
          >
            {due ? 'Spaced repetition says these are about to slip.' : 'Do a drill; forms come back tomorrow.'}
          </Card>
        )}

        <Card
          eyebrow="Mistakes · still outstanding"
          title={mistakes ? `${mistakes} missed ${mistakes === 1 ? 'form' : 'forms'}` : 'No misses outstanding'}
          cta={mistakes ? 'Re-drill →' : undefined}
          onClick={startMissed}
          disabled={!mistakes}
        >
          {mistakes ? missed.map((m) => m.inf).join(', ') : 'Missed forms wait here until you get them right.'}
        </Card>

        <Card eyebrow="Practice" title="Set up a drill" cta="Set up →" to="#/setup">
          Last: {settings.tenses.map(tenseLabel).join(', ') || '—'} · {settings.verbs.length ? `${settings.verbs.length} specific verbs` : settings.tier ? `top ${settings.tier}` : 'all verbs'}
        </Card>

        <Card eyebrow="Verbs" title={`${VERBS.length} verbs`} cta="Browse →" to="#/verbs">
          Full tables, every form in a sentence.
        </Card>

        <Card eyebrow="Progress" title={weakest ? `Weakest: ${weakest.tense.label} · ${Math.round((weakest.ok / weakest.n) * 100)}%` : 'Nothing to show yet'} cta="See progress →" to="#/progress">
          {weakest ? 'Where you stand by tense, group and person.' : 'Answer a few forms and your weak spots show up here.'}
        </Card>

        {!isMobile && (
          <Card muted eyebrow="Coming soon" title="More modes">
            Contrast · Sprint · Subjuntivo.
          </Card>
        )}
      </div>
    </>
  );
}
