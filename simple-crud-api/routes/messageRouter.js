import express from 'express'
const router = express.Router();
import { getMessageHistory, getUsersWithChatHistory} from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'

router.get('/', protect,getMessageHistory)
router.get('/chat-history', protect,getUsersWithChatHistory)

export default router