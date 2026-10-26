import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { useI18n } from '../i18n/I18nContext';

// A few other products of the shop (same category first). Shows nothing while loading or if there is nothing to show.
function RelatedProducts({ current, count = 4 }) {
  const { t } = useI18n();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((all) => {
        if (cancelled) return;
        const others = all.filter((p) => p._id !== current._id);
        const same = others.filter((p) => current.categoryId && p.categoryId === current.categoryId);
        const rest = others.filter((p) => !same.includes(p)).sort(() => Math.random() - 0.5);
        setItems([...same.sort(() => Math.random() - 0.5), ...rest].slice(0, count));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [current._id, current.categoryId, count]);

  if (!items.length) return null;

  return (
    <section className="related">
      <h3 className="section-heading mb-0">{t('pd.related')}</h3>
      <hr className="gold-rule" />
      <div className="row g-4">
        {items.map((product, i) => (
          <div className="col-6 col-md-3" key={product._id}>
            <Reveal delay={(i % 4) * 80}><ProductCard product={product} /></Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;