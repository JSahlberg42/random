export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
  is_hobby_horse: boolean;
  category_name?: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  id: number;
  email: string;
  role: 'customer' | 'manager';
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Order = {
  id: number;
  user_id: number | null;
  total_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  product_name?: string;
};
