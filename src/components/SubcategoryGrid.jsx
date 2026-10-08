import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeafCategories } from '../services/api';
import Reveal from './Reveal';
import { img } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';

function SubcategoryGrid() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getLeafCategories().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container py-4">
      <h3 className="section-heading mb-0">{t('cat.shopBy')}</h3>
      <hr className="gold-rule" />
      <div className="row g-4">
        {categories.map((cat, i) => (
          <div className="col-6 col-md-3" key={cat._id}>
            <Reveal delay={(i % 4) * 80}>
            <Link to={`/products?category=${cat._id}`} className="cat-card">
              <div className="cat-card-img" style={{ backgroundImage: `url(${img(cat.imageUrl, 900) || '/template/images/cat-item1.jpg'})` }} />
              <div className="cat-card-shade" />
              <div className="cat-card-label">
                <h5>{loc(cat, 'name', lang)}</h5>
                <span>{t('cat.discover')}</span>
              </div>
            </Link>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SubcategoryGrid;