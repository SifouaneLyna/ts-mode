import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAttr } from '../../context/SiteSettingsContext';
import { normalize } from '../../utils/attributes';

// Type a value + Enter (or comma) to add it; click a chip's × to remove it; click a suggestion to add it.
function ChipsInput({ values, onChange, suggestions = [], placeholder }) {
  const { t } = useI18n();
  const attr = useAttr();
  const [text, setText] = useState('');
  const has = (w) => values.some((v) => normalize(v) === normalize(w));

  function add(raw) {
    const word = attr.canonical(String(raw).trim()); // known words are stored in English, others as typed
    if (!word || has(word)) return;
    onChange([...values, word]);
  }
  function commit() {
    String(text).split(/[,،]/).forEach((w) => add(w));
    setText('');
  }
  const free = suggestions.filter((s) => !has(s));

  return (
    <div>
      <div className="adm-chips" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
        {values.map((v) => (
          <span key={v} className="adm-chip" title={v}>
            {attr.value(v)}
            <button type="button" aria-label={t('a.remove')} onClick={() => onChange(values.filter((x) => x !== v))}>×</button>
          </span>
        ))}
        <input
          value={text}
          placeholder={values.length ? '' : placeholder}
          onChange={(e) => (/[,،]/.test(e.target.value) ? (setText(e.target.value), setTimeout(commit, 0)) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
          }}
          onBlur={commit}
        />
      </div>
      {free.length > 0 && (
        <div className="adm-quick">
          <small className="adm-muted">{t('a.pf.quickAdd')}:</small>
          {free.slice(0, 8).map((s) => <button type="button" key={s} onClick={() => add(s)}>+ {attr.value(s)}</button>)}
        </div>
      )}
    </div>
  );
}

export default ChipsInput;
