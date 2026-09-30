import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const finalPrice = product.onSale
    ? Math.round(product.basePrice * (1 - product.salePercentage / 100))
    : product.basePrice;

  const imageUrl = product.images?.[0] || '/template/images/product-item-1.jpg';

  function handleAddToCart(e) {
    e.preventDefault();

    if (product.hasVariants) {
      // Can't add directly without knowing which variant — send them to pick one
      navigate(`/product/${product._id}`);
      return;
    }

    if (product.stockQty > 0) {
      addToCart(product, {}, 1, finalPrice);
    }
  }

  return (
    <div className="product-item image-zoom-effect link-effect">
      <div className="image-holder position-relative">
        <Link to={`/product/${product._id}`}>
          <img
              src={imageUrl}
              alt={product.name}
              className="product-image img-fluid"
              style={{ width: '100%', height: '260px', objectFit: 'cover' }}
          />
        </Link>
        <a href="#" className="btn-icon btn-wishlist">
          <svg width="24" height="24" viewBox="0 0 24 24"><use href="#heart"></use></svg>
        </a>
        <div className="product-content">
          <h5 className="element-title text-uppercase mt-3">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h5>
          {product.onSale ? (
            <a href="#" className="text-decoration-none" data-after="Add to cart" onClick={handleAddToCart}>
              <span className="text-decoration-line-through text-muted me-2">{product.basePrice} DA</span>
              <span>{finalPrice} DA</span>
            </a>
          ) : (
            <a href="#" className="text-decoration-none" data-after="Add to cart" onClick={handleAddToCart}>
              <span>{product.basePrice} DA</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;