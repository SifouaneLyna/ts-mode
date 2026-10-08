import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, Modal, PageHeader } from '../components/ui';
import Field from '../../components/Field';
import { cleanPhone, isValidPhone, isValidUsername } from '../../utils/validators';

function Staff() {
  const { api, notify, fail } = useAdmin();
  const { t } = useI18n();
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api('/admin/staff').then(setList).catch(fail), [api, fail]);
  useEffect(() => { load(); }, [load]);

  const open = (u) => { setErrors({}); setEdit(u ? { id: u.id, name: u.name, username: u.username, phone: u.phone, password: '' } : { name: '', username: '', phone: '', password: '' }); };

  async function save(e) {
    e.preventDefault();
    const er = {};
    if (edit.name.trim().length < 2) er.name = t('v.name');
    if (!isValidUsername(edit.username)) er.username = t('v.username');
    if (!isValidPhone(edit.phone)) er.phone = t('v.phone');
    if ((!edit.id || edit.password) && edit.password.length < 6) er.password = t('v.passwordMin');
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const body = { name: edit.name.trim(), username: edit.username.trim().toLowerCase(), phone: cleanPhone(edit.phone), password: edit.password };
      await api(edit.id ? `/admin/staff/${edit.id}` : '/admin/staff', { method: edit.id ? 'PUT' : 'POST', body });
      notify(t('a.saved'));
      setEdit(null);
      load();
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  async function remove(u) {
    if (!window.confirm(t('a.confirmDelete'))) return;
    try { await api(`/admin/staff/${u.id}`, { method: 'DELETE' }); notify(t('a.deleted')); load(); } catch (err) { fail(err); }
  }

  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  return (
    <>
      <PageHeader title={t('a.nav.staff')}>
        <button className="adm-btn primary" onClick={() => open(null)}>+ {t('a.staff.add')}</button>
      </PageHeader>
      <p className="adm-muted small">{t('a.staff.hint')}</p>
      {!list ? <Loading /> : (
        <div className="adm-card flush">
          <table className="adm-table">
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b><small className="adm-muted"> · @{u.username}</small></td>
                  <td>{u.phone}</td>
                  <td><span className={`adm-pill ${u.role === 'owner' ? 'done' : 'confirmed'}`}>{t(`a.role.${u.role}`)}</span></td>
                  <td>
                    {u.role === 'staff' && (
                      <div className="adm-row-actions">
                        <button className="adm-btn ghost" onClick={() => open(u)}>{t('a.edit')}</button>
                        <button className="adm-btn danger ghost" onClick={() => remove(u)}>{t('a.delete')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {edit && (
        <Modal title={edit.id ? t('a.staff.edit') : t('a.staff.add')} onClose={() => setEdit(null)}>
          <form onSubmit={save} noValidate>
            <Field label={t('auth.fullName')} value={edit.name} onChange={set('name')} error={errors.name} />
            <Field label={t('a.staff.username')} value={edit.username} onChange={set('username')} error={errors.username} />
            <Field label={t('auth.phone')} inputMode="tel" value={edit.phone} onChange={set('phone')} error={errors.phone} />
            <Field label={edit.id ? t('a.staff.passwordKeep') : t('a.staff.password')} type="password" value={edit.password} onChange={set('password')} error={errors.password} />
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

export default Staff;
