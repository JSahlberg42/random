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

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to place order');
  return res.json();
}
