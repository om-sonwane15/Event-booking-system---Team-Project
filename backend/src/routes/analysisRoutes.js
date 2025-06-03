const express = require('express');
const router = express.Router();
const Event = require('../models/EventModel');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/UserModel');

// GET /api/admin/analysis/total-users
router.get('/total-users', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    return res.json({ totalUsers });
  } catch (err) {
    console.error('Error fetching total users:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/attendees', verifyToken, isAdmin, async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ msg: 'Start and end dates are required' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const events = await Event.find({
      startTime: { $gte: start },
      endTime: { $lte: end },
      cancelled: false,
    }).select('attendees');

    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);

    return res.json({ totalAttendees });
  } catch (err) {
    console.error('Error calculating total attendees:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});


router.get('/revenue', verifyToken, isAdmin, async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ msg: 'Start and end dates are required' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const events = await Event.find({
      startTime: { $gte: start },
      endTime: { $lte: end },
      cancelled: false,
    });

    let totalRevenue = 0;

    for (const event of events) {
      const ticketPriceMap = {};
      event.ticketTypes.forEach(tt => {
        ticketPriceMap[tt._id.toString()] = tt.price;
      });

      event.bookings.forEach(booking => {
        if (
          booking.status === 'confirmed' &&
          booking.paymentStatus === 'paid' &&
          booking.ticketType &&
          ticketPriceMap[booking.ticketType.toString()]
        ) {
          totalRevenue += booking.tickets * ticketPriceMap[booking.ticketType.toString()];
        }
      });
    }

    return res.json({ totalRevenue });
  } catch (err) {
    console.error('Error calculating total revenue:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});


router.get('/bookings', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await Event.find({ cancelled: false }).select('bookings');

    const bookingStats = {
      confirmed: 0,
      cancelled: 0,
      pending: 0,
    };

    events.forEach(event => {
      event.bookings.forEach(booking => {
        if (booking.status) {
          bookingStats[booking.status] = (bookingStats[booking.status] || 0) + 1;
        }
      });
    });

    return res.json({ bookingStats });
  } catch (err) {
    console.error('Error calculating booking stats:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
