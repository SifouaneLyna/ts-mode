import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import QuantityInput from '../components/QuantityInput';

function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="section-heading mb-0">Your cart is empty</h2>
        <hr className="gold-rule" />
        <Link to="/products" className="btn btn-outline-gold">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 860 }}>
      <h2 className="section-heading mb-0">Your Cart</h2>
      <hr className="gold-rule" />

      {items.map((item) => (
        <div className="cart-row" key={item.productId + JSON.stringify(item.attributes)}>
          <img src={item.image} alt={item.name} />
          <div className="cart-info">
            <div className="cart-name">{item.name}</div>
            <div className="cart-options">
              {Object.entries(item.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </div>
            <div className="cart-unit">{item.unitPrice} DA</div>
          </div>
          <QuantityInput value={item.quantity} onChange={(q) => updateQuantity(item.productId, item.attributes, q)} />
          <div className="cart-line">{item.unitPrice * item.quantity} DA</div>
          <button className="cart-remove" aria-label="Remove" onClick={() => removeFromCart(item.productId, item.attributes)}>×</button>
        </div>
      ))}

      <div className="text-end mt-4">
        <div className="fs-4 mb-3">Total: <strong>{totalPrice} DA</strong></div>
        <Link to="/checkout" className="btn btn-outline-gold">Proceed to Checkout</Link>
      </div>
    </div>
  );
}

export default CartPage;
