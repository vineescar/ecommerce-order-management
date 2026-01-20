import { PoolClient } from 'pg';
import db from '../config/db';
import { OrderRow } from '../types';

const ORDER_WITH_PRODUCTS_QUERY = `
  SELECT
    o.id,
    o.order_description,
    o.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', p.id,
          'product_name', p.product_name,
          'product_description', p.product_description
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'
    ) as products
  FROM orders o
  LEFT JOIN order_product_map opm ON o.id = opm.order_id
  LEFT JOIN products p ON opm.product_id = p.id
`;

export const orderRepository = {
  findAll: async (): Promise<OrderRow[]> => {
    const result = await db.query<OrderRow>(`
      ${ORDER_WITH_PRODUCTS_QUERY}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    return result.rows;
  },

  findById: async (id: string): Promise<OrderRow | null> => {
    const result = await db.query<OrderRow>(
      `
      ${ORDER_WITH_PRODUCTS_QUERY}
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id]
    );
    return result.rows[0] || null;
  },

  exists: async (id: string, client?: PoolClient): Promise<boolean> => {
    const queryRunner = client || db;
    const result = await queryRunner.query('SELECT id FROM orders WHERE id = $1', [id]);
    return result.rows.length > 0;
  },

  create: async (
    orderDescription: string,
    client: PoolClient
  ): Promise<{ id: number; created_at: Date }> => {
    const result = await client.query<{ id: number; created_at: Date }>(
      'INSERT INTO orders (order_description) VALUES ($1) RETURNING id, created_at',
      [orderDescription]
    );
    return result.rows[0];
  },

  updateDescription: async (
    id: string,
    orderDescription: string,
    client: PoolClient
  ): Promise<void> => {
    await client.query('UPDATE orders SET order_description = $1 WHERE id = $2', [
      orderDescription,
      id,
    ]);
  },

  delete: async (id: string): Promise<number> => {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    return result.rowCount || 0;
  },

  // Order-Product mapping operations
  addProductMappings: async (
    orderId: number | string,
    productIds: number[],
    client: PoolClient
  ): Promise<void> => {
    if (productIds.length === 0) return;

    const values = productIds.map((_, index) => `($1, $${index + 2})`).join(', ');
    await client.query(
      `INSERT INTO order_product_map (order_id, product_id) VALUES ${values}`,
      [orderId, ...productIds]
    );
  },

  deleteProductMappings: async (orderId: string, client: PoolClient): Promise<void> => {
    await client.query('DELETE FROM order_product_map WHERE order_id = $1', [orderId]);
  },
};
