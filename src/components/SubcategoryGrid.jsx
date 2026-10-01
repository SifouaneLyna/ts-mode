import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeafCategories } from '../services/api';
import Reveal from './Reveal';

function SubcategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getLeafCategories().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container py-4">
      <h3 className="section-heading mb-0">Shop by Category</h3>
      <hr className="gold-rule" />
      <div className="row g-4">
        {categories.map((cat, i) => (
          <div className="col-6 col-md-3" key={cat._id}>
            <Reveal delay={(i % 4) * 80}>
            <Link to={`/products?category=${cat._id}`} className="cat-card">
              <div className="cat-card-img" style={{ backgroundImage: `url(${cat.imageUrl || '/template/images/cat-item1.jpg'})` }} />
              <div className="cat-card-shade" />
              <div className="cat-card-label">
                <h5>{cat.name}</h5>
                <span>Discover</span>
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