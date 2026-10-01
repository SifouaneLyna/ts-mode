const STATUS = {
  pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
  out_for_delivery: 'Out for delivery', done: 'Delivered', cancelled: 'Cancelled',
};

function OrderCard({ order, onCancel, cancelling }) {
  const ref = order.orderNumber || order._id.slice(-6).toUpperCase();
  return (
    <div className={`order-card ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
      <div className="d-flex justify-content-between">
        <strong>#{ref}</strong>
        <span className="order-status">{STATUS[order.status] || order.status}</span>
      </div>
      <div className="small text-muted mb-2">{new Date(order.createdAt).toLocaleDateString()}</div>
      {order.items.map((it, i) => (
        <div key={i} className="small">
          {it.productName} × {it.quantity} {Object.values(it.attributes || {}).join(' / ')}
        </div>
      ))}
      <div className="d-flex justify-content-between align-items-center mt-2">
        {onCancel && order.status === 'pending' ? (
          <button className="btn-link-danger" disabled={cancelling} onClick={() => onCancel(order)}>
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </button>
        ) : <span />}
        <span className="fw-bold">{order.totalPrice} DA</span>
      </div>
    </div>
  );
}

export default OrderCard;
