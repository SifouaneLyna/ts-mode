import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSettings } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { makeTranslator } from '../utils/attributes';

const SiteSettingsContext = createContext({ settings: {}, ready: true, reload: () => {} });

// Contact details, top-bar messages, About texts, hero video and option translations that the owner edits in the admin page.
// `ready` becomes true once the settings arrived, or after 4 seconds (the free server can be asleep), so the page never waits forever.
export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [ready, setReady] = useState(false);
  const reload = useCallback(() => getSettings().then(setSettings).catch(() => {}).finally(() => setReady(true)), []);
  useEffect(() => {
    reload();
    const timer = setTimeout(() => setReady(true), 4000);
    return () => clearTimeout(timer);
  }, [reload]);
  const value = useMemo(() => ({ settings, ready, reload }), [settings, ready, reload]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext).settings;
export const useSettingsReady = () => useContext(SiteSettingsContext).ready;
export const useReloadSettings = () => useContext(SiteSettingsContext).reload;

// Option words (color, size, "Red"...) in the visitor's language
export function useAttr() {
  const { lang } = useI18n();
  const settings = useSiteSettings();
  return useMemo(() => makeTranslator(lang, settings.attributes), [lang, settings.attributes]);
}
