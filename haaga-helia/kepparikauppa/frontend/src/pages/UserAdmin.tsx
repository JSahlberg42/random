import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUsers, updateUserRole } from '../lib/api';
import type { User } from '../types';

export default function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getUsers()
      .then((data) => {
        if (mounted) setUsers(data);
      })
      .catch(() => {
        if (mounted) setError('Käyttäjien lataus epäonnistui.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const changeRole = async (user: User, newRole: string) => {
    try {
      const updated = await updateUserRole(String(user.id), newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch {
      setError('Roolin vaihto epäonnistui.');
    }
  };

  const removeUser = async (id: number) => {
    if (!confirm('Poistetaanko käyttäjä?')) return;
    try {
      await deleteUser(String(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Poisto epäonnistui.');
    }
  };

  if (loading) return <p>Ladataan käyttäjiä...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="cart-page">
      <h1>Käyttäjähallinta (kauppias)</h1>
      {error && <p className="error">{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Sähköposti</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Rooli</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Luo tili</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f1e9dc' }}>
              <td style={{ padding: '8px' }}>{u.email}</td>
              <td style={{ padding: '8px' }}>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u, e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6 }}
                >
                  <option value="customer">Asiakas</option>
                  <option value="manager">Kauppias</option>
                </select>
              </td>
              <td style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                {new Date(u.created_at).toLocaleString('fi-FI')}
              </td>
              <td style={{ padding: '8px' }}>
                <button
                  onClick={() => removeUser(u.id)}
                  className="remove"
                  disabled={u.email === 'manager@keppari.fi'}
                  title={
                    u.email === 'manager@keppari.fi'
                      ? 'Pääkäyttäjää ei voi poistaa'
                      : undefined
                  }
                >
                  Poista
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 16 }}>
        <Link to="/manager/products" className="clear">
          ← Tuotehallintaan
        </Link>
        {'   '}
        <Link to="/">← Takaisin etusivulle</Link>
      </p>
    </div>
  );
}
