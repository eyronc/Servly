import express from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id', updateOrderStatus);

export default router;
