import { createContext, useContext, useEffect, useState } from 'react';
import T, { SERVER_MESSAGES } from './translations';

const LANGS = ['en', 'fr', 'ar'];
const LOCALES = { en: 'en-GB', fr: 'fr-FR', ar: 'ar-DZ-u-nu-latn' };
const KEY = 'ts-mode-lang';
const BOOTSTRAP_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  // index.html picks the first language before the page paints: the visitor's saved choice, otherwise Arabic
  const [lang, setLangState] = useState(() => (LANGS.includes(window.__LANG__) ? window.__LANG__ : 'ar'));
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    const link = document.getElementById('bootstrap-css');
    const wanted = BOOTSTRAP_CSS + (dir === 'rtl' ? 'bootstrap.rtl.min.css' : 'bootstrap.min.css');
    if (link && link.href !== wanted) link.href = wanted;
  }, [lang, dir]);

  function setLang(next) {
    if (!LANGS.includes(next)) return;
    try { localStorage.setItem(KEY, next); } catch { /* private mode: language just won't be remembered */ }
    setLangState(next);
  }

  function t(key, vars = {}) {
    const entry = T[key];
    const text = entry ? entry[lang] || entry.en : key;
    return text.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? vars[name] : m));
  }

  // Turns an error (often an English message from the backend) into the current language
  function errorText(err) {
    const msg = typeof err === 'string' ? err : err?.message || '';
    if (SERVER_MESSAGES[msg]) return t(SERVER_MESSAGES[msg]);
    if (msg.startsWith('Product no longer available') || msg.startsWith('Product not found')) return t('err.unavailable');
    if (msg.startsWith('Not enough stock for ')) return t('err.stock', { name: msg.slice('Not enough stock for '.length) });
    if (/failed to fetch|networkerror|load failed/i.test(msg)) return t('err.network');
    return msg || t('err.generic');
  }

  const money = (n) => `${n} ${t('common.currency')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString(LOCALES[lang]);
  const formatDateTime = (d) => new Date(d).toLocaleString(LOCALES[lang], { dateStyle: 'short', timeStyle: 'short' });

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t, errorText, money, formatDate, formatDateTime }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
