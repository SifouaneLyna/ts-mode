import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import SubcategoryGrid from '../components/SubcategoryGrid';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <SubcategoryGrid />
      <div className="container py-4">
        <h3 className="text-uppercase mb-4">All Products</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="row g-4">
            {products.map(product => (
              <div className="col-6 col-md-4 col-lg-3" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;