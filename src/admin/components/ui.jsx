import { useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export function PageHeader({ title, children }) {
  return (
    <div className="adm-pagehead">
      <h1>{title}</h1>
      <div className="adm-pagehead-actions">{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="adm-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label={t('a.close')}>×</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  const { t } = useI18n();
  if (pages <= 1) return null;
  return (
    <div className="adm-pager">
      <button className="adm-btn ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('a.prev')}</button>
      <span>{t('a.page', { page, pages })}</span>
      <button className="adm-btn ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t('a.next')}</button>
    </div>
  );
}

export function Loading() {
  const { t } = useI18n();
  return <p className="adm-muted">{t('common.loading')}</p>;
}

// Small helper to read the right field in the right language, with fallbacks
export const nameOf = (item, lang) =>
  item?.translations?.[lang]?.name?.trim() || item?.name || '';
