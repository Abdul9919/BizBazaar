import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Direct import

const protect = async (req, res, next) => {
    try {
        // Verify JWT structure
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                code: 'INVALID_AUTH_HEADER',
                message: 'Authorization header missing or malformed'
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user existence
        const user = await User.findById(decoded.id)
            .select('-password -__v')
            .lean({ virtuals: true });

        if (!user) {
            return res.status(401).json({
                code: 'USER_NOT_FOUND',
                message: 'The authenticated user no longer exists'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        const errorMap = {
            JsonWebTokenError: 'Invalid authentication token',
            TokenExpiredError: 'Authentication token expired',
            NotBeforeError: 'Authentication token not active'
        };

        return res.status(401).json({
            code: 'AUTH_FAILURE',
            message: errorMap[error.name] || 'Authentication failed',
            systemMessage: error.message
        });
    }
};

export { protect };