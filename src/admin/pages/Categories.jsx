import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, Modal, PageHeader, nameOf } from '../components/ui';
import ImageUploader from '../components/ImageUploader';
import { img } from '../../utils/img';

const blank = { name: '', imageUrl: '', translations: { en: { name: '' }, fr: { name: '' }, ar: { name: '' } } };
// Used only if the shop has no main category yet ("Clothing"): created automatically with the first category
const ROOT = { name: 'Vêtements', translations: { en: { name: 'Clothing' }, fr: { name: 'Vêtements' }, ar: { name: 'ملابس' } } };

function Categories() {
  const { api, notify, fail, refreshSummary } = useAdmin();
  const { t, lang } = useI18n();
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api('/categories').then(setList).catch(fail), [api, fail]);
  useEffect(() => { load(); }, [load]);

  // Only the categories customers browse are shown: the main one ("Clothing") stays in the background
  const children = (list || []).filter((c) => c.parentCategoryId).sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));

  function open(c) {
    setEdit(c ? { _id: c._id, parentCategoryId: c.parentCategoryId, name: c.name, imageUrl: c.imageUrl || '', translations: { en: { name: c.translations?.en?.name || '' }, fr: { name: c.translations?.fr?.name || '' }, ar: { name: c.translations?.ar?.name || '' } } } : { ...blank });
  }

  async function save(e) {
    e.preventDefault();
    const names = edit.translations;
    const name = ['fr', 'en', 'ar'].map((l) => names[l].name.trim()).find(Boolean);
    if (!name) return notify(t('a.prod.nameRequired'), 'error');
    setSaving(true);
    try {
      let parentCategoryId = edit.parentCategoryId;
      if (!edit._id) {
        // new categories always go inside the main category
        const root = (list || []).find((c) => !c.parentCategoryId) || (await api('/categories', { method: 'POST', body: ROOT }));
        parentCategoryId = root._id;
      }
      await api(edit._id ? `/categories/${edit._id}` : '/categories', { method: edit._id ? 'PUT' : 'POST', body: { name, imageUrl: edit.imageUrl, parentCategoryId, translations: names } });
      notify(t('a.saved'));
      setEdit(null);
      load();
      refreshSummary();
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  async function remove(c) {
    if (!window.confirm(t('a.confirmDelete'))) return;
    try { await api(`/categories/${c._id}`, { method: 'DELETE' }); notify(t('a.deleted')); load(); refreshSummary(); } catch (err) { fail(err); }
  }

  return (
    <>
      <PageHeader title={t('a.nav.categories')}>
        <button className="adm-btn primary" onClick={() => open(null)}>+ {t('a.cat.new')}</button>
      </PageHeader>
      <p className="adm-muted small">{t('a.cat.onlyChildren')}</p>
      {!list ? <Loading /> : children.length === 0 ? (
        <div className="adm-empty"><p>{t('a.none')}</p><button className="adm-btn primary" onClick={() => open(null)}>+ {t('a.cat.new')}</button></div>
      ) : (
        <div className="adm-rows">
          {children.map((c) => (
            <div key={c._id} className="adm-row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
              <div className="adm-prodcell"><img src={img(c.imageUrl, 160) || '/template/images/cat-item1.jpg'} alt="" /><b>{nameOf(c, lang)}</b></div>
              <div className="adm-row-actions">
                <button className="adm-btn ghost" onClick={() => open(c)}>{t('a.edit')}</button>
                <button className="adm-btn danger" onClick={() => remove(c)}>{t('a.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <Modal title={edit._id ? t('a.cat.edit') : t('a.cat.new')} onClose={() => setEdit(null)}>
          <form onSubmit={save} noValidate>
            {[['en', 'a.langEn'], ['fr', 'a.langFr'], ['ar', 'a.langAr']].map(([l, key]) => (
              <div key={l} className="mb-3">
                <label className="adm-label">{t('a.prod.name')} · {t(key)}</label>
                <input className="form-control" dir={l === 'ar' ? 'rtl' : 'ltr'} value={edit.translations[l].name} onChange={(e) => setEdit({ ...edit, translations: { ...edit.translations, [l]: { name: e.target.value } } })} />
              </div>
            ))}
            <label className="adm-label">{t('a.cat.image')}</label>
            <ImageUploader images={edit.imageUrl ? [edit.imageUrl] : []} onChange={(arr) => setEdit({ ...edit, imageUrl: arr[arr.length - 1] || '' })} max={1} compact />
            <div className="adm-modal-foot">
              <button type="button" className="adm-btn ghost" onClick={() => setEdit(null)}>{t('a.cancel')}</button>
              <button className="adm-btn primary" disabled={saving}>{saving ? t('a.saving') : t('a.save')}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default Categories;
