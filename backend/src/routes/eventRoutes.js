// src/routes/eventRoutes.js 
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');

// View all published events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ isPublished: true })
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View details of a specific published event
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      isPublished: true
    })
      .populate('createdBy', 'name email')
      .populate('attendees', 'name');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found or not published' });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View all events of the logged-in user (created or cancelled)
router.get('/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { createdBy: req.user.id },
        { cancelled: true, attendees: req.user.id }
      ]
    })
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new event (initially not published)
router.post('/events', verifyToken, async (req, res) => {
  try {
    const { title, date, time, type, category, location, maxAttendees, description } = req.body;

    // Validate event date/time is in the future
    const eventDateTime = new Date(`${date}T${convertTo24Hour(time)}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ msg: 'Event date and time must be in the future' });
    }

    const newEvent = new Event({
      title,
      date,
      time,
      type,
      category,
      location,
      maxAttendees,
      description,
      createdBy: req.user.id,
      isPublished: false // Needs admin approval
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit event details (only by creator)
router.put('/events/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user is the creator
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to edit this event' });
    }

    // Validate new date/time is in the future if being updated
    if (req.body.date || req.body.time) {
      const newDate = req.body.date || event.date;
      const newTime = req.body.time || event.time;
      const eventDateTime = new Date(`${newDate}T${convertTo24Hour(newTime)}`);

      if (eventDateTime <= new Date()) {
        return res.status(400).json({ msg: 'Event date and time must be in the future' });
      }
    }

    // Update only allowed fields
    const { title, date, time, description, location, maxAttendees } = req.body;

    if (title) event.title = title;
    if (date) event.date = date;
    if (time) event.time = time;
    if (description) event.description = description;
    if (location) event.location = location;
    if (maxAttendees) event.maxAttendees = maxAttendees;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete or cancel event (only by creator)
router.delete('/events/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user is the creator
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this event' });
    }

    // Instead of deleting, we'll mark as cancelled
    event.cancelled = true;
    await event.save();

    res.json({ msg: 'Event cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Book tickets for an event
router.post('/events/:id/book', verifyToken, async (req, res) => {
  try {
    const { ticketTypeId, quantity } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event || !event.isPublished || event.cancelled) {
      return res.status(400).json({ msg: 'Event not available for booking' });
    }

    // Check if event date is in the future
    const eventDateTime = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ msg: 'Event has already occurred' });
    }

    // Find the ticket type
    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ msg: 'Ticket type not found' });
    }

    // Check availability
    if (ticketType.available < quantity) {
      return res.status(400).json({ msg: 'Not enough tickets available' });
    }

    // Check max per user
    const userBookings = event.bookings.filter(
      booking => booking.user.toString() === req.user.id && booking.status === 'confirmed'
    );
    const userTickets = userBookings.reduce((sum, booking) => sum + booking.tickets, 0);

    if (userTickets + quantity > ticketType.maxPerUser) {
      return res.status(400).json({
        msg: `You can only book ${ticketType.maxPerUser} tickets of this type`
      });
    }

    // Update available tickets
    ticketType.available -= quantity;

    // Create booking
    event.bookings.push({
      user: req.user.id,
      tickets: quantity,
      status: 'confirmed',
      paymentStatus: 'paid',
      ticketType: ticketTypeId
    });

    // Add user to attendees if not already there
    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
    }

    await event.save();
    res.json({ msg: 'Tickets booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View all tickets booked by the user
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      'bookings.user': req.user.id,
      'bookings.status': 'confirmed'
    })
      .populate('bookings.user', 'name email')
      .select('title date time location bookings');

    // Filter to only show the user's bookings
    const userTickets = events.map(event => {
      const userBookings = event.bookings.filter(
        booking => booking.user._id.toString() === req.user.id
      );
      return {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        bookings: userBookings
      };
    });

    res.json(userTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(timeString) {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}

module.exports = router;