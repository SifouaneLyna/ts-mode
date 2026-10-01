import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { createOrder, getDeliveryRates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isValidPhone, cleanPhone } from '../utils/validators';
import { saveGuestOrder } from '../utils/guestOrders';

function CheckoutPage() {
  const { token, user, logout } = useAuth();
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
    getDeliveryRates().then(setRates).catch(() => setError('Could not load delivery prices.'));
  }, []);

  if (order) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
        <h2 className="section-heading mb-0">Thank you</h2>
        <hr className="gold-rule" />
        <p>Your order <strong>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</strong> was placed. Payment is in cash on delivery.</p>
        <p>Items: {order.itemsTotal} DA · Delivery: {order.deliveryPrice} DA<br /><strong>Total: {order.totalPrice} DA</strong></p>
        {token ? (
          <p className="small"><Link to="/profile">Follow this order in your account</Link></p>
        ) : (
          <p className="small text-muted">
            Keep your order number and the phone number you used. You can follow or cancel this order any time from{' '}
            <Link to="/track">Track order</Link>.
          </p>
        )}
        <Link to="/products" className="btn btn-outline-gold mt-3">Continue Shopping</Link>
      </div>
    );
  }

  if (items.length === 0) return <Navigate to="/cart" replace />;

  if (!token && !guest) {
    const from = { from: '/checkout' };
    return (
      <div className="container py-5" style={{ maxWidth: 820 }}>
        <h2 className="section-heading mb-0">How would you like to order?</h2>
        <hr className="gold-rule" />
        <div className="row g-4">
          <div className="col-md-6">
            <div className="choice-card">
              <h5>Create an account</h5>
              <p>Follow your orders, cancel them and check out faster next time. You'll come straight back to checkout.</p>
              <Link to="/signup" state={from} className="btn btn-outline-gold">Create account</Link>
              <p className="small mt-3 mb-0">Already have one? <Link to="/login" state={from}>Login</Link></p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="choice-card">
              <h5>Continue as guest</h5>
              <p>No account needed. You'll get an order number to follow your order with your phone number.</p>
              <button className="btn btn-outline-gold" onClick={() => setGuest(true)}>Continue as guest</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const phoneError = !isValidPhone(form.phone) ? 'Enter a valid mobile number (e.g. 0555 12 34 56).' : '';
  const rate = rates.find((r) => r.wilaya === form.wilaya);
  const deliveryPrice = rate ? (form.deliveryType === 'home' ? rate.homeDeliveryPrice : rate.officeDeliveryPrice) : null;

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <h2 className="section-heading mb-0">Checkout</h2>
      <hr className="gold-rule" />
      <div className="row g-5">
        <form className="col-lg-7" onSubmit={handleSubmit}>
          <input className="form-control mb-3" placeholder="Full name" value={form.name} onChange={set('name')} required />
          <input className={`form-control ${phoneTouched && phoneError ? 'is-invalid' : 'mb-3'}`} placeholder="Phone (0555 12 34 56)" inputMode="tel" value={form.phone}
            onChange={set('phone')} onBlur={() => setPhoneTouched(true)} required />
          {phoneTouched && phoneError ? <div className="field-error mb-3">{phoneError}</div> : null}
          <select className="form-select mb-3" value={form.wilaya} onChange={set('wilaya')} required>
            <option value="">Wilaya</option>
            {rates.map((r) => <option key={r._id} value={r.wilaya}>{r.wilaya}</option>)}
          </select>
          <input className="form-control mb-3" placeholder="City" value={form.city} onChange={set('city')} required />
          <div className="mb-3">
            {[['home', 'Home delivery'], ['office', 'Office pickup']].map(([value, label]) => (
              <label key={value} className="me-4">
                <input type="radio" className="form-check-input me-2" name="deliveryType" value={value}
                  checked={form.deliveryType === value} onChange={set('deliveryType')} />
                {label}
              </label>
            ))}
          </div>
          {form.deliveryType === 'home' && (
            <input className="form-control mb-3" placeholder="Address" value={form.address} onChange={set('address')} required />
          )}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-outline-gold" disabled={loading || !rate}>
            {loading ? 'Placing order…' : 'Place order (cash on delivery)'}
          </button>
        </form>

        <aside className="col-lg-5">
          <h5 className="text-uppercase mb-3">Summary</h5>
          {items.map((i, idx) => (
            <div key={idx} className="d-flex justify-content-between small mb-2">
              <span>{i.name} × {i.quantity} {Object.values(i.attributes || {}).join(' / ')}</span>
              <span>{i.unitPrice * i.quantity} DA</span>
            </div>
          ))}
          <hr />
          <div className="d-flex justify-content-between"><span>Subtotal</span><span>{totalPrice} DA</span></div>
          <div className="d-flex justify-content-between"><span>Delivery</span><span>{deliveryPrice === null ? 'Choose a wilaya' : `${deliveryPrice} DA`}</span></div>
          <div className="d-flex justify-content-between fw-bold mt-2">
            <span>Total</span><span>{deliveryPrice === null ? '—' : `${totalPrice + deliveryPrice} DA`}</span>
          </div>
          <p className="small text-muted mt-3">Final prices are confirmed by the server when you place the order.</p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
