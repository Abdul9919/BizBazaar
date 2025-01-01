const express = require('express')
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser)

router.post('/login', loginUser)

router.get('/profile', protect, getUserProfile)

module.exports = router

