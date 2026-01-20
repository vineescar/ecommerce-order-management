import { productRepository } from '../repositories/productRepository';
import { Product } from '../types';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    return productRepository.findAll();
  },
};
