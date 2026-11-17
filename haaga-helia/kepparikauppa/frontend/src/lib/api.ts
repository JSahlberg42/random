import { authHeaders } from './auth';
import type { Order } from '../types';

export type OrderItemInput = {
  productId: number;
  quantity: number;
  unitPriceCents: number;
};

export type OrderInput = {
  items: OrderItemInput[];
  total_cents: number;
  customer: { name: string; email: string };
};

export type OrderResult = {
  orderId: number;
};

export type NewProduct = {
  category_id?: number;
  name: string;
  description?: string;
  price_cents: number;
  image_url?: string;
  stock?: number;
  is_hobby_horse?: boolean;
};

export type UpdateProduct = Partial<NewProduct>;

export async function getCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function getProducts(category?: string) {
  const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

export async function createProduct(product: NewProduct) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(id: string, product: UpdateProduct) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function uploadProductImage(id: string, file: File) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`/api/products/${id}/image`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

export async function register(email: string, password: string, role?: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getMe() {
  const res = await fetch('/api/auth/me', { headers: authHeaders() });
  if (!res.ok) throw new Error('Session invalid');
  return res.json();
}

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to place order');
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load order');
  return res.json();
}
