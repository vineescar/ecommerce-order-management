import db from '../config/db';
import { Product } from '../types';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const result = await db.query<Product>(
      'SELECT id, product_name, product_description FROM products ORDER BY id'
    );
    return result.rows;
  },
};
