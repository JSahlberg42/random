import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../lib/api';
import type { Order } from '../types';
import { eur } from '../lib/format';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getOrders()
      .then((data) => {
        if (mounted) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Tilausten lataus epäonnistui.');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Ladataan tilauksia...</p>;
  if (error) return <p className="error">{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="empty-page">
        <p>Sinulla ei ole tilauksia.</p>
        <Link to="/">Ostoksille</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Tilaushistoria</h1>
      <ul className="cart-list">
        {orders.map((order: Order) => (
          <li key={order.id} className="cart-item">
            <div className="cart-item-info">
              <strong>Tilaus #{order.id}</strong>
              <p>{new Date(order.created_at).toLocaleString('fi-FI')}</p>
            </div>
            <div className="cart-item-total">
              {eur(order.total_cents)}
            </div>
          </li>
        ))}
      </ul>
      <p>
        <Link to="/">← Takaisin etusivulle</Link>
      </p>
    </div>
  );
}
