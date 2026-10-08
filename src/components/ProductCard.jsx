import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n/I18nContext';
import { img } from '../utils/img';
import { loc } from '../utils/localize';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t, money, lang } = useI18n();
  const name = loc(product, 'name', lang);
  const navigate = useNavigate();

  const finalPrice = product.onSale
    ? Math.round(product.basePrice * (1 - product.salePercentage / 100))
    : product.basePrice;
  const imageUrl = product.images?.[0] || '/template/images/product-item-1.jpg';
  const soldOut = !product.hasVariants && !(product.stockQty > 0);
  const url = `/product/${product._id}`;

  function handleAddToCart(e) {
    e.preventDefault();
    if (product.hasVariants) { navigate(url); return; } // needs a variant choice
    if (!soldOut) addToCart(product, {}, 1, finalPrice);
  }

  return (
    <article className="pcard">
      <div className="pcard-top">
        <Link to={url} className="pcard-media" aria-label={name}>
          <img src={img(imageUrl, 800)} alt={name} loading="lazy" decoding="async" />
          <span className="pcard-shade" />
        </Link>
        {product.onSale && <span className="pcard-badge sale">-{product.salePercentage}%</span>}
        {soldOut && <span className="pcard-badge pcard-badge-dark">{t('product.soldOut')}</span>}
        <button type="button" className="pcard-add" onClick={handleAddToCart} disabled={soldOut}>
          {product.hasVariants ? t('product.options') : soldOut ? t('product.soldOut') : t('product.add')}
        </button>
      </div>
      <div className="pcard-body">
        <h5 className="pcard-name"><Link to={url}>{name}</Link></h5>
        <div className="pcard-price">
          {product.onSale && <span className="pcard-old">{money(product.basePrice)}</span>}
          <span>{money(finalPrice)}</span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
