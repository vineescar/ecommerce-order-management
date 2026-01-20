import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getAllProducts,
} from '../controllers/orderController';
import { validateRequest } from '../middleware/validateRequest';
import {
  orderIdValidation,
  createOrderValidation,
  updateOrderValidation,
} from '../validators';

const router = Router();

// Routes
// GET /api/orders - Get all orders
router.get('/', getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderIdValidation, validateRequest, getOrderById);

// POST /api/orders - Create new order
router.post('/', createOrderValidation, validateRequest, createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', updateOrderValidation, validateRequest, updateOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', orderIdValidation, validateRequest, deleteOrder);

// GET /api/products - Get all products (helper endpoint for frontend)
router.get('/products/all', getAllProducts);

export default router;
