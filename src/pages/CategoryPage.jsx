import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

function CategoryPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(categoryId)
      .then(setProducts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) return <p className="container mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Products</h1>
      {products.length === 0 ? (
        <p>No products in this category yet.</p>
      ) : (
        <div className="row g-4">
          {products.map(product => (
            <div className="col-md-4" key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;