import React, { useEffect, useRef, useState } from 'react';

/** Closes on outside click / Escape. Shared by Dropdown and MultiSelect. */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey, true); };
  }, [open]);
  return { open, setOpen, ref };
}

/**
 * Single-select popover in the app's square style.
 * variant: 'field' (bordered, with eyebrow label) or 'text' (borderless, muted — reads like a subtitle).
 */
export default function Dropdown({ label, options, value, onChange, variant = 'field', align = 'left' }) {
  const { open, setOpen, ref } = usePopover();
  const current = options.find((o) => o.id === value) ?? options[0];
  return (
    <div className={`select-wrap dd-${variant}`} ref={ref}>
      {variant === 'field' && label && <span className="eyebrow">{label}</span>}
      <button type="button" className={`select-btn ${open ? 'open' : ''}`} aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        <span>{current.label}</span>
      </button>
      {open && (
        <div className={`select-pop ${align === 'right' ? 'pop-right' : ''} ${align === 'center' ? 'pop-center' : ''}`} role="listbox" aria-label={label}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={`select-opt ${o.id === value ? 'on' : ''}`}
              onClick={() => { onChange(o.id); setOpen(false); }}
            >
              <span className="opt-mark" aria-hidden="true">{o.id === value ? '✓' : ''}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
