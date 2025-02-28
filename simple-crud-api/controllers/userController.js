import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose'

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
                _id: user._id.toString(), // Explicit conversion
                userName: user.userName,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
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

const getUserForChat = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('_id userName');
        res.json(user || {});
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
};

const getUsers = async (req, res) => {
    try {
      // 1. Explicit model reference
      const User = mongoose.models.User;
      
      // 2. Validate request user
      if (!req.user?._id) {
        return res.status(401).json({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }
  
      // 3. Fetch users with error logging
      const users = await User.find({ _id: { $ne: req.user._id } })
        .select('_id userName email createdAt')
        .lean();
  
      console.log('Fetched users count:', users.length); // Debug log

      const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        name: user.userName,
        email: user.email // Rename _id to id
      }));
      
      res.status(200).json({
        status: 'success',
        data: formattedUsers
      });
  
    } catch (error) {
      console.error('Users Controller Error:', error);
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: error.message
      });
    }
  };

  const updateUserSettings = async (req, res) => {
    try {
        const user = req.user; // Assuming user is already authenticated and attached to req

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const { userName, email, currentPassword, newPassword } = req.body;
        const updateFields = {};

        // Validate current password before updating
        if (currentPassword && !(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Only add fields to updateFields object if they are present in req.body
        if (userName) updateFields.userName = userName;
        if (email) updateFields.email = email;
        if (newPassword) updateFields.password = newPassword; // Make sure password hashing is handled in the model

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Find and update user with only the provided fields
        const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, { new: true, runValidators: true });

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



export { registerUser, loginUser, getUserProfile, getUserById, getUserForChat, getUsers, updateUserSettings };