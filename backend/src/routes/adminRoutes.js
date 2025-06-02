const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const transporter = require('../config/mailConnect');

router.post('/ban-user/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isBanned = true;
    user.bannedReason = reason || 'Violation of terms';
    await user.save();

    await transporter.sendMail({
      from: process.env.TEST_EMAIL,
      to: user.email,
      subject: 'Account Banned Notification',
      html: `
        <h3>Your account has been banned</h3>
        <p>Reason: <strong>${user.bannedReason}</strong></p>
        <p>If you believe this is a mistake, please contact support.</p>
      `,
    });

    res.status(200).json({ msg: 'User has been banned and notified by email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;