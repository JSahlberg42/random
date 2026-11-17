import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, slug FROM categories ORDER BY name'
  );
  res.json(rows);
});

export default router;
