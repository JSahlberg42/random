import { Router } from 'express';
import { pool } from '../db';
import { authenticate, authorize } from '../middleware/auth';

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

router.post(
  '/',
  authenticate,
  authorize('manager'),
  async (req, res) => {
    const {
      category_id,
      name,
      description,
      price_cents,
      image_url,
      stock,
      is_hobby_horse,
    } = req.body as {
      category_id?: number;
      name: string;
      description?: string;
      price_cents: number;
      image_url?: string;
      stock?: number;
      is_hobby_horse?: boolean;
    };

    if (!name || price_cents === undefined) {
      return res.status(400).json({ error: 'name and price_cents are required' });
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO products
           (category_id, name, description, price_cents, image_url, stock, is_hobby_horse)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          category_id ?? null,
          name,
          description ?? null,
          price_cents,
          image_url ?? null,
          stock ?? 0,
          is_hobby_horse ?? false,
        ]
      );

      return res.status(201).json(rows[0]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Create product failed:', err);
      return res.status(500).json({ error: 'failed to create product' });
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize('manager'),
  async (req, res) => {
    const {
      category_id,
      name,
      description,
      price_cents,
      image_url,
      stock,
      is_hobby_horse,
    } = req.body as {
      category_id?: number;
      name?: string;
      description?: string;
      price_cents?: number;
      image_url?: string;
      stock?: number;
      is_hobby_horse?: boolean;
    };

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category_id !== undefined) {
      updates.push(`category_id = $${paramIndex++}`);
      params.push(category_id);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (price_cents !== undefined) {
      updates.push(`price_cents = $${paramIndex++}`);
      params.push(price_cents);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      params.push(image_url);
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`);
      params.push(stock);
    }
    if (is_hobby_horse !== undefined) {
      updates.push(`is_hobby_horse = $${paramIndex++}`);
      params.push(is_hobby_horse);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'no fields to update' });
    }

    params.push(req.params.id);

    try {
      const { rows } = await pool.query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'product not found' });
      }

      return res.json(rows[0]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Update product failed:', err);
      return res.status(500).json({ error: 'failed to update product' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('manager'),
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'product not found' });
      }

      return res.json({ deleted: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete product failed:', err);
      return res.status(500).json({ error: 'failed to delete product' });
    }
  }
);

export default router;
