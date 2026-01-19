import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Order, ApiResponse, ApiErrorResponse } from '../types';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      setOrders(response.data.data);
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders, clearError };
};

// Hook to get a single order
interface UseOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

export const useOrder = (id: string | undefined): UseOrderReturn => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async (): Promise<void> => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        setError(apiError.message || 'Failed to fetch order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return { order, isLoading, error };
};
