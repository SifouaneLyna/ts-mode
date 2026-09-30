import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getLeafCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

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

  return (
    <div className="container py-4">
      <h2 className="section-heading mb-0">Products</h2>
      <hr className="gold-rule" />
      <div className="row">
        <div className="col-md-3 mb-4">
          <h6 className="text-uppercase mb-3">Categories</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link
                to="/products"
                className={!activeCategory ? 'fw-bold' : ''}
                style={{ color: !activeCategory ? '#C89B48' : '#633E15' }}
              >
                All
              </Link>
            </li>
            {categories.map(cat => (
              <li className="mb-2" key={cat._id}>
                <Link
                  to={`/products?category=${cat._id}`}
                  className={activeCategory === cat._id ? 'fw-bold' : ''}
                  style={{ color: activeCategory === cat._id ? '#C89B48' : '#633E15' }}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-9">
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="row g-4">
              {products.map(product => (
                <div className="col-6 col-lg-4" key={product._id}>
                  <ProductCard product={product} />
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