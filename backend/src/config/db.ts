import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const isLocalDev = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('@db:');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDev ? false : { rejectUnauthorized: false },
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('Initializing database schema...');

    // Create tables
    await client.query(`
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
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_product_map_order_id
        ON order_product_map(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_product_map_product_id
        ON order_product_map(product_id);
    `);

    // Seed products (only if table is empty)
    const productCount = await client.query('SELECT COUNT(*) FROM products');

    if (parseInt(productCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (id, product_name, product_description) VALUES
          (1, 'HP laptop', 'This is HP laptop'),
          (2, 'lenovo laptop', 'This is lenovo'),
          (3, 'Car', 'This is Car'),
          (4, 'Bike', 'This is Bike')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('Products seeded successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database query helper
const db = {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> =>
    pool.query<T>(text, params),

  getClient: (): Promise<PoolClient> => pool.connect(),
};

export default db;
