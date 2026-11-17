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
