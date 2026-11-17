import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { eur } from '../lib/format';

export default function Cart() {
  const {
    items,
    removeFromCart,
    setQuantity,
    clearCart,
    totalCents,
    itemCount,
  } = useCart();

  if (itemCount === 0) {
    return (
      <div className="empty-page">
        <p>Ostoskori on tyhjä.</p>
        <Link to="/">Jatka ostoksia</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Ostoskori</h1>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.product.id} className="cart-item">
            <div className="cart-item-info">
              <strong>{item.product.name}</strong>
              <p>{eur(item.product.price_cents)} / kpl</p>
            </div>
            <div className="cart-item-controls">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  setQuantity(item.product.id, Math.max(1, Number(e.target.value) || 1))
                }
              />
              <button
                className="remove"
                onClick={() => removeFromCart(item.product.id)}
              >
                Poista
              </button>
            </div>
            <span className="cart-item-total">
              {eur(item.product.price_cents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="cart-total-row">
        Yhteensä: <strong>{eur(totalCents)}</strong>
      </div>
      <div className="cart-actions">
        <button className="clear" onClick={clearCart}>
          Tyhjennä kori
        </button>
        <Link to="/checkout" className="checkout-btn">
          Siirry kassalle
        </Link>
      </div>
    </div>
  );
}
