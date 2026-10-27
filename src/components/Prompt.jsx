import React from 'react';

/** Short English gloss for a bracket: "to say, to tell" → "to say", "to be (essence)" → "to be". */
function shortGloss(en) {
  return en.split(',')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
}

/** Classic prompt: the verb (Spanish, English, or both). */
export function VerbPrompt({ verb, promptLang }) {
  if (promptLang === 'en') return <div><div className="verb-en big">{verb.en}</div></div>;
  return (
    <div>
      <div className="verb-big">{verb.inf}</div>
      {promptLang === 'both' && <div className="verb-en big">{verb.en}</div>}
    </div>
  );
}

/**
 * Sentences / Contrast prompt: "Ayer, nosotros ____ (cenar) con la familia."
 * The bracket follows the prompt language; Both adds the English sentence underneath.
 */
export function SentencePrompt({ sentence, verb, promptLang }) {
  const hint = promptLang === 'en' ? shortGloss(verb.en) : verb.inf;
  return (
    <div className="gap">
      <p className="gap-sentence">
        {sentence.before}
        <span className="gap-blank" aria-label="missing verb" />
        {' '}<span className="gap-hint">({hint})</span>
        {sentence.after}
      </p>
      {promptLang === 'both' && <p className="gap-en">{sentence.en}</p>}
    </div>
  );
}

/** Feedback: the sentence with the right form filled in (children), English underneath. */
export function SentenceFilled({ sentence, children }) {
  return (
    <div className="gap">
      <p className="gap-sentence filled">
        {sentence.before}
        <strong className="gap-fill">{children}</strong>
        {sentence.after}
      </p>
      <p className="gap-en">{sentence.en}</p>
    </div>
  );
}
