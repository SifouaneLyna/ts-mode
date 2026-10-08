import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Hero from '../components/Hero';
import SubcategoryGrid from '../components/SubcategoryGrid';
import { useI18n } from '../i18n/I18nContext';

function Home() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => setSlow(true), 4000);
    getProducts()
      .then((data) => { if (!cancelled) { setProducts(data); setError(false); } })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { clearTimeout(timer); if (!cancelled) { setSlow(false); setLoading(false); } });
    return () => { cancelled = true; clearTimeout(timer); };
  }, [attempt]);

  return (
    <>
      <Hero />
      <SubcategoryGrid />
      <div className="container py-4">
        <h3 className="section-heading mb-0">{t('home.collection')}</h3>
        <hr className="gold-rule" />
        {loading ? (
          <p className="text-center text-muted">
            {t('common.loading')}{slow && ` ${t('common.waking')}`}
          </p>
        ) : error ? (
          <div className="text-center">
            <p className="text-muted">{t('home.loadError')}</p>
            <button className="btn btn-outline-gold" onClick={() => { setLoading(true); setAttempt((n) => n + 1); }}>{t('home.retry')}</button>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted">{t('home.empty')}</p>
        ) : (
          <div className="row g-4">
            {products.map((product, i) => (
              <div className="col-6 col-md-4 col-lg-3" key={product._id}>
                <Reveal delay={(i % 4) * 80}><ProductCard product={product} /></Reveal>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;