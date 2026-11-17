import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '../lib/api';
import type { Product } from '../types';
import { eur } from '../lib/format';

type Mode = 'list' | 'edit' | 'create';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_cents: '',
    stock: '',
    image_url: '',
    category_id: '',
    is_hobby_horse: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Tuotteiden lataus epäonnistui.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  let targetId: number | null = null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    targetId = null;
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price_cents: Number(form.price_cents) || 0,
        stock: Number(form.stock) || 0,
        image_url: form.image_url || undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        is_hobby_horse: Boolean(form.is_hobby_horse),
      };

      if (mode === 'create') {
        const created = await createProduct(payload);
        targetId = created.id;
      } else if (editing) {
        await updateProduct(String(editing.id), payload);
        targetId = editing.id;
      }

      // Upload image if one was selected
      if (imageFile && targetId) {
        await uploadProductImage(String(targetId), imageFile);
      }

      setForm({
        name: '',
        description: '',
        price_cents: '',
        stock: '',
        image_url: '',
        category_id: '',
        is_hobby_horse: false,
      });
      setImageFile(null);
      setEditing(null);
      setMode('list');
      await loadProducts();
    } catch {
      setError('Tallennus epäonnistui.');
    } finally {
      setSaving(false);
    }
  };

  const startCreate = () => {
    setEditing(null);
    setMode('create');
    setForm({ name: '', description: '', price_cents: '', stock: '', image_url: '', category_id: '', is_hobby_horse: false });
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setMode('edit');
    setForm({
      name: product.name,
      description: product.description ?? '',
      price_cents: String(product.price_cents),
      stock: String(product.stock),
      image_url: product.image_url ?? '',
      category_id: String(product.category_id ?? ''),
      is_hobby_horse: product.is_hobby_horse,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Poistetaanko tuote?')) return;
    try {
      await deleteProduct(String(id));
      await loadProducts();
    } catch {
      setError('Poisto epäonnistui.');
    }
  };

  return (
    <div className="cart-page">
      <h1>Tuotehallinta (kauppias)</h1>
      <p>
        <button onClick={startCreate} className="pay-btn" style={{ marginBottom: 16 }}>
          + Lisää uusi tuote
        </button>
      </p>
      {error && <p className="error">{error}</p>}
      {mode === 'list' ? (
        <>
          <ul className="cart-list">
            {products.map((p) => (
              <li key={p.id} className="cart-item">
                <div className="cart-item-info">
                  <strong>{p.name}</strong>
                  <p>{eur(p.price_cents)} · {p.stock} kpl varastossa</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => startEdit(p)}
                    className="pay-btn"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Muokkaa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="remove"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Poista
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p>
            <Link to="/">← Takaisin kauppaan</Link>
          </p>
        </>
      ) : (
        <>
          <h2>{mode === 'create' ? 'Uusi tuote' : 'Muokkaa tuotetta'}</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <label>
              <span>Nimi</span>
              <input name="name" required value={form.name} onChange={handleChange} />
            </label>
            <label>
              <span>Kuvaus</span>
              <input name="description" value={form.description} onChange={handleChange} />
            </label>
            <label>
              <span>Hinta (senttiä)</span>
              <input name="price_cents" type="number" value={form.price_cents} onChange={handleChange} />
            </label>
            <label>
              <span>Varastosaldo</span>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} />
            </label>
            <label>
              <span>Kuvan polku (ulkoinen URL)</span>
              <input name="image_url" value={form.image_url} onChange={handleChange} />
            </label>
            <label>
              <span>Lataa kuva tietokantaan</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.length) setImageFile(e.target.files[0]);
                }}
              />
              {imageFile && <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>{imageFile.name}</span>}
            </label>
            <label>
              <span>Kategoria ID</span>
              <input name="category_id" type="number" value={form.category_id} onChange={handleChange} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                name="is_hobby_horse"
                type="checkbox"
                checked={Boolean(form.is_hobby_horse)}
                onChange={handleChange}
              />
              <span>Onko keppihevonen</span>
            </label>
            <button type="submit" className="pay-btn" disabled={saving}>
              {saving ? 'Tallennetaan…' : mode === 'create' ? 'Luo tuote' : 'Tallenna'}
            </button>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="clear"
              style={{ marginLeft: 8 }}
            >
              Peruuta
            </button>
          </form>
          <p>
            <Link to="/">← Takaisin kauppaan</Link>
          </p>
        </>
      )}
    </div>
  );
}
