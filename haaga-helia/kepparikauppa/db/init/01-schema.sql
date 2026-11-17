-- Kepparikauppa schema
-- Runs automatically on first postgres container startup

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    image_data bytea,
    image_content_type TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    is_hobby_horse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_cents INTEGER NOT NULL DEFAULT 0,
    customer_name TEXT,
    customer_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL DEFAULT 0
);

-- Seed categories
INSERT INTO categories (name, slug) VALUES
    ('Keppihevoset', 'keppihevoset'),
    ('Varusteet', 'varusteet'),
    ('Tarvikkeet', 'tarvikkeet')
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (category_id, name, description, price_cents, image_url, stock, is_hobby_horse) VALUES
    ((SELECT id FROM categories WHERE slug = 'keppihevoset'),
     'Keppihevonen Classic', 'Klassinen puinen keppihevonen pehmeällä päällä.', 5900, NULL, 12, TRUE),
    ((SELECT id FROM categories WHERE slug = 'keppihevoset'),
     'Keppihevonen Deluxe', 'Deluxe-malli harjalla ja ohjaksilla.', 8900, NULL, 8, TRUE),
    ((SELECT id FROM categories WHERE slug = 'keppihevoset'),
     'Pikkukeppari', 'Lasten ensi-keppihevonen.', 3900, NULL, 15, TRUE),
    ((SELECT id FROM categories WHERE slug = 'varusteet'),
     'Ohjakset', 'Nahkaiset ohjakset keppihevoselle.', 1200, NULL, 20, FALSE),
    ((SELECT id FROM categories WHERE slug = 'varusteet'),
     'Satula', 'Pieni satula keppihevosen selkään.', 2500, NULL, 10, FALSE),
    ((SELECT id FROM categories WHERE slug = 'tarvikkeet'),
     'Harja', 'Harja keppihevosen harjalle.', 800, NULL, 30, FALSE),
    ((SELECT id FROM categories WHERE slug = 'tarvikkeet'),
     'Ruokakuppi', 'Mini-ruokakuppi leikkeihin.', 600, NULL, 25, FALSE)
ON CONFLICT DO NOTHING;

-- Seed a manager and a customer for demonstration
INSERT INTO users (email, password_hash, role) VALUES
    ('manager@keppari.fi', '$2b$10$JZu67u3mvgyESISexGKH3.lwzoRx5scC/xXmIgyTD/YHfzwHNPZpa', 'manager'),
    ('asiakas@keppari.fi', '$2b$10$JZu67u3mvgyESISexGKH3.lwzoRx5scC/xXmIgyTD/YHfzwHNPZpa', 'customer')
ON CONFLICT (email) DO NOTHING;
