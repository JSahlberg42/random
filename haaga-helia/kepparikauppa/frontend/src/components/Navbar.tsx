import { NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { eur } from '../lib/format';

export default function Navbar() {
  const { itemCount, totalCents } = useCart();

  return (
    <nav>
      <div className="nav-inner">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'brand active' : 'brand')}>
          Kepparikauppa
        </NavLink>
        <div className="nav-right">
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'cart active' : 'cart')}>
            🛒 Ostoskori <span className="cart-count">{itemCount}</span>
          </NavLink>
          {itemCount > 0 && <span className="cart-total">{eur(totalCents)}</span>}
        </div>
      </div>
    </nav>
  );
}
