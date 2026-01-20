import { PoolClient } from 'pg';
import db from '../config/db';
import { Product } from '../types';

export const productRepository = {
  findAll: async (): Promise<Product[]> => {
    const result = await db.query<Product>(
      'SELECT id, product_name, product_description FROM products ORDER BY id'
    );
    return result.rows;
  },

  countByIds: async (productIds: number[], client?: PoolClient): Promise<number> => {
    const queryRunner = client || db;
    const result = await queryRunner.query<{ count: string }>(
      'SELECT COUNT(*) FROM products WHERE id = ANY($1)',
      [productIds]
    );
    return parseInt(result.rows[0].count);
  },

  existsAll: async (productIds: number[], client?: PoolClient): Promise<boolean> => {
    const count = await productRepository.countByIds(productIds, client);
    return count === productIds.length;
  },
};
