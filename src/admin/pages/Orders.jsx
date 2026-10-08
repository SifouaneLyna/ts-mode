import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, Modal, PageHeader, Pagination } from '../components/ui';
import { useAttr } from '../../context/SiteSettingsContext';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'done', 'cancelled'];
const waDigits = (phone) => { const d = String(phone).replace(/\D/g, ''); return d.startsWith('0') ? `213${d.slice(1)}` : d; };
// Office pickup: wilaya, city. Home delivery: wilaya, city and the address the customer typed. No name, no phone.
const addressToCopy = (c) => [c.wilaya, c.city, c.deliveryType === 'home' ? c.address : ''].map((x) => String(x ?? '').trim()).filter(Boolean).join(', ');
const ref = (o) => `#${o.orderNumber || o._id.slice(-6).toUpperCase()}`;

// One place that changes a status (and asks first before cancelling)
function useStatusChange(onDone) {
  const { api, notify, fail, refreshSummary } = useAdmin();
  const { t } = useI18n();
  return async (order, status) => {
    if (status === order.status) return;
    if (status === 'cancelled' && !window.confirm(t('a.ord.cancelConfirm'))) return;
    try {
      const updated = await api(`/orders/${order._id}/status`, { method: 'PATCH', body: { status } });
      onDone(updated);
      refreshSummary();
      notify(t('a.ord.updated'));
    } catch (err) { fail(err); }
  };
}

function OrderDetail({ order, onClose, onChange }) {
  const { notify } = useAdmin();
  const { t, money, formatDateTime } = useI18n();
  const attr = useAttr();
  const change = useStatusChange(onChange);
  const c = order.customerInfo || {};
  const locked = order.status === 'cancelled';

  return (
    <Modal title={ref(order)} onClose={onClose} wide>
      <div className="no-print mb-3">
        <label className="adm-label">{t('a.ord.setStatus')}</label>
        <div className="adm-statusbar">
          {STATUSES.map((s) => (
            <button key={s} type="button" className={order.status === s ? `active ${s}` : ''} disabled={locked && s !== 'cancelled'} onClick={() => change(order, s)}>{t(`status.${s}`)}</button>
          ))}
        </div>
        {locked && <small className="adm-muted">{t('a.ord.locked')}</small>}
        {!locked && order.status !== 'done' && <small className="adm-muted d-block mt-1">{t('a.ord.cancelWarn')}</small>}
      </div>

      <div className="adm-detail">
        <div>
          <span className={`adm-pill ${order.status}`}>{t(`status.${order.status}`)}</span>
          <p className="adm-muted mb-2">{formatDateTime(order.createdAt)} · {order.customerId ? t('a.ord.account') : t('a.ord.guest')}</p>
          <h4>{t('a.ord.customer')}</h4>
          <p><b>{c.name}</b><br /><span dir="ltr">{c.phone}</span><br />{c.wilaya}, {c.city}<br />{t('a.ord.delivery')}: {c.deliveryType === 'home' ? t('checkout.home') : t('checkout.office')}{c.address ? <><br />{t('a.ord.address')}: {c.address}</> : null}</p>
          <div className="adm-row-actions no-print">
            <a className="adm-btn ghost" href={`tel:${c.phone}`}>{t('a.ord.call')}</a>
            <a className="adm-btn ghost" href={`https://wa.me/${waDigits(c.phone)}`} target="_blank" rel="noreferrer">{t('a.ord.whatsapp')}</a>
            <button className="adm-btn ghost" onClick={() => { navigator.clipboard?.writeText(addressToCopy(c)); notify(t('a.ord.copied')); }}>{t('a.ord.copy')}</button>
            <button className="adm-btn ghost" onClick={() => window.print()}>{t('a.ord.print')}</button>
          </div>
        </div>
        <div>
          <h4>{t('a.ord.items')}</h4>
          <ul className="adm-list">
            {order.items.map((it, i) => (
              <li key={i}><span>{it.productName} × {it.quantity}<small className="adm-muted"> {attr.joinValues(it.attributes)}</small></span><b>{money(it.priceAtOrder * it.quantity)}</b></li>
            ))}
            <li><span>{t('a.ord.itemsTotal')}</span><b>{money(order.itemsTotal)}</b></li>
            <li><span>{t('a.ord.delivery')}</span><b>{money(order.deliveryPrice)}</b></li>
            <li className="total"><span>{t('a.ord.total')}</span><b>{money(order.totalPrice)}</b></li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function Orders() {
  const { api, fail, refreshSummary } = useAdmin();
  const { t, money, formatDateTime } = useI18n();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { const id = setTimeout(() => { setDebounced(q); setPage(1); }, 350); return () => clearTimeout(id); }, [q]);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.set('status', status);
    if (debounced) params.set('q', debounced);
    api(`/orders/search?${params}`).then(setData).catch(fail);
  }, [api, fail, status, debounced, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(load, 60000); return () => clearInterval(id); }, [load]);

  const replace = (updated) => {
    setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
    setData((d) => d && { ...d, orders: d.orders.map((o) => (o._id === updated._id ? updated : o)) });
  };
  const change = useStatusChange(replace);

  return (
    <>
      <PageHeader title={t('a.nav.orders')}>
        <input className="form-control adm-search" placeholder={t('a.ord.searchPh')} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="adm-btn ghost" onClick={() => { load(); refreshSummary(); }}>{t('a.ord.refresh')}</button>
      </PageHeader>
      <div className="adm-tabs">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} className={status === s ? 'active' : ''} onClick={() => { setStatus(s); setPage(1); }}>{s ? t(`status.${s}`) : t('a.ord.all')}</button>
        ))}
      </div>

      {!data ? <Loading /> : data.orders.length === 0 ? <p className="adm-muted">{t('a.none')}</p> : (
        <div className="adm-rows">
          <div className="adm-rowhead adm-orderrow"><span>{t('a.ord.number')}</span><span>{t('a.ord.customer')}</span><span>{t('a.ord.total')}</span><span>{t('a.ord.date')}</span><span>{t('a.ord.status')}</span></div>
          {data.orders.map((o) => (
            <div key={o._id} className={`adm-row adm-orderrow clickable ${o.status === 'pending' ? 'is-new' : ''}`} onClick={() => setSelected(o)}>
              <span className="c-num">{ref(o)}</span>
              <div className="c-cust"><b>{o.customerInfo?.name}</b><small className="adm-muted"> · {o.customerInfo?.wilaya}</small><div className="adm-itemsline">{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}</div></div>
              <span className="c-total">{money(o.totalPrice)}</span>
              <span className="c-date adm-muted">{formatDateTime(o.createdAt)}</span>
              <span className="c-select" onClick={(e) => e.stopPropagation()}>
                <select className={`adm-status ${o.status}`} value={o.status} disabled={o.status === 'cancelled'} onChange={(e) => change(o, e.target.value)} aria-label={t('a.ord.setStatus')}>
                  {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </select>
              </span>
              <span className="c-status"><span className={`adm-pill ${o.status}`}>{t(`status.${o.status}`)}</span></span>
            </div>
          ))}
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} onChange={replace} />}
    </>
  );
}

export default Orders;
