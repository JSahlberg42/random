import { useEffect, useState } from 'react';
import { getCategories, getProducts } from '../lib/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('keppihevoset');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCategories(), getProducts(activeSlug)]).then(
      ([cats, prods]) => {
        if (mounted) {
          setCategories(cats);
          setProducts(prods);
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, [activeSlug]);

  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog">
      <h1>Tervetuloa Keppikauppaan!</h1>
      <p className="lead">
        Laadukkaita keppihevosia, varusteita ja tarvikkeita pienille ja
        isoille ratsastajille.
      </p>
      <div className="chip-group">
        {categories.map((c) => (
          <button
            key={c.id}
            className={c.slug === activeSlug ? 'chip active' : 'chip'}
            onClick={() => selectCategory(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
      {loading ? (
        <p>Ladataan tuotteita...</p>
      ) : products.length === 0 ? (
        <p>Tuotteita ei löydy tästä luokasta.</p>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
