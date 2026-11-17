import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Väärä sähköposti tai salasana.');
    }
  };

  return (
    <div className="empty-page">
      <h1>Kirjaudu sisään</h1>
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
        <button type="submit" className="pay-btn">Kirjaudu</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Ei vielä tunnusta? <Link to="/register">Rekisteröidy</Link>
      </p>
      <p>
        <Link to="/">← Takaisin etusivulle</Link>
      </p>
    </div>
  );
}
