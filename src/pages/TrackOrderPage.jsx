import { useEffect, useState } from 'react';
import { cancelTrackedOrder, trackOrder } from '../services/api';
import { getGuestOrders, saveGuestOrder } from '../utils/guestOrders';
import { cleanPhone, isValidPhone } from '../utils/validators';
import Field from '../components/Field';
import OrderCard from '../components/OrderCard';

function TrackOrderPage() {
  const [results, setResults] = useState([]); // [{ order, phone }]
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const saved = getGuestOrders();
    if (!saved.length) return;
    Promise.allSettled(saved.map((s) => trackOrder(s).then((order) => ({ order, phone: s.phone }))))
      .then((all) => setResults(all.filter((r) => r.status === 'fulfilled').map((r) => r.value)));
  }, []);

  function addResult(entry) {
    setResults((list) => [entry, ...list.filter((r) => r.order._id !== entry.order._id)]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const phone = cleanPhone(form.phone);
    if (!form.orderNumber.trim()) return setError('Enter your order number.');
    if (!isValidPhone(phone)) return setError('Enter the phone number used for the order.');
    setLoading(true);
    try {
      const orderNumber = form.orderNumber.trim().replace(/^#/, '').toUpperCase();
      const order = await trackOrder({ orderNumber, phone });
      saveGuestOrder({ orderNumber, phone });
      addResult({ order, phone });
      setForm({ orderNumber: '', phone: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(order, phone) {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(order._id);
    try {
      const updated = await cancelTrackedOrder({ orderNumber: order.orderNumber, phone });
      addResult({ order: { ...order, ...updated }, phone });
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 620 }}>
      <h2 className="section-heading mb-0">Track an Order</h2>
      <hr className="gold-rule" />
      <form onSubmit={handleSubmit} noValidate className="mb-4">
        <Field label="Order number" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
        <Field label="Phone used for the order" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn btn-outline-gold" disabled={loading}>{loading ? 'Searching…' : 'Find my order'}</button>
      </form>
      {results.map(({ order, phone }) => (
        <OrderCard key={order._id} order={order} cancelling={cancellingId === order._id}
          onCancel={order.orderNumber ? (o) => handleCancel(o, phone) : undefined} />
      ))}
    </div>
  );
}

export default TrackOrderPage;
