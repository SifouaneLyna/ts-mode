import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import QuantityInput from '../components/QuantityInput';
import { img } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';
import { useAttr } from '../context/SiteSettingsContext';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t, money, lang } = useI18n();
  const attr = useAttr();

  useEffect(() => {
    getProductById(productId)
      .then(setProduct)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="container mt-5">{t('common.loading')}</p>;
  if (!product) return <p className="container mt-5">{t('pd.notFound')}</p>;

  const finalPrice = product.onSale
    ? Math.round(product.basePrice * (1 - product.salePercentage / 100))
    : product.basePrice;

  // Collect the distinct attribute keys across all variants (e.g. "color", "size")
  const attributeKeys = product.hasVariants
    ? [...new Set(product.variants.flatMap(v => Object.keys(v.attributes)))]
    : [];

  // Get the distinct values available for one attribute key (e.g. all colors)
  const canon = (value) => attr.canonical(value);
  function getOptionsFor(key) {
    return [...new Set(product.variants.map(v => canon(v.attributes[key])))];
  }

  // Find the specific variant matching everything currently selected
  const matchedVariant = product.hasVariants
    ? product.variants.find(v =>
        attributeKeys.every(key => canon(v.attributes[key]) === selectedAttributes[key])
      )
    : null;

  const allAttributesSelected = attributeKeys.every(key => selectedAttributes[key]);
  const availableStock = product.hasVariants
    ? (matchedVariant?.stockQty ?? 0)
    : product.stockQty;

  function handleAddToCart(goToCheckout = false) {
    addToCart(product, product.hasVariants ? { ...matchedVariant.attributes } : {}, Math.min(quantity, availableStock), finalPrice);
    if (goToCheckout === true) { navigate('/checkout', { state: { guest: true } }); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const soldOut = availableStock === 0 && (!product.hasVariants || allAttributesSelected);
  const canAddToCart = product.hasVariants
    ? allAttributesSelected && availableStock > 0
    : availableStock > 0;

  const baseImages = product.images?.length ? product.images : ['/template/images/product-item-1.jpg'];
  const gallery = matchedVariant?.images?.length ? matchedVariant.images : baseImages;
  const mainImage = gallery[activeImage] ?? gallery[0];

  return (
    <div className="container py-5">
      <div className="row gy-5 gx-3 gx-md-5">
        <div className="col-md-6">
          <img src={img(mainImage, 1400, 'best')} alt={loc(product, 'name', lang)} className="pd-image" decoding="async" />
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((url, i) => (
                <img key={url + i} src={img(url, 300, 'good')} alt="" className={url === mainImage ? 'active' : ''} onClick={() => setActiveImage(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h1 className="pd-title">{loc(product, 'name', lang)}</h1>
          <hr className="gold-rule ms-0" />
          <div className="pd-price">
            {product.onSale ? (
              <>
                <span className="pd-old">{money(product.basePrice)}</span>
                <span>{money(finalPrice)}</span>
                <span className="pd-badge">-{product.salePercentage}%</span>
              </>
            ) : (
              <span>{money(product.basePrice)}</span>
            )}
          </div>
          <p className="pd-desc">{loc(product, 'description', lang)}</p>

          {attributeKeys.map((key) => (
            <div key={key} className="mb-4">
              <div className="pd-label">{attr.name(key)}</div>
              <div className="d-flex gap-2 flex-wrap">
                {getOptionsFor(key).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`opt-btn ${selectedAttributes[key] === value ? 'selected' : ''}`}
                    onClick={() => { setSelectedAttributes((prev) => ({ ...prev, [key]: value })); setActiveImage(0); }}
                  >
                    {attr.value(value)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-4">
            <div className="pd-label">{t('pd.quantity')}</div>
            <QuantityInput value={quantity} onChange={setQuantity} max={availableStock > 0 ? availableStock : undefined} />
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2">
            {!soldOut && (
              <button className="btn btn-gold-solid flex-fill" disabled={!canAddToCart} onClick={() => handleAddToCart(true)}>
                {t('pd.buyNow')}
              </button>
            )}
            <button className={`btn btn-outline-gold flex-fill ${soldOut ? 'is-soldout' : ''}`} disabled={!canAddToCart} onClick={() => handleAddToCart()}>
              {added ? t('pd.added') : product.hasVariants && !allAttributesSelected ? t('pd.selectOptions') : soldOut ? t('pd.outOfStock') : t('pd.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
