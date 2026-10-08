import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import QuantityInput from '../components/QuantityInput';
import { img } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';
import { useAttr } from '../context/SiteSettingsContext';

function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { t, money, lang } = useI18n();
  const attr = useAttr();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="section-heading mb-0">{t('cart.empty')}</h2>
        <hr className="gold-rule" />
        <Link to="/products" className="btn btn-outline-gold">{t('cart.continue')}</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 860 }}>
      <h2 className="section-heading mb-0">{t('cart.title')}</h2>
      <hr className="gold-rule" />

      {items.map((item) => (
        <div className="cart-row" key={item.productId + JSON.stringify(item.attributes)}>
          <img src={img(item.image, 400, 'good')} alt={loc(item, 'name', lang)} />
          <div className="cart-info">
            <div className="cart-name">{loc(item, 'name', lang)}</div>
            <div className="cart-options">
              {attr.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </div>
            <div className="cart-unit">{money(item.unitPrice)}</div>
          </div>
          <QuantityInput value={item.quantity} onChange={(q) => updateQuantity(item.productId, item.attributes, q)} />
          <div className="cart-line">{money(item.unitPrice * item.quantity)}</div>
          <button className="cart-remove" aria-label={t('cart.remove')} onClick={() => removeFromCart(item.productId, item.attributes)}>×</button>
        </div>
      ))}

      <div className="text-end mt-4">
        <div className="fs-4 mb-3">{t('cart.total')}: <strong>{money(totalPrice)}</strong></div>
        <Link to="/checkout" className="btn btn-outline-gold">{t('cart.checkout')}</Link>
      </div>
    </div>
  );
}

export default CartPage;
