import db from '../config/db';
import { orderRepository } from '../repositories/orderRepository';
import { productRepository } from '../repositories/productRepository';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { OrderWithProducts, CreateOrderDto, UpdateOrderDto, OrderRow } from '../types';

const mapRowToOrder = (row: OrderRow): OrderWithProducts => ({
  id: row.id,
  order_description: row.order_description,
  created_at: row.created_at,
  products: row.products || [],
});

export const orderService = {
  getAllOrders: async (): Promise<OrderWithProducts[]> => {
    const rows = await orderRepository.findAll();
    return rows.map(mapRowToOrder);
  },

  getOrderById: async (id: string): Promise<OrderWithProducts> => {
    const row = await orderRepository.findById(id);

    if (!row) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    return mapRowToOrder(row);
  },

  createOrder: async (data: CreateOrderDto): Promise<OrderWithProducts> => {
    const { orderDescription, productIds } = data;
    const client = await db.getClient();

    try {
      // Validate productIds exist
      if (productIds && productIds.length > 0) {
        const allExist = await productRepository.existsAll(productIds, client);
        if (!allExist) {
          throw new BadRequestError('One or more product IDs are invalid');
        }
      }

      await client.query('BEGIN');

      // Create order
      const { id: orderId } = await orderRepository.create(orderDescription, client);

      // Add product mappings
      if (productIds && productIds.length > 0) {
        await orderRepository.addProductMappings(orderId, productIds, client);
      }

      await client.query('COMMIT');

      // Fetch and return the created order
      const row = await orderRepository.findById(orderId.toString());
      return mapRowToOrder(row!);
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
      const exists = await orderRepository.exists(id, client);
      if (!exists) {
        throw new NotFoundError(`Order with id ${id} not found`);
      }

      // Validate productIds exist
      if (productIds && productIds.length > 0) {
        const allExist = await productRepository.existsAll(productIds, client);
        if (!allExist) {
          throw new BadRequestError('One or more product IDs are invalid');
        }
      }

      await client.query('BEGIN');

      // Update order description if provided
      if (orderDescription !== undefined) {
        await orderRepository.updateDescription(id, orderDescription, client);
      }

      // Update product mappings if provided
      if (productIds !== undefined) {
        await orderRepository.deleteProductMappings(id, client);
        if (productIds.length > 0) {
          await orderRepository.addProductMappings(id, productIds, client);
        }
      }

      await client.query('COMMIT');

      // Fetch and return the updated order
      const row = await orderRepository.findById(id);
      return mapRowToOrder(row!);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    const deletedCount = await orderRepository.delete(id);

    if (deletedCount === 0) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }
  },
};
