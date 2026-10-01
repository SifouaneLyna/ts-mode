import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { cancelMyOrder, getMe, getMyOrders, updateMe } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import OrderCard from '../components/OrderCard';
import { cleanPhone, validateProfile } from '../utils/validators';

function ProfilePage() {
  const { token, user, logout, updateUser } = useAuth();
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
        else setOrdersError(err.message);
      });
  }, [token, logout, navigate]);

  if (!token) return <Navigate to="/login" state={{ from: '/profile' }} replace />;

  const errors = validateProfile(form);
  if (showPwd && pwd.newPassword) {
    if (!pwd.currentPassword) errors.currentPassword = 'Enter your current password.';
    if (pwd.newPassword.length < 6) errors.newPassword = 'At least 6 characters.';
    if (pwd.confirm !== pwd.newPassword) errors.confirm = 'Passwords do not match.';
  }
  const err = (f) => submitted && errors[f];

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
      setMessage({ type: 'success', text: 'Your information was updated.' });
    } catch (e2) {
      if (!handleAuthError(e2)) setMessage({ type: 'danger', text: e2.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(order) {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(order._id);
    try {
      const updated = await cancelMyOrder(order._id, token);
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, ...updated } : o)));
    } catch (e2) {
      if (!handleAuthError(e2)) setOrdersError(e2.message);
    } finally {
      setCancellingId(null);
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const setP = (f) => (e) => setPwd({ ...pwd, [f]: e.target.value });

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h2 className="section-heading mb-0">My Account</h2>
      <hr className="gold-rule" />

      <form onSubmit={handleSave} noValidate className="mb-5">
        <div className="row">
          <div className="col-md-6"><Field label="Full name" value={form.name} onChange={set('name')} error={err('name')} /></div>
          <div className="col-md-6"><Field label="Username" value={form.username} onChange={set('username')} error={err('username')} /></div>
        </div>
        <Field label="Phone" inputMode="tel" value={form.phone} onChange={set('phone')} error={err('phone')} />

        <button type="button" className="btn-link-gold mb-3" onClick={() => setShowPwd(!showPwd)}>
          {showPwd ? 'Cancel password change' : 'Change password'}
        </button>
        {showPwd && (
          <>
            <Field label="Current password" type="password" value={pwd.currentPassword} onChange={setP('currentPassword')} error={err('currentPassword')} />
            <div className="row">
              <div className="col-md-6"><Field label="New password" type="password" value={pwd.newPassword} onChange={setP('newPassword')} error={err('newPassword')} /></div>
              <div className="col-md-6"><Field label="Confirm" type="password" value={pwd.confirm} onChange={setP('confirm')} error={err('confirm')} /></div>
            </div>
          </>
        )}

        {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
        <div className="d-flex gap-3">
          <button className="btn btn-outline-gold" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" className="btn btn-outline-gold" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </form>

      <h5 className="text-uppercase mb-3">My orders</h5>
      {ordersError && <div className="alert alert-danger py-2">{ordersError}</div>}
      {orders === null && !ordersError && <p className="text-muted">Loading…</p>}
      {orders?.length === 0 && <p className="text-muted">No orders yet.</p>}
      {orders?.map((o) => (
        <OrderCard key={o._id} order={o} onCancel={handleCancel} cancelling={cancellingId === o._id} />
      ))}
    </div>
  );
}

export default ProfilePage;
