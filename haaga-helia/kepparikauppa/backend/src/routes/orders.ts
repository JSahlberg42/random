import { Router } from 'express';
import { pool } from '../db';
import { authenticate, AuthRequest, UserRole } from '../middleware/auth';

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

function isManager(req: AuthRequest): boolean {
  return req.user?.role === 'manager';
}

router.post('/', authenticate, async (req, res) => {
  const { items, total_cents, customer }: OrderBody = req.body;

  if (!Array.isArray(items) || items.length === 0 || !total_cents) {
    return res.status(400).json({ error: 'invalid order' });
  }

  const user = (req as any).user as { id: number; email: string; role: string };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'INSERT INTO orders (user_id, total_cents, customer_name, customer_email) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [user.id, total_cents, customer?.name ?? null, customer?.email ?? null]
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

router.get('/', authenticate, async (req, res) => {
  const user = (req as any).user as { id: number; email: string; role: string };

  let query = `
    SELECT o.id, o.total_cents, o.customer_name, o.customer_email, o.created_at
    FROM orders o
  `;
  const params: unknown[] = [];

  if (!isManager(req)) {
    query += ' WHERE o.user_id = $1';
    params.push(user.id);
  }

  query += ' ORDER BY o.created_at DESC';

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

router.get('/:id', authenticate, async (req, res) => {
  const user = (req as any).user as { id: number; email: string; role: string };

  let query = `
    SELECT o.id, o.user_id, o.total_cents, o.customer_name, o.customer_email, o.created_at
    FROM orders o
    WHERE o.id = $1
  `;
  const params: unknown[] = [req.params.id];

  if (!isManager(req)) {
    query += ' AND o.user_id = $2';
    params.push(user.id);
  }

  const { rows } = await pool.query(query, params);

  if (!rows[0]) {
    return res.status(404).json({ error: 'order not found' });
  }

  // Fetch order items
  const { rows: items } = await pool.query(
    'SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price_cents, p.name AS product_name FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1',
    [req.params.id]
  );

  res.json({ ...rows[0], items });
});

export default router;
