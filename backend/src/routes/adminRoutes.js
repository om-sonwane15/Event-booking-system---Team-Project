// src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const transporter = require('../config/mailConnect');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Ban user route
router.post('/ban/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent admin from banning themselves
    if (targetUserId === req.user.id) {
      return res.status(403).json({ msg: "You cannot ban yourself" });
    }

    const userToBan = await User.findById(targetUserId);
    if (!userToBan) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent banning other admins
    if (userToBan.role === 'admin') {
      return res.status(403).json({ msg: "You cannot ban another admin" });
    }

    userToBan.isBanned = true;
    await userToBan.save();

    // Send ban email
    await transporter.sendMail({
      from: process.env.TEST_EMAIL,
      to: userToBan.email,
      subject: 'You have been banned',
      html: `
        <h3>Account Banned</h3>
        <p>Dear ${userToBan.name},</p>
        <p>Your account has been banned by the administrator for violating policies.</p>
        <p>If you believe this is a mistake, please contact support.</p>
      `,
    });

    res.status(200).json({ msg: "User has been banned and notified via email" });
  } catch (error) {
    console.error('Ban Error:', error);
    res.status(500).json({ msg: "Server error while banning user", error: error.message });
  }
});

module.exports = router;
