// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailConnect');
const User = require('../models/UserModel');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Utility: Check if a password meets the schema's requirements
const validatePassword = (password) => {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const validLength = password.length >= 8 && password.length <= 16;
  return (
    hasLowercase && hasUppercase && hasNumber && hasSpecialChar && validLength
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: 'Name, email, and password are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        msg: 'Password must be 8-16 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Error in registration:', err);
    res
      .status(500)
      .json({ msg: 'Server error during registration', error: err.message });
  }
});

// Login (without .select('+password'))
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Direct DB query to get password hash, ignoring select:false
    const userWithPassword = await User.findOne({ email }).select('+password');
    if (!userWithPassword) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, userWithPassword.password);
    if (!isMatch)
      return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    res
      .status(500)
      .json({ msg: 'Server error during login', error: err.message });
  }
});

// Admin-only route
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ msg: 'Welcome Admin!' });
});

// Temporary store for reset tokens
const resetTokens = {};

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    resetTokens[user.email] = resetToken;

    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    await transporter.sendMail({
      from: process.env.TEST_EMAIL,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <h3>Reset Password</h3>
        <p>Click the button below to reset your password:</p>
        <a href="${frontendURL}/reset-password/${resetToken}" style="padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.status(200).json({ msg: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res
      .status(500)
      .json({ msg: 'Server error in forgot password', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ msg: 'Token and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        msg: 'New password must be 8-16 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const email = decoded.email;
    if (!resetTokens[email] || resetTokens[email] !== token) {
      return res
        .status(400)
        .json({ msg: 'Token does not match or expired' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    delete resetTokens[email];

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetting password:', error);
    res
      .status(500)
      .json({
        msg: 'Server error in resetting password',
        error: error.message,
      });
  }
});

// Change Password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ msg: 'Old and new passwords are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        msg: 'New password must be 8-16 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ msg: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changing password:', error);
    res
      .status(500)
      .json({
        msg: 'Server error in changing password',
        error: error.message,
      });
  }
});

module.exports = router;
