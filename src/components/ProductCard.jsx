import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
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
        <Link to={url} className="pcard-media" aria-label={product.name}>
          <img src={imageUrl} alt={product.name} loading="lazy" />
          <span className="pcard-shade" />
        </Link>
        {product.onSale && <span className="pcard-badge">-{product.salePercentage}%</span>}
        {soldOut && <span className="pcard-badge pcard-badge-dark">Sold out</span>}
        <button type="button" className="pcard-add" onClick={handleAddToCart} disabled={soldOut}>
          {product.hasVariants ? 'Choose options' : soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
      <div className="pcard-body">
        <h5 className="pcard-name"><Link to={url}>{product.name}</Link></h5>
        <div className="pcard-price">
          {product.onSale && <span className="pcard-old">{product.basePrice} DA</span>}
          <span>{finalPrice} DA</span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
