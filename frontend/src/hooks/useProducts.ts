import { useState, useEffect } from 'react';
import api from '../services/api';
import { Product, ApiResponse, ApiErrorResponse } from '../types';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<ApiResponse<Product[]>>('/orders/products/all');
        setProducts(response.data.data);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        setError(apiError.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading, error };
};
