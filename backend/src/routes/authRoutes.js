// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailConnect');
const User = require('../models/UserModel');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Temporary store for reset tokens
const resetTokens = {};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ msg: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = new User({ 
            name: name.trim(), 
            email: email.toLowerCase(), 
            password: hashedPassword, 
            role: role || 'user' 
        });
        
        await user.save();

        res.status(201).json({ msg: 'User registered successfully! Please login to continue.' });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ msg: 'Server error during registration', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            msg: 'Login successful',
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            },
        });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ msg: 'Server error during login', error: err.message });
    }
});

// Admin-only route
router.get('/admin', verifyToken, isAdmin, (req, res) => {
    res.status(200).json({ msg: 'Welcome Admin!', user: req.user });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ msg: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ msg: 'No account found with this email address' });

        // Generate reset token (valid for 15 mins)
        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Store token in memory
        resetTokens[user.email] = resetToken;

        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

        await transporter.sendMail({
            from: process.env.TEST_EMAIL,
            to: user.email,
            subject: 'Reset your password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${frontendURL}/reset-password/${resetToken}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p><strong>This link will expire in 15 minutes.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        res.status(200).json({ msg: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ msg: 'Server error in forgot password', error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ msg: 'Token and new password are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        const email = decoded.email;
        if (!resetTokens[email] || resetTokens[email] !== token) {
            return res.status(400).json({ msg: 'Reset token has expired or is invalid' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update password
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        // Remove used token
        delete resetTokens[email];

        res.status(200).json({ msg: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
        console.error('Error in resetting password:', error);
        res.status(500).json({ msg: 'Server error in resetting password', error: error.message });
    }
});

// Change Password (requires authentication)
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: 'Old and new passwords are required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ msg: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in changing password:', error);
        res.status(500).json({ msg: 'Server error in changing password', error: error.message });
    }
});

module.exports = router;