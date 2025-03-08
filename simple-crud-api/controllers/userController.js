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
      const user = await User.findById(req.user._id); // Get user from DB
  
      if (!user) {
        return res.status(404).json({ message: 'User does not exist' });
      }
  
      const { userName, email, currentPassword, newPassword } = req.body;
  
      // Check if current password is correct
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Password' });
      }
  
      // Create an update object dynamically (only include fields that exist in the request)
      const updateFields = {};
      if (userName) updateFields.userName = userName;
      if (email) updateFields.email = email;
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(newPassword, salt);
      }
  
      // Update only the provided fields
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };


export { registerUser, loginUser, getUserProfile, getUserById, getUserForChat, getUsers, updateUserSettings };