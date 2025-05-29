// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');


// View profile
router.get('/view-profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name profilePic phone bio email');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update profile
router.put('/update-profile', verifyToken, upload('profilePic'), async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    let updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        return res.status(400).json({ msg: 'Phone number must be 10 digits' });
      }
      updateData.phone = `+91${digitsOnly}`;
    }

    if (req.file) {
      const imagePath = path.join('/uploads', req.user.email, req.file.filename).replace(/\\/g, '/');
      updateData.profilePic = imagePath;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('name profilePic phone bio email role');
    res.json({
      msg: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Admin-only route
router.get('/admin', verifyToken, isAdmin, (req, res) => {
    res.status(200).json({ msg: 'Welcome Admin!' });
});

module.exports = router;
