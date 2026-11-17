import { Router } from 'express';
import { pool } from '../db';

type OrderItem = {
  productId: number;
  quantity: number;
  unitPriceCents: number;
};

type OrderBody = {
  items: OrderItem[];
  total_cents: number;
  customer?: { name?: string; email?: string };
};

const router = Router();

router.post('/', async (req, res) => {
  const { items, total_cents, customer }: OrderBody = req.body;

  if (!Array.isArray(items) || items.length === 0 || !total_cents) {
    return res.status(400).json({ error: 'invalid order' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'INSERT INTO orders (total_cents, customer_name, customer_email) VALUES ($1, $2, $3) RETURNING id, created_at',
      [total_cents, customer?.name ?? null, customer?.email ?? null]
    );

    const orderId = rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.unitPriceCents]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Order failed:', err);
    return res.status(500).json({ error: 'order failed' });
  } finally {
    client.release();
  }
});

export default router;
