import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

pool.connect()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Kepparikauppa backend listening on :${PORT}`);
    });
  })
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', err);
    process.exit(1);
  });
