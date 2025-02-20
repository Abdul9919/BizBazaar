import express from 'express';
import {
  getProducts,
  getProductById,
  getProductByName,
  createProduct,
  updateProductById,
  updateProductByName,
  deleteProductById,
  deleteProductByName,
  upload, // Import upload middleware
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/byname/:name', getProductByName);

router.post('/', protect, upload.single('image'), createProduct); // Image upload handled by Cloudinary

router.put('/:id', protect, updateProductById);
router.put('/byname/:name', updateProductByName);

router.delete('/:id', protect, deleteProductById);
router.delete('/byname/:name', deleteProductByName);

export default router;
