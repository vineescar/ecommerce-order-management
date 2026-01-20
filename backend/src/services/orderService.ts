import db from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { OrderWithProducts, CreateOrderDto, UpdateOrderDto, OrderRow } from '../types';

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

const mapRowToOrder = (row: OrderRow): OrderWithProducts => ({
  id: row.id,
  order_description: row.order_description,
  created_at: row.created_at,
  products: row.products || [],
});

export const orderService = {
  getAllOrders: async (): Promise<OrderWithProducts[]> => {
    const result = await db.query<OrderRow>(`
      ${ORDER_WITH_PRODUCTS_QUERY}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    return result.rows.map(mapRowToOrder);
  },

  getOrderById: async (id: string): Promise<OrderWithProducts> => {
    const result = await db.query<OrderRow>(
      `
      ${ORDER_WITH_PRODUCTS_QUERY}
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    return mapRowToOrder(result.rows[0]);
  },

  createOrder: async (data: CreateOrderDto): Promise<OrderWithProducts> => {
    const { orderDescription, productIds } = data;
    const client = await db.getClient();

    try {
      // Validate productIds exist
      if (productIds && productIds.length > 0) {
        const productCheck = await client.query<{ count: string }>(
          'SELECT COUNT(*) FROM products WHERE id = ANY($1)',
          [productIds]
        );
        if (parseInt(productCheck.rows[0].count) !== productIds.length) {
          throw new BadRequestError('One or more product IDs are invalid');
        }
      }

      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query<{ id: number; created_at: Date }>(
        'INSERT INTO orders (order_description) VALUES ($1) RETURNING id, created_at',
        [orderDescription]
      );
      const orderId = orderResult.rows[0].id;

      // Add product mappings
      if (productIds && productIds.length > 0) {
        const values = productIds.map((_, index) => `($1, $${index + 2})`).join(', ');
        await client.query(
          `INSERT INTO order_product_map (order_id, product_id) VALUES ${values}`,
          [orderId, ...productIds]
        );
      }

      await client.query('COMMIT');

      // Fetch and return the created order
      return orderService.getOrderById(orderId.toString());
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  updateOrder: async (id: string, data: UpdateOrderDto): Promise<OrderWithProducts> => {
    const { orderDescription, productIds } = data;
    const client = await db.getClient();

    try {
      // Check if order exists
      const orderExists = await client.query('SELECT id FROM orders WHERE id = $1', [id]);
      if (orderExists.rows.length === 0) {
        throw new NotFoundError(`Order with id ${id} not found`);
      }

      // Validate productIds exist
      if (productIds && productIds.length > 0) {
        const productCheck = await client.query<{ count: string }>(
          'SELECT COUNT(*) FROM products WHERE id = ANY($1)',
          [productIds]
        );
        if (parseInt(productCheck.rows[0].count) !== productIds.length) {
          throw new BadRequestError('One or more product IDs are invalid');
        }
      }

      await client.query('BEGIN');

      // Update order description if provided
      if (orderDescription !== undefined) {
        await client.query('UPDATE orders SET order_description = $1 WHERE id = $2', [
          orderDescription,
          id,
        ]);
      }

      // Update product mappings if provided
      if (productIds !== undefined) {
        await client.query('DELETE FROM order_product_map WHERE order_id = $1', [id]);
        if (productIds.length > 0) {
          const values = productIds.map((_, index) => `($1, $${index + 2})`).join(', ');
          await client.query(
            `INSERT INTO order_product_map (order_id, product_id) VALUES ${values}`,
            [id, ...productIds]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch and return the updated order
      return orderService.getOrderById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }
  },
};
