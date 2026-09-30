import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeafCategories } from '../services/api';

function SubcategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getLeafCategories().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container py-4">
      <h3 className="text-center text-uppercase mb-4">Shop by Category</h3>
      <div className="row g-4">
        {categories.map(cat => (
          <div className="col-6 col-md-3" key={cat._id}>
            <Link to={`/products?category=${cat._id}`} className="text-decoration-none">
              <div className="text-center">
                <div
                  style={{
                    height: '200px',
                    backgroundImage: `url(${cat.imageUrl || '/template/images/cat-item1.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <h5 className="mt-3 text-uppercase">{cat.name}</h5>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SubcategoryGrid;