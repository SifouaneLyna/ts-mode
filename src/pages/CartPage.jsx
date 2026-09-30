import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary mt-3">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Cart</h2>
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Product</th>
            <th>Options</th>
            <th>Quantity</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  {item.name}
                </div>
              </td>
              <td>
                {Object.entries(item.attributes).map(([key, value]) => (
                  <span key={key} className="me-2">{key}: {value}</span>
                ))}
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.productId, item.attributes, Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-control"
                  style={{ width: '70px' }}
                />
              </td>
              <td>{item.unitPrice * item.quantity} DA</td>
              <td>
                <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item.productId, item.attributes)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-end">
        <h4>Total: {totalPrice} DA</h4>
        <Link to="/checkout" className="btn btn-dark btn-lg mt-3">Proceed to Checkout</Link>
      </div>
    </div>
  );
}

export default CartPage;