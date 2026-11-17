import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProduct } from '../lib/api';
import type { Product } from '../types';
import { eur } from '../lib/format';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getProduct(id)
      .then((p) => {
        if (mounted) setProduct(p);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p>Ladataan tuotetta...</p>;
  if (!product) {
    return (
      <div className="empty-page">
        <p>Tuotetta ei löydy.</p>
        <Link to="/">Takaisin etusivulle</Link>
      </div>
    );
  }

  return (
    <div className="detail">
      <Link to="/" className="back">
        ← Takaisin etusivulle
      </Link>
      <div className="detail-body">
        <div className="detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt="" />
          ) : (
            <span className="placeholder detail-placeholder">🐎</span>
          )}
        </div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="meta">
            Luokka: {product.category_name ?? '—'} ·{' '}
            {product.is_hobby_horse ? 'Keppihevonen' : 'Varuste / tarvike'}
          </p>
          <p className="price">{eur(product.price_cents)}</p>
          <p className={product.stock > 0 ? 'stock in-stock' : 'stock out-stock'}>
            {product.stock > 0
              ? `Varaa: ${product.stock} kpl`
              : 'Loppu varastosta'}
          </p>
          <div className="actions">
            <label>
              Määrä{' '}
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </label>
            <button
              className="buy-btn"
              onClick={() => {
                for (let i = 0; i < qty; i++) {
                  addToCart(product);
                }
                navigate('/cart');
              }}
              disabled={product.stock <= 0}
            >
              Lisää koriin ({eur(product.price_cents)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
