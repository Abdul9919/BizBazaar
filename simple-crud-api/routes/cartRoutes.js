import express from 'express';
const router = express.Router();
import { getCartItems, addItemToCart, deleteItemFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/',protect, getCartItems);
router.post('/', protect, addItemToCart);
router.delete('/:id', protect, deleteItemFromCart);

export default router;
