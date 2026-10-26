import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import QuantityInput from '../components/QuantityInput';
import { img } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';
import { useAttr } from '../context/SiteSettingsContext';
import { track } from '../utils/pixel';
import ProductGallery from '../components/ProductGallery';
import { isColorName } from '../utils/attributes';
import ProductHighlights from '../components/ProductHighlights';
import RelatedProducts from '../components/RelatedProducts';

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
  const galleryRef = useRef(null);

// a new product: start at the top of the page
useEffect(() => { window.scrollTo({ top: 0 }); }, [productId]);

  useEffect(() => {
    getProductById(productId)
      .then(setProduct)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const price = product.onSale ? Math.round(product.basePrice * (1 - product.salePercentage / 100)) : product.basePrice;
    track('ViewContent', { content_ids: [product._id], content_name: product.name, content_type: 'product', value: price, currency: 'DZD' });
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

     // when an option has a single value (for example one size), choose it automatically
  // choose automatically: options with a single value, and the first color (one that is in stock if possible)
  useEffect(() => {
    if (!product?.hasVariants) return;
    const keys = [...new Set(product.variants.flatMap((v) => Object.keys(v.attributes || {})))];
    const auto = {};
    for (const key of keys) {
      const values = [...new Set(product.variants.map((v) => attr.canonical(v.attributes[key])))];
      const inStock = values.find((val) => product.variants.some((v) => attr.canonical(v.attributes[key]) === val && v.stockQty > 0));
      if (isColorName(key)) auto[key] = inStock ?? values[0];
      else if (values.length === 1) auto[key] = values[0];
    }
    if (Object.keys(auto).length) setSelectedAttributes((prev) => ({ ...auto, ...prev }));
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      track('AddToCart', { content_ids: [product._id], content_name: product.name, content_type: 'product', value: finalPrice * Math.min(quantity, availableStock), currency: 'DZD' });
    if (goToCheckout === true) { navigate('/checkout', { state: { guest: true } }); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }
  // choosing a color brings the pictures of that color into view (on a phone they are above the options)
function chooseOption(key, value) {
  setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
  setActiveImage(0);
  if (!isColorName(key)) return;
  const el = galleryRef.current;
  if (el && el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
  const soldOut = availableStock === 0 && (!product.hasVariants || allAttributesSelected);
  const canAddToCart = product.hasVariants
    ? allAttributesSelected && availableStock > 0
    : availableStock > 0;

  const baseImages = product.images?.length ? product.images : ['/template/images/product-item-1.jpg'];
    // pictures of the chosen color (even before a size is chosen); otherwise the product's own pictures
  const colorKey = attributeKeys.find((k) => isColorName(k));
  const colorImages = colorKey && selectedAttributes[colorKey]
    ? product.variants.find((v) => v.images?.length && attr.canonical(v.attributes[colorKey]) === selectedAttributes[colorKey])?.images
    : null;
  const gallery = matchedVariant?.images?.length ? matchedVariant.images : colorImages?.length ? colorImages : baseImages;
  const mainImage = gallery[activeImage] ?? gallery[0];

  return (
    <div className="container py-5">
      <div className="row gy-5 gx-3 gx-md-5">
        <div className="col-md-6">
  <div ref={galleryRef} className="pd-gallery-anchor">
    <div key={gallery.join('|')} className="pd-gallery-swap">
      <ProductGallery images={gallery} alt={loc(product, 'name', lang)} badge={product.onSale ? `-${product.salePercentage}%` : ''} />
    </div>
  </div>
</div>

        <div className="col-md-6 pd-info">
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
          <div className="pd-trust">
  <span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
    <b>{t('checkout.deliveryTime')}</b>
  </span>
  <span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    {t('footer.cod')}
  </span>
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
                    onClick={() => chooseOption(key, value)}
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
             {product.hasVariants && !allAttributesSelected && (
     <p className="small text-muted mb-2">
       {t('pd.chooseHint', { options: attributeKeys.filter((k) => !selectedAttributes[k]).map((k) => attr.name(k)).join(' / ') })}
     </p>
   )}

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

      <ProductHighlights blocks={product.highlights} />
      <RelatedProducts current={product} />
    </div>
  );
}

export default ProductDetail;
