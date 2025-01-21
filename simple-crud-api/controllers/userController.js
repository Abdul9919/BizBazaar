import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Register User
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
                _id: user._id,
                userName: user.userName,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                _id: user._id,
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

const getUserById = async (req, res) => {
    try {
        const fetchedId = req.params.id;
        if (!fetchedId) {
            res.status(400).json({ message: 'User ID is required' });
        }
        else {
            const user = await User.findById(fetchedId);
            if (user) {
                res.json({
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { registerUser, loginUser, getUserProfile, getUserById };