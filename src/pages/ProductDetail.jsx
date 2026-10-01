import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import QuantityInput from '../components/QuantityInput';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
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
    addToCart(product, product.hasVariants ? selectedAttributes : {}, Math.min(quantity, availableStock), finalPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const canAddToCart = product.hasVariants
    ? allAttributesSelected && availableStock > 0
    : availableStock > 0;

  const baseImages = product.images?.length ? product.images : ['/template/images/product-item-1.jpg'];
  const gallery = matchedVariant?.images?.length ? matchedVariant.images : baseImages;
  const mainImage = gallery[activeImage] ?? gallery[0];

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-6">
          <img src={mainImage} alt={product.name} className="pd-image" />
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((img, i) => (
                <img key={img + i} src={img} alt="" className={img === mainImage ? 'active' : ''} onClick={() => setActiveImage(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h1 className="pd-title">{product.name}</h1>
          <hr className="gold-rule ms-0" />
          <div className="pd-price">
            {product.onSale ? (
              <>
                <span className="pd-old">{product.basePrice} DA</span>
                <span>{finalPrice} DA</span>
              </>
            ) : (
              <span>{product.basePrice} DA</span>
            )}
          </div>
          <p className="pd-desc">{product.description}</p>

          {attributeKeys.map((key) => (
            <div key={key} className="mb-4">
              <div className="pd-label">{key}</div>
              <div className="d-flex gap-2 flex-wrap">
                {getOptionsFor(key).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`opt-btn ${selectedAttributes[key] === value ? 'selected' : ''}`}
                    onClick={() => { setSelectedAttributes((prev) => ({ ...prev, [key]: value })); setActiveImage(0); }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-4">
            <div className="pd-label">Quantity</div>
            <QuantityInput value={quantity} onChange={setQuantity} max={availableStock > 0 ? availableStock : undefined} />
          </div>

          <button className="btn btn-outline-gold w-100" disabled={!canAddToCart} onClick={handleAddToCart}>
            {added ? 'Added!' : product.hasVariants && !allAttributesSelected ? 'Select options' : availableStock === 0 ? 'Out of stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
