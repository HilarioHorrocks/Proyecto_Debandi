-- Script de inicialización de la base de datos para tienda de herramientas
-- Ejecutar este script en DBEaver con tu base de datos PostgreSQL

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  rating DECIMAL(2, 1) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  brand VARCHAR(100),
  specs JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de orden
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Tabla de reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Insertar categorías de ejemplo
INSERT INTO categories (name, slug, description) VALUES
('Taladros', 'taladros', 'Taladros eléctricos y de percusión'),
('Sierras', 'sierras', 'Sierras circulares, de cinta y sabre'),
('Lijadoras', 'lijadoras', 'Lijadoras orbitales, de banda y de disco'),
('Destornilladores', 'destornilladores', 'Juegos de destornilladores profesionales'),
('Herramientas Manuales', 'herramientas-manuales', 'Martillos, alicates, llaves y más'),
('Equipos de Seguridad', 'seguridad', 'Cascos, gafas, guantes y protección');

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, slug, description, price, category_id, stock, brand, sku) VALUES
('Taladro Profesional DeWalt 20V', 'taladro-dewalt-20v', 'Taladro inalámbrico profesional', 149.99, 1, 50, 'DeWalt', 'DCD771C2'),
('Sierra Circular Makita 7 1/4"', 'sierra-circular-makita', 'Sierra circular de 7 1/4 pulgadas', 89.99, 2, 35, 'Makita', 'CS7500'),
('Lijadora Orbital Bosch 5"', 'lijadora-orbital-bosch', 'Lijadora orbital profesional', 79.99, 3, 42, 'Bosch', 'ROS20VS'),
('Juego 40 Destornilladores', 'juego-destornilladores', 'Set completo profesional', 34.99, 4, 100, 'Stanley', 'STMT62141'),
('Mazo de Goma 32oz', 'mazo-goma-32oz', 'Mazo profesional de goma', 15.99, 5, 80, 'Estwing', 'E3-32EGO'),
('Casco de Seguridad Amarillo', 'casco-amarillo', 'Casco ANSI certificado', 12.99, 6, 200, '3M', '82691');
