import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import {
  OrderWithProducts,
  OrderWithProductCount,
  CreateOrderDto,
  UpdateOrderDto,
  Product,
  ApiResponse,
} from '../types';

// GET /api/orders - Get all orders with product count
export const getAllOrders = async (
  _req: Request,
  res: Response<ApiResponse<OrderWithProductCount[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();

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
    const order = await orderService.getOrderById(req.params.id);

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
  try {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id - Update order
export const updateOrder = async (
  req: Request<{ id: string }, ApiResponse<OrderWithProducts>, UpdateOrderDto>,
  res: Response<ApiResponse<OrderWithProducts>>,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id - Delete order
export const deleteOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    await orderService.deleteOrder(req.params.id);

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
    const products = await productService.getAllProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
