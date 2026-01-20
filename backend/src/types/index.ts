// Product types
export interface Product {
  id: number;
  product_name: string;
  product_description: string | null;
}

// Order types
export interface Order {
  id: number;
  order_description: string;
  created_at: Date;
}

export interface OrderWithProducts extends Order {
  products: Product[];
}

export interface OrderWithProductCount extends Order {
  product_count: number;
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

// Database row types
export interface OrderRow {
  id: number;
  order_description: string;
  created_at: Date;
  products: Product[] | null;
}

export interface OrderListRow {
  id: number;
  order_description: string;
  created_at: Date;
  product_count: number;
}
