import { NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { eur } from '../lib/format';

export default function Navbar() {
  const { itemCount, totalCents } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="nav-inner">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'brand active' : 'brand')}>
          Kepparikauppa
        </NavLink>
        <div className="nav-right">
          {user ? (
            <>
              {user.role === 'manager' && (
                <NavLink to="/manager/products" className={({ isActive }) => (isActive ? 'cart active' : 'cart')}>
                  🛠️ Tuotehallinta
                </NavLink>
              )}
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'cart active' : 'cart')}>
                📦 Tilaukset
              </NavLink>
              {itemCount > 0 && (
                <NavLink to="/cart" className={({ isActive }) => (isActive ? 'cart active' : 'cart')}>
                  🛒 Ostoskori <span className="cart-count">{itemCount}</span>
                </NavLink>
              )}
              {itemCount > 0 && <span className="cart-total">{eur(totalCents)}</span>}
              <button onClick={logout} className="clear" style={{ marginLeft: 10 }}>
                Kirjaudu ulos ({user.email})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="cart">
                🔑 Kirjaudu sisään
              </NavLink>
              <NavLink to="/register" className="cart">
                📝 Rekisteröidy
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
