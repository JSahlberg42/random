import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../lib/api';
import type { Order, OrderItem } from '../types';
import { eur } from '../lib/format';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getOrder(id)
      .then((data) => {
        if (mounted) setOrder(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p>Ladataan tilausta...</p>;
  if (!order) {
    return (
      <div className="empty-page">
        <p>Tilausta ei löydy.</p>
        <Link to="/orders">Tilaushistoriaan</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Tilaus #{order.id}</h1>
      <p>{new Date(order.created_at).toLocaleString('fi-FI')}</p>
      <ul className="cart-list">
        {(order.items || []).map((item: OrderItem) => (
          <li key={item.id} className="cart-item">
            <div className="cart-item-info">
              <strong>{item.product_name ?? 'Tuote'}</strong>
              <p>× {item.quantity}</p>
            </div>
            <div className="cart-item-total">
              {eur(item.unit_price_cents * item.quantity)}
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-total-row">
        Yhteensä: <strong>{eur(order.total_cents)}</strong>
      </div>
      <p>
        <Link to="/orders">← Tilaushistoriaan</Link>
      </p>
    </div>
  );
}
