import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getAllProducts,
} from '../controllers/orderController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation rules
const orderIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
];

const createOrderValidation = [
  body('orderDescription')
    .trim()
    .notEmpty()
    .withMessage('Order description is required')
    .isLength({ max: 100 })
    .withMessage('Order description must not exceed 100 characters'),
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('At least one product must be selected'),
  body('productIds.*')
    .isInt({ min: 1 })
    .withMessage('Product IDs must be positive integers'),
];

const updateOrderValidation = [
  param('id').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
  body('orderDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Order description cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Order description must not exceed 100 characters'),
  body('productIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one product must be selected'),
  body('productIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product IDs must be positive integers'),
];

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
