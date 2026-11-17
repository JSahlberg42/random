import { Router } from 'express';
import { pool } from '../db';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('manager'), async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users ORDER BY id'
  );
  res.json(rows);
});

router.patch(
  '/:id/role',
  authenticate,
  authorize('manager'),
  async (req, res) => {
    const { role } = req.body as { role: string };

    if (role !== 'customer' && role !== 'manager') {
      return res.status(400).json({ error: 'invalid role' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'user not found' });
    }

    return res.json(rows[0]);
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('manager'),
  async (req, res) => {
    const { rows } = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'user not found' });
    }

    return res.json({ deleted: true });
  }
);

export default router;
