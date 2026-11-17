import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { placeOrder } from '../lib/api';
import type { CartItem } from '../types';
import { eur } from '../lib/format';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalCents, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="empty-page">
        <p>Ostoskori on tyhjä.</p>
        <Link to="/">Ostoksille</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget as HTMLFormElement);
      const customer = {
        name: (form.get('name') as string) || '',
        email: (form.get('email') as string) || '',
      };
      const res = await placeOrder({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPriceCents: i.product.price_cents,
        })),
        total_cents: totalCents,
        customer,
      });
      clearCart();
      navigate(`/order-success/${res.orderId}`);
    } catch {
      setError('Tilauksen lähetys epäonnistui. Yritä uudelleen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout">
      <h1>Kassa</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="checkout-form">
        <label>
          <span>Nimi</span>
          <input name="name" required />
        </label>
        <label>
          <span>Sähköposti</span>
          <input name="email" type="email" required />
        </label>
        <div className="checkout-summary">
          <h3>Yhteenveto</h3>
          {items.map((i: CartItem) => (
            <div key={i.product.id} className="summary-row">
              {i.product.name} × {i.quantity}
              <span>{eur(i.product.price_cents * i.quantity)}</span>
            </div>
          ))}
          <div className="summary-total">
            Yhteensä: <strong>{eur(totalCents)}</strong>
          </div>
        </div>
        <button
          type="submit"
          className="pay-btn"
          disabled={submitting}
        >
          {submitting ? 'Lähetetään…' : 'Vahvista tilaus'}
        </button>
      </form>
    </div>
  );
}
