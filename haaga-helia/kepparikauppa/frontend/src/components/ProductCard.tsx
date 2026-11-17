import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';
import { eur } from '../lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <article className="card">
      <div className="card-image">
        {product.image_url ? (
          <img src={product.image_url} alt="" />
        ) : product.has_image ? (
          <img src={`/api/products/${product.id}/image`} alt="" />
        ) : (
          <span className="placeholder">🐎</span>
        )}
      </div>
      <Link to={`/product/${product.id}`} className="card-title">
        {product.name}
      </Link>
      <p className="card-desc">{product.description}</p>
      <div className="card-footer">
        <span className="card-price">{eur(product.price_cents)}</span>
        <button
          className="add-btn"
          onClick={() => addToCart(product)}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? 'Loppu varastosta' : 'Lisää koriin'}
        </button>
      </div>
    </article>
  );
}
