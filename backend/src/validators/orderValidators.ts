import { body, param } from 'express-validator';

export const orderIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
];

export const createOrderValidation = [
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

export const updateOrderValidation = [
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
