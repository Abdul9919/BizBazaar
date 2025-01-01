const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

// Fixed the issue in the generateToken function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

const registerUser = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ userName, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,  // Fixed: used _id instead of id to match MongoDB convention
                userName: user.userName,
                email: user.email,
                token: generateToken(user._id),  // Fixed: used _id instead of id
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,  // Fixed: used _id instead of id
                userName: user.userName,
                token: generateToken(user._id),  // Fixed: used _id instead of id
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);  // Assuming req.user.id is set after JWT authentication

        if (user) {
            res.json({
                _id: user._id,  // Fixed: used _id instead of id
                userName: user.userName,
                email: user.email,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
