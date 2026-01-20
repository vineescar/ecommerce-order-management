import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import {
  OrderWithProducts,
  CreateOrderDto,
  UpdateOrderDto,
  OrderRow,
  Product,
  ApiResponse,
} from '../types';

// GET /api/orders - Get all orders with products
export const getAllOrders = async (
  _req: Request,
  res: Response<ApiResponse<OrderWithProducts[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await db.query<OrderRow>(`
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
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    const orders: OrderWithProducts[] = result.rows.map((row) => ({
      id: row.id,
      order_description: row.order_description,
      created_at: row.created_at,
      products: row.products || [],
    }));

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - Get order by ID
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<OrderWithProducts>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<OrderRow>(
      `
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
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    const row = result.rows[0];
    const order: OrderWithProducts = {
      id: row.id,
      order_description: row.order_description,
      created_at: row.created_at,
      products: row.products || [],
    };

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders - Create new order
export const createOrder = async (
  req: Request<object, ApiResponse<OrderWithProducts>, CreateOrderDto>,
  res: Response<ApiResponse<OrderWithProducts>>,
  next: NextFunction
): Promise<void> => {
  const client = await db.getClient();

  try {
    const { orderDescription, productIds } = req.body;

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

    // Insert product mappings
    if (productIds && productIds.length > 0) {
      const values = productIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(', ');

      await client.query(
        `INSERT INTO order_product_map (order_id, product_id) VALUES ${values}`,
        [orderId, ...productIds]
      );
    }

    await client.query('COMMIT');

    // Fetch the created order with products
    const result = await db.query<OrderRow>(
      `
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
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [orderId]
    );

    const row = result.rows[0];
    const order: OrderWithProducts = {
      id: row.id,
      order_description: row.order_description,
      created_at: row.created_at,
      products: row.products || [],
    };

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// PUT /api/orders/:id - Update order
export const updateOrder = async (
  req: Request<{ id: string }, ApiResponse<OrderWithProducts>, UpdateOrderDto>,
  res: Response<ApiResponse<OrderWithProducts>>,
  next: NextFunction
): Promise<void> => {
  const client = await db.getClient();

  try {
    const { id } = req.params;
    const { orderDescription, productIds } = req.body;

    // Check if order exists
    const orderExists = await client.query(
      'SELECT id FROM orders WHERE id = $1',
      [id]
    );

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
      await client.query(
        'UPDATE orders SET order_description = $1 WHERE id = $2',
        [orderDescription, id]
      );
    }

    // Update product mappings if provided
    if (productIds !== undefined) {
      // Delete existing mappings
      await client.query('DELETE FROM order_product_map WHERE order_id = $1', [
        id,
      ]);

      // Insert new mappings
      if (productIds.length > 0) {
        const values = productIds
          .map((_, index) => `($1, $${index + 2})`)
          .join(', ');

        await client.query(
          `INSERT INTO order_product_map (order_id, product_id) VALUES ${values}`,
          [id, ...productIds]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch updated order
    const result = await db.query<OrderRow>(
      `
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
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id]
    );

    const row = result.rows[0];
    const order: OrderWithProducts = {
      id: row.id,
      order_description: row.order_description,
      created_at: row.created_at,
      products: row.products || [],
    };

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// DELETE /api/orders/:id - Delete order
export const deleteOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM orders WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    res.json({
      success: true,
      data: null,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products - Get all products (helper endpoint)
export const getAllProducts = async (
  _req: Request,
  res: Response<ApiResponse<Product[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await db.query<Product>(
      'SELECT id, product_name, product_description FROM products ORDER BY id'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
