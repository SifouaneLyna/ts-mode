import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { createOrder, getDeliveryRates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isValidPhone, cleanPhone } from '../utils/validators';
import { saveGuestOrder } from '../utils/guestOrders';
import { useI18n } from '../i18n/I18nContext';
import { useAttr } from '../context/SiteSettingsContext';
import { loc } from '../utils/localize';

function CheckoutPage() {
  const { token, user, logout } = useAuth();
  const { t, errorText, money, lang } = useI18n();
  const attr = useAttr();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [guest, setGuest] = useState(Boolean(location.state?.guest));
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '', phone: '', wilaya: '', city: '', deliveryType: 'home', address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getDeliveryRates().then(setRates).catch(() => setError('__rates'));
  }, []);

  if (order) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
        <h2 className="section-heading mb-0">{t('checkout.thanks')}</h2>
        <hr className="gold-rule" />
        <p>{t('checkout.placed', { ref: order.orderNumber || order._id.slice(-6).toUpperCase() })}</p>
        <p>{t('checkout.items')}: {money(order.itemsTotal)} · {t('checkout.delivery')}: {money(order.deliveryPrice)}<br /><strong>{t('cart.total')}: {money(order.totalPrice)}</strong></p>
        {token ? (
          <p className="small"><Link to="/profile">{t('checkout.followAccount')}</Link></p>
        ) : (
          <p className="small text-muted">
            {t('checkout.guestNote').split('{link}')[0]}
            <Link to="/track">{t('checkout.trackLink')}</Link>
            {t('checkout.guestNote').split('{link}')[1]}
          </p>
        )}
        <Link to="/products" className="btn btn-outline-gold mt-3">{t('cart.continue')}</Link>
      </div>
    );
  }

  if (items.length === 0) return <Navigate to="/cart" replace />;

  if (!token && !guest) {
    const from = { from: '/checkout' };
    return (
      <div className="container py-5" style={{ maxWidth: 820 }}>
        <h2 className="section-heading mb-0">{t('checkout.howTitle')}</h2>
        <hr className="gold-rule" />
        <div className="row g-4">
          <div className="col-md-6">
            <div className="choice-card">
              <h5>{t('checkout.guest')}</h5>
              <p>{t('checkout.guestDesc')}</p>
              <button className="btn btn-outline-gold" onClick={() => setGuest(true)}>{t('checkout.guest')}</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="choice-card">
              <h5>{t('checkout.create')}</h5>
              <p>{t('checkout.createDesc')}</p>
              <Link to="/signup" state={from} className="btn btn-outline-gold">{t('checkout.createBtn')}</Link>
              <p className="small mt-3 mb-0">{t('checkout.haveAccount')} <Link to="/login" state={from}>{t('nav.login')}</Link></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const phoneError = !isValidPhone(form.phone) ? t('v.phone') : '';
  const rate = rates.find((r) => r.wilaya === form.wilaya);
  // an empty price in the admin means "not offered": it can't be chosen
  const priceOf = (type) => { const p = rate?.[type === 'home' ? 'homeDeliveryPrice' : 'officeDeliveryPrice']; return typeof p === 'number' ? p : null; };
  const deliveryPrice = rate ? priceOf(form.deliveryType) : null;
  function chooseWilaya(e) {
    const wilaya = e.target.value;
    const r = rates.find((x) => x.wilaya === wilaya);
    const offered = (type) => typeof r?.[type === 'home' ? 'homeDeliveryPrice' : 'officeDeliveryPrice'] === 'number';
    const deliveryType = !r || offered(form.deliveryType) ? form.deliveryType : offered('home') ? 'home' : 'office';
    setForm({ ...form, wilaya, deliveryType });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (phoneError) { setPhoneTouched(true); return; }
    setLoading(true);
    try {
      const created = await createOrder({
        items: items.map((i) => ({ productId: i.productId, attributes: i.attributes || {}, quantity: i.quantity })),
        customerInfo: { ...form, phone: cleanPhone(form.phone), address: form.deliveryType === 'home' ? form.address : '' },
      }, token);
      if (!token) saveGuestOrder({ orderNumber: created.orderNumber, phone: cleanPhone(form.phone) });
      clearCart();
      setOrder(created);
    } catch (err) {
      if (err.status === 401 && token) {
        logout();
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      setError(err.message || '');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <h2 className="section-heading mb-0">{t('checkout.title')}</h2>
      <hr className="gold-rule" />
      <div className="row gy-5 gx-3 gx-md-5">
        <form className="col-lg-7" onSubmit={handleSubmit}>
          <input className="form-control mb-3" placeholder={t('checkout.fullName')} value={form.name} onChange={set('name')} required />
          <input className={`form-control ${phoneTouched && phoneError ? 'is-invalid' : 'mb-3'}`} placeholder={t('checkout.phonePh')} inputMode="tel" value={form.phone}
            onChange={set('phone')} onBlur={() => setPhoneTouched(true)} required />
          {phoneTouched && phoneError ? <div className="field-error mb-3">{phoneError}</div> : null}
          <select className="form-select mb-3" value={form.wilaya} onChange={chooseWilaya} required>
            <option value="">{t('checkout.wilaya')}</option>
            {rates.map((r) => <option key={r._id} value={r.wilaya}>{r.wilaya}</option>)}
          </select>
          <input className="form-control mb-3" placeholder={t('checkout.city')} value={form.city} onChange={set('city')} required />
          <div className="mb-3">
            {[['home', t('checkout.home')], ['office', t('checkout.office')]].map(([value, label]) => (
              <label key={value} className={`me-4 ${rate && priceOf(value) === null ? 'is-unavailable' : ''}`}>
                <input type="radio" className="form-check-input me-2" name="deliveryType" value={value} disabled={Boolean(rate) && priceOf(value) === null}
                  checked={form.deliveryType === value} onChange={set('deliveryType')} />
                {label}{rate && priceOf(value) === null ? ` (${t('checkout.unavailable')})` : ''}
              </label>
            ))}
          </div>
          {form.deliveryType === 'home' && (
            <input className="form-control mb-3" placeholder={t('checkout.address')} value={form.address} onChange={set('address')} required />
          )}
          {error && <div className="alert alert-danger py-2">{error === '__rates' ? t('checkout.ratesError') : errorText(error)}</div>}
          <button className="btn btn-outline-gold" disabled={loading || deliveryPrice === null}>
            {loading ? t('checkout.placing') : t('checkout.place')}
          </button>
        </form>

        <aside className="col-lg-5">
          <h5 className="text-uppercase mb-3">{t('checkout.summary')}</h5>
          {items.map((i, idx) => (
            <div key={idx} className="d-flex justify-content-between small mb-2">
              <span>{loc(i, 'name', lang)} × {i.quantity} {attr.joinValues(i.attributes)}</span>
              <span>{money(i.unitPrice * i.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="d-flex justify-content-between"><span>{t('checkout.subtotal')}</span><span>{money(totalPrice)}</span></div>
          <div className="d-flex justify-content-between"><span>{t('checkout.delivery')}</span><span>{deliveryPrice === null ? t('checkout.chooseWilaya') : money(deliveryPrice)}</span></div>
          <div className="d-flex justify-content-between fw-bold mt-2">
            <span>{t('cart.total')}</span><span>{deliveryPrice === null ? '—' : money(totalPrice + deliveryPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
