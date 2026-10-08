import { useI18n } from '../i18n/I18nContext';

const OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عربي' },
];

function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      {OPTIONS.map((o) => (
        <button key={o.code} type="button" className={lang === o.code ? 'active' : ''} onClick={() => setLang(o.code)} lang={o.code}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
