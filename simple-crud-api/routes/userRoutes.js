import express from 'express'
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser)

router.post('/login', loginUser)

router.get('/profile', protect, getUserProfile)

export default router

