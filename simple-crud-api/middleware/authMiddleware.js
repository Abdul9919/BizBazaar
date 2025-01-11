import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const protect = async (req, res, next) => {
    let token;

    // Check if the request has an Authorization header and it starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the Authorization header
            token = req.headers.authorization.split(" ")[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID and exclude the password field
            req.user = await User.findById(decoded.id).select('-password');

            // Continue to the next middleware
            return next();
        } catch (error) {
            // Handle token verification failure
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    }

    // If token is missing, return an error response
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
}

export { protect };
