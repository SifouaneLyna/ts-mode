import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    getProductById(productId)
      .then(setProduct)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="container mt-5">Loading...</p>;
  if (!product) return <p className="container mt-5">Product not found.</p>;

  const finalPrice = product.onSale
    ? Math.round(product.basePrice * (1 - product.salePercentage / 100))
    : product.basePrice;

  // Collect the distinct attribute keys across all variants (e.g. "color", "size")
  const attributeKeys = product.hasVariants
    ? [...new Set(product.variants.flatMap(v => Object.keys(v.attributes)))]
    : [];

  // Get the distinct values available for one attribute key (e.g. all colors)
  function getOptionsFor(key) {
    return [...new Set(product.variants.map(v => v.attributes[key]))];
  }

  // Find the specific variant matching everything currently selected
  const matchedVariant = product.hasVariants
    ? product.variants.find(v =>
        attributeKeys.every(key => v.attributes[key] === selectedAttributes[key])
      )
    : null;

  const allAttributesSelected = attributeKeys.every(key => selectedAttributes[key]);
  const availableStock = product.hasVariants
    ? (matchedVariant?.stockQty ?? 0)
    : product.stockQty;

  function handleAddToCart() {
    addToCart(product, product.hasVariants ? selectedAttributes : {}, quantity, finalPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const canAddToCart = product.hasVariants
    ? allAttributesSelected && availableStock > 0
    : availableStock > 0;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.images?.[0] || '/template/images/product-item-1.jpg'}
            alt={product.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>

          {product.onSale ? (
            <p>
              <span className="text-decoration-line-through text-muted me-2">{product.basePrice} DA</span>
              <span className="text-danger fw-bold">{finalPrice} DA</span>
            </p>
          ) : (
            <p className="fs-4">{product.basePrice} DA</p>
          )}

          {attributeKeys.map(key => (
            <div key={key} className="mb-3">
              <label className="d-block text-uppercase fw-bold mb-2">{key}</label>
              <div className="d-flex gap-2 flex-wrap">
                {getOptionsFor(key).map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`btn ${selectedAttributes[key] === value ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSelectedAttributes(prev => ({ ...prev, [key]: value }))}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {product.hasVariants && allAttributesSelected && (
            <p className={availableStock > 0 ? 'text-success' : 'text-danger'}>
              {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
            </p>
          )}

          <div className="mb-3">
            <label className="d-block text-uppercase fw-bold mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={availableStock || 1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="form-control"
              style={{ width: '100px' }}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;