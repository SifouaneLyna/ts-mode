import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { cancelMyOrder, getMe, getMyOrders, updateMe } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import OrderCard from '../components/OrderCard';
import { useI18n } from '../i18n/I18nContext';
import { cleanPhone, validateProfile } from '../utils/validators';

function ProfilePage() {
  const { token, user, logout, updateUser } = useAuth();
  const { t, errorText } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', username: '', phone: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  function handleAuthError(err) {
    if (err.status === 401) { logout(); navigate('/login', { state: { from: '/profile' } }); return true; }
    return false;
  }

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((me) => setForm({ name: me.name || '', username: me.username || '', phone: me.phone || '' }))
      .catch((err) => { if (err.status === 401) { logout(); navigate('/login', { state: { from: '/profile' } }); } });
    getMyOrders(token)
      .then(setOrders)
      .catch((err) => {
        if (err.status === 401) { logout(); navigate('/login', { state: { from: '/profile' } }); }
        else setOrdersError(errorText(err));
      });
  }, [token, logout, navigate]);

  if (!token) return <Navigate to="/login" state={{ from: '/profile' }} replace />;

  const errors = validateProfile(form);
  if (showPwd && pwd.newPassword) {
    if (!pwd.currentPassword) errors.currentPassword = 'v.currentPassword';
    if (pwd.newPassword.length < 6) errors.newPassword = 'v.passwordMin';
    if (pwd.confirm !== pwd.newPassword) errors.confirm = 'v.passwordMatch';
  }
  const err = (f) => (submitted && errors[f] ? t(errors[f]) : '');

  async function handleSave(e) {
    e.preventDefault();
    setSubmitted(true);
    setMessage({ type: '', text: '' });
    if (Object.keys(errors).length) return;
    const body = { name: form.name.trim(), username: form.username.trim().toLowerCase(), phone: cleanPhone(form.phone) };
    if (showPwd && pwd.newPassword) { body.currentPassword = pwd.currentPassword; body.newPassword = pwd.newPassword; }
    setSaving(true);
    try {
      const res = await updateMe(body, token);
      const me = res.user || res;
      updateUser({ name: me.name || body.name });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setSubmitted(false);
      setMessage({ type: 'success', text: t('profile.updated') });
    } catch (e2) {
      if (!handleAuthError(e2)) setMessage({ type: 'danger', text: errorText(e2) });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(order) {
    if (!window.confirm(t('order.cancelConfirm'))) return;
    setCancellingId(order._id);
    try {
      const updated = await cancelMyOrder(order._id, token);
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, ...updated } : o)));
    } catch (e2) {
      if (!handleAuthError(e2)) setOrdersError(errorText(e2));
    } finally {
      setCancellingId(null);
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const setP = (f) => (e) => setPwd({ ...pwd, [f]: e.target.value });

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h2 className="section-heading mb-0">{t('profile.title')}</h2>
      <hr className="gold-rule" />

      <form onSubmit={handleSave} noValidate className="mb-5">
        <div className="row">
          <div className="col-md-6"><Field label={t('auth.fullName')} value={form.name} onChange={set('name')} error={err('name')} /></div>
          <div className="col-md-6"><Field label={t('auth.username')} value={form.username} onChange={set('username')} error={err('username')} /></div>
        </div>
        <Field label={t('auth.phone')} inputMode="tel" value={form.phone} onChange={set('phone')} error={err('phone')} />

        <button type="button" className="btn-link-gold mb-3" onClick={() => setShowPwd(!showPwd)}>
          {showPwd ? t('profile.cancelPwd') : t('profile.changePwd')}
        </button>
        {showPwd && (
          <>
            <Field label={t('profile.current')} type="password" value={pwd.currentPassword} onChange={setP('currentPassword')} error={err('currentPassword')} />
            <div className="row">
              <div className="col-md-6"><Field label={t('profile.new')} type="password" value={pwd.newPassword} onChange={setP('newPassword')} error={err('newPassword')} /></div>
              <div className="col-md-6"><Field label={t('profile.confirm')} type="password" value={pwd.confirm} onChange={setP('confirm')} error={err('confirm')} /></div>
            </div>
          </>
        )}

        {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
        <div className="d-flex gap-3">
          <button className="btn btn-outline-gold" disabled={saving}>{saving ? t('profile.saving') : t('profile.save')}</button>
          <button type="button" className="btn btn-outline-gold" onClick={() => { logout(); navigate('/'); }}>{t('profile.logout')}</button>
        </div>
      </form>

      <h5 className="text-uppercase mb-3">{t('profile.orders')}</h5>
      {ordersError && <div className="alert alert-danger py-2">{ordersError}</div>}
      {orders === null && !ordersError && <p className="text-muted">{t('common.loading')}</p>}
      {orders?.length === 0 && <p className="text-muted">{t('profile.noOrders')}</p>}
      {orders?.map((o) => (
        <OrderCard key={o._id} order={o} onCancel={handleCancel} cancelling={cancellingId === o._id} />
      ))}
    </div>
  );
}

export default ProfilePage;
