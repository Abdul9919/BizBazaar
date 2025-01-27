import express from 'express'
const router = express.Router();
import { getMessageHistory } from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'

router.get('/', protect,getMessageHistory)

export default router