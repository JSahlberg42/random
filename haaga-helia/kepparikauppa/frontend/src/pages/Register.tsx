import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, managerCode);
      navigate('/');
    } catch {
      setError('Rekisteröinti epäonnistui. Sähköposti saattaa olla jo käytössä.');
    }
  };

  return (
    <div className="empty-page">
      <h1>Luo tili</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="checkout-form">
        <label>
          <span>Sähköposti</span>
          <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Salasana</span>
          <input name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          <span>Kauppiasrekisteröintikoodi (valinnainen)</span>
          <input
            name="manager_code"
            type="text"
            placeholder="Koodi…"
            value={managerCode}
            onChange={(e) => setManagerCode(e.target.value)}
          />
        </label>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
          Ilman koodia rekisteröidyt tavalliseksi asiakkaaksi.
        </p>
        <button type="submit" className="pay-btn">Luo tili</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Jo tunnukset? <Link to="/login">Kirjaudu</Link>
      </p>
      <p>
        <Link to="/">← Takaisin etusivulle</Link>
      </p>
    </div>
  );
}
