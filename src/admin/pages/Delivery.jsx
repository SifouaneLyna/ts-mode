import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, PageHeader } from '../components/ui';
import { WILAYAS } from '../wilayas';

function Delivery() {
  const { api, notify, fail } = useAdmin();
  const { t } = useI18n();
  const [rows, setRows] = useState(null); // { _id?, wilaya, home, office }
  const [defaults, setDefaults] = useState({ home: '600', office: '300' });
  const [pick, setPick] = useState('');
  const [saving, setSaving] = useState(false);

  const fromServer = (list) => list.map((r) => ({ _id: r._id, wilaya: r.wilaya, home: r.homeDeliveryPrice == null ? '' : String(r.homeDeliveryPrice), office: r.officeDeliveryPrice == null ? '' : String(r.officeDeliveryPrice) }));
  useEffect(() => { api('/delivery-rates').then((l) => setRows(fromServer(l))).catch(fail); }, [api, fail]);

  const sortKey = (w) => { const i = WILAYAS.indexOf(w); return i === -1 ? 999 : i; };
  const sorted = (list) => [...list].sort((a, b) => sortKey(a.wilaya) - sortKey(b.wilaya) || a.wilaya.localeCompare(b.wilaya));
  const patch = (wilaya, p) => setRows((l) => l.map((r) => (r.wilaya === wilaya ? { ...r, ...p } : r)));
  const missing = rows ? WILAYAS.filter((w) => !rows.some((r) => r.wilaya === w)) : [];

  const addAll = () => setRows((l) => sorted([...l, ...missing.map((wilaya) => ({ wilaya, home: defaults.home, office: defaults.office }))]));
  const addOne = () => { if (!pick) return; setRows((l) => sorted([...l, { wilaya: pick, home: defaults.home, office: defaults.office }])); setPick(''); };

  async function remove(r) {
    if (r._id) {
      if (!window.confirm(t('a.confirmDelete'))) return;
      try { await api(`/delivery-rates/${r._id}`, { method: 'DELETE' }); notify(t('a.deleted')); } catch (err) { return fail(err); }
    }
    setRows((l) => l.filter((x) => x.wilaya !== r.wilaya));
  }

  async function saveAll() {
    const bad = rows.find((r) => r.home === '' && r.office === '');
    if (bad) return notify(`${bad.wilaya}: ${t('a.del.needOne')}`, 'error');
    setSaving(true);
    try {
      const saved = await api('/delivery-rates/bulk', { method: 'PUT', body: { rates: rows.map((r) => ({ wilaya: r.wilaya, homeDeliveryPrice: r.home === '' ? null : Number(r.home), officeDeliveryPrice: r.office === '' ? null : Number(r.office) })) } });
      setRows(sorted(fromServer(saved)));
      notify(t('a.saved'));
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  if (!rows) return <Loading />;
  const digits = (v) => v.replace(/[^\d.]/g, '');

  return (
    <>
      <PageHeader title={t('a.nav.delivery')}>
        <button className="adm-btn primary" onClick={saveAll} disabled={saving}>{saving ? t('a.saving') : t('a.del.saveAll')}</button>
      </PageHeader>
      <p className="adm-muted small">{t('a.del.hint')} {t('a.del.emptyHint')}</p>

      <section className="adm-card">
        <div className="adm-form-grid four">
          <div><label className="adm-label">{t('a.del.home')}</label><input className="form-control" inputMode="numeric" value={defaults.home} onChange={(e) => setDefaults({ ...defaults, home: digits(e.target.value) })} /></div>
          <div><label className="adm-label">{t('a.del.office')}</label><input className="form-control" inputMode="numeric" value={defaults.office} onChange={(e) => setDefaults({ ...defaults, office: digits(e.target.value) })} /></div>
          <div className="adm-align-end"><button className="adm-btn ghost" onClick={addAll} disabled={missing.length === 0}>{t('a.del.addAll')}</button></div>
        </div>
        <div className="adm-row-actions mt-3">
          <select className="form-select" style={{ maxWidth: 260 }} value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{t('a.del.addOne')}</option>
            {missing.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <button className="adm-btn ghost" onClick={addOne} disabled={!pick}>{t('a.add')}</button>
        </div>
      </section>

      {rows.length === 0 ? <p className="adm-muted">{t('a.none')}</p> : (
        <div className="adm-card flush">
          <table className="adm-table">
            <thead><tr><th>{t('a.del.wilaya')}</th><th>{t('a.del.home')}</th><th>{t('a.del.office')}</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.wilaya}>
                  <td data-label={t('a.del.wilaya')}><b>{r.wilaya}</b>{!r._id && <small className="adm-muted"> · *</small>}</td>
                  <td data-label={t('a.del.home')}><input className="form-control price" inputMode="numeric" placeholder="—" value={r.home} onChange={(e) => patch(r.wilaya, { home: digits(e.target.value) })} /></td>
                  <td data-label={t('a.del.office')}><input className="form-control price" inputMode="numeric" placeholder="—" value={r.office} onChange={(e) => patch(r.wilaya, { office: digits(e.target.value) })} /></td>
                  <td><button className="adm-btn danger ghost" onClick={() => remove(r)}>{t('a.delete')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Delivery;
