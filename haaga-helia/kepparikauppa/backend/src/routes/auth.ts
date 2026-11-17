import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { authenticate, AuthRequest, JWT_SECRET, UserRole } from '../middleware/auth';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  const { email, password, manager_code } = req.body as {
    email: string;
    password: string;
    manager_code?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const expectedCode = process.env.MANAGER_REGISTRATION_CODE;
  const isManagerRequest = Boolean(expectedCode && manager_code === expectedCode);

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole: UserRole = isManagerRequest ? 'manager' : 'customer';

    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email, passwordHash, userRole]
    );

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Register failed:', err);
    res.status(500).json({ error: 'registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login failed:', err);
    res.status(500).json({ error: 'login failed' });
  }
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
  const user = req.user as { id: number; email: string; role: string };
  res.json({ id: user.id, email: user.email, role: user.role });
});

export default router;
