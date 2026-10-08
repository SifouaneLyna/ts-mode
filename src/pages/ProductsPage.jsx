import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getLeafCategories } from '../services/api';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import { useI18n } from '../i18n/I18nContext';
import { loc } from '../utils/localize';

const norm = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function ProductsPage() {
  const { t, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const rawSearch = (searchParams.get('search') || '').trim();
  const terms = norm(rawSearch).split(/\s+/).filter(Boolean);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeafCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(activeCategory || undefined)
      .then(setProducts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const visible = terms.length
    ? products.filter((p) => {
        const hay = norm(`${p.name} ${p.description || ''} ${loc(p, 'name', lang)} ${loc(p, 'description', lang)}`);
        return terms.every((t) => hay.includes(t));
      })
    : products;

  return (
    <div className="container py-4">
      <h2 className="section-heading mb-0">{rawSearch ? t('products.search') : t('products.title')}</h2>
      <hr className="gold-rule" />
      {rawSearch && (
        <p className="text-center text-muted">
          {loading ? t('products.searching') : visible.length === 1 ? t('products.results.one', { q: rawSearch }) : t('products.results.many', { count: visible.length, q: rawSearch })}{' '}
          <Link to={activeCategory ? `/products?category=${activeCategory}` : '/products'}>{t('products.clear')}</Link>
        </p>
      )}
      <div className="row">
        <div className="col-md-3 mb-4">
          <h6 className="text-uppercase mb-3">{t('products.categories')}</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link
                to="/products"
                className={!activeCategory ? 'fw-bold' : ''}
                style={{ color: !activeCategory ? '#C89B48' : '#633E15' }}
              >
                {t('products.all')}
              </Link>
            </li>
            {categories.map(cat => (
              <li className="mb-2" key={cat._id}>
                <Link
                  to={`/products?category=${cat._id}`}
                  className={activeCategory === cat._id ? 'fw-bold' : ''}
                  style={{ color: activeCategory === cat._id ? '#C89B48' : '#633E15' }}
                >
                  {loc(cat, 'name', lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-9">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : visible.length === 0 ? (
            <p>{t('products.none')}</p>
          ) : (
            <div className="row g-4">
              {visible.map((product, i) => (
                <div className="col-6 col-lg-4" key={product._id}>
                  <Reveal delay={(i % 3) * 80}><ProductCard product={product} /></Reveal>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;