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
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

import multer from 'multer';
const router = express.Router();

// Multer configuration for saving images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/byname/:name', getProductByName);

router.post('/', upload.single('image'),protect, createProduct); // File upload middleware for image

router.put('/:id', protect,updateProductById);
router.put('/byname/:name', updateProductByName);

router.delete('/:id', protect, deleteProductById);
router.delete('/byname/:name', deleteProductByName);

export default router;
