-- E-commerce Order Management Database Schema
-- This script initializes the database with tables and seed data

-- Create tables
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_description VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    product_description TEXT
);

CREATE TABLE IF NOT EXISTS order_product_map (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_product_map_order_id ON order_product_map(order_id);
CREATE INDEX IF NOT EXISTS idx_order_product_map_product_id ON order_product_map(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Seed products data
INSERT INTO products (id, product_name, product_description) VALUES
    (1, 'HP laptop', 'This is HP laptop'),
    (2, 'lenovo laptop', 'This is lenovo'),
    (3, 'Car', 'This is Car'),
    (4, 'Bike', 'This is Bike')
ON CONFLICT (id) DO NOTHING;
