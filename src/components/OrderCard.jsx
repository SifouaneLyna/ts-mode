import { useI18n } from '../i18n/I18nContext';
import { useAttr } from '../context/SiteSettingsContext';

function OrderCard({ order, onCancel, cancelling }) {
  const { t, money, formatDate } = useI18n();
  const attr = useAttr();
  const ref = order.orderNumber || order._id.slice(-6).toUpperCase();
  return (
    <div className={`order-card ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
      <div className="d-flex justify-content-between">
        <strong>#{ref}</strong>
        <span className="order-status">{t(`status.${order.status}`)}</span>
      </div>
      <div className="small text-muted mb-2">{formatDate(order.createdAt)}</div>
      {order.items.map((it, i) => (
        <div key={i} className="small">
          {it.productName} × {it.quantity} {attr.joinValues(it.attributes)}
        </div>
      ))}
      <div className="d-flex justify-content-between align-items-center mt-2">
        {onCancel && order.status === 'pending' ? (
          <button className="btn-link-danger" disabled={cancelling} onClick={() => onCancel(order)}>
            {cancelling ? t('order.cancelling') : t('order.cancel')}
          </button>
        ) : <span />}
        <span className="fw-bold">{money(order.totalPrice)}</span>
      </div>
    </div>
  );
}

export default OrderCard;
