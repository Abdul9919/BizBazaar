import express from 'express';
import { registerUser, loginUser, getUserProfile, getUserById, getUsers, updateUserSettings } from '../controllers/userController.js';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

// Register a new user
router.post('/register', registerUser);

// Log in an existing user
router.post('/login', loginUser);
router.get('/', protect, getUsers);

// Get the current user's profile (protected route)
router.get('/profile', protect, getUserProfile);
router.get('/profile/:id', getUserById);
router.put('/:id',protect ,updateUserSettings)

// New route to get the authenticated user's details
router.get('/me', protect, async (req, res) => {
  try {
    // The protect middleware has already ensured the user is authenticated
    const user = req.user; // Assuming 'req.user' is set by the protect middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user details
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      // Include other user info here if needed
    });
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
