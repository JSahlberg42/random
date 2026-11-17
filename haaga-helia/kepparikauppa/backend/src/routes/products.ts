import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;

  let query = `
    SELECT p.id, p.category_id, p.name, p.description, p.price_cents,
           p.image_url, p.stock, p.is_hobby_horse,
           c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;
  const params: unknown[] = [];

  if (category) {
    query += ' WHERE c.slug = $1';
    params.push(category);
  }

  query += ' ORDER BY p.id';

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'product not found' });
  }

  res.json(rows[0]);
});

export default router;
