// Product types
export interface Product {
  id: number;
  product_name: string;
  product_description: string | null;
}

// Order types (for list view - with product count)
export interface Order {
  id: number;
  order_description: string;
  created_at: string;
  product_count: number;
}

// Order with full products (for detail/edit view)
export interface OrderWithProducts {
  id: number;
  order_description: string;
  created_at: string;
  products: Product[];
}

// Request DTOs
export interface CreateOrderDto {
  orderDescription: string;
  productIds: number[];
}

export interface UpdateOrderDto {
  orderDescription?: string;
  productIds?: number[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types
export interface OrderFormData {
  orderDescription: string;
  productIds: number[];
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
