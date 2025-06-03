// src/routes/eventRoutes.js 
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');

// View all published events with optional filtering
router.get('/published-events', async (req, res) => {
  try {
    const { category, type, upcomingOnly } = req.query;
    const query = { isPublished: true, cancelled: false };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (upcomingOnly === 'true') query.startTime = { $gt: new Date() };

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View details of a specific published event
router.get('/published-events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      isPublished: true,
      cancelled: false
    }).populate('createdBy', 'name email')
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

// View all events of the logged-in user (created or attended)
router.get('/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { createdBy: req.user.id },
        { attendees: req.user.id }
      ]
    }).sort({ startTime: -1 });
    
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new event (initially not published)
router.post('/create-event', verifyToken, async (req, res) => {
  try {
    const { title, startTime, endTime, type, category, location, maxAttendees, description } = req.body;

    // Validate event time is in the future
    if (new Date(startTime) <= new Date()) {
      return res.status(400).json({ msg: 'Event must be in the future' });
    }

    // Validate end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    const newEvent = new Event({
      title,
      startTime,
      endTime,
      type,
      category,
      location,
      maxAttendees,
      description,
      createdBy: req.user.id,
      isPublished: false
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit event details (only by creator)
router.put('/edit-event/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to edit this event' });
    }

    // Update fields
    const updatableFields = ['title', 'startTime', 'endTime', 'description', 'location', 'maxAttendees', 'category', 'type'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // Validate times if being updated
    if (req.body.startTime || req.body.endTime) {
      const newStart = req.body.startTime ? new Date(req.body.startTime) : event.startTime;
      const newEnd = req.body.endTime ? new Date(req.body.endTime) : event.endTime;

      if (newStart <= new Date()) {
        return res.status(400).json({ msg: 'Event must be in the future' });
      }
      if (newEnd <= newStart) {
        return res.status(400).json({ msg: 'End time must be after start time' });
      }
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete or cancel event (only by creator)
router.delete('/remove-event/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this event' });
    }

    // Check if there are attendees
    if (event.attendees.length > 0) {
      event.cancelled = true;
      event.cancellationPolicy = req.body.reason || 'Event cancelled by organizer';
      await event.save();
      return res.json({ msg: 'Event cancelled successfully' });
    }

    // No attendees - can delete
    await event.remove();
    res.json({ msg: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Book tickets for an event
router.post('/book-ticket/:id', verifyToken, async (req, res) => {
  try {
    const { ticketTypeId, quantity } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event || !event.isPublished || event.cancelled) {
      return res.status(400).json({ msg: 'Event not available for booking' });
    }

    if (event.startTime <= new Date()) {
      return res.status(400).json({ msg: 'Event has already started' });
    }

    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ msg: 'Ticket type not found' });
    }

    if (ticketType.available < quantity) {
      return res.status(400).json({ msg: 'Not enough tickets available' });
    }

    const userBookings = event.bookings.filter(
      booking => booking.user.toString() === req.user.id && booking.status === 'confirmed'
    );
    const userTickets = userBookings.reduce((sum, booking) => sum + booking.tickets, 0);

    if (userTickets + quantity > ticketType.maxPerUser) {
      return res.status(400).json({
        msg: `You can only book ${ticketType.maxPerUser} tickets of this type`
      });
    }

    ticketType.available -= quantity;

    event.bookings.push({
      user: req.user.id,
      tickets: quantity,
      status: 'confirmed',
      paymentStatus: 'paid',
      ticketType: ticketTypeId
    });

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
    }

    await event.save();
    res.json({ msg: 'Tickets booked successfully', bookingId: event.bookings[event.bookings.length - 1]._id });
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
    .select('title startTime endTime location bookings ticketTypes');

    const userTickets = events.map(event => {
      const userBookings = event.bookings.filter(
        booking => booking.user._id.toString() === req.user.id && booking.status === 'confirmed'
      );

      return userBookings.map(booking => ({
        eventId: event._id,
        eventTitle: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        bookingId: booking._id,
        ticketType: event.ticketTypes.id(booking.ticketType),
        tickets: booking.tickets,
        bookedAt: booking.bookedAt,
        status: booking.status
      }));
    }).flat();

    res.json(userTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel a booking
router.post('/cancel-booking/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      'bookings._id': req.params.id,
      'bookings.user': req.user.id
    });

    if (!event) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    const booking = event.bookings.id(req.params.id);
    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking already cancelled' });
    }

    if (new Date(event.startTime) <= new Date()) {
      return res.status(400).json({ msg: 'Cannot cancel booking for past or ongoing event' });
    }

    // Return tickets to availability
    const ticketType = event.ticketTypes.id(booking.ticketType);
    if (ticketType) {
      ticketType.available += booking.tickets;
    }

    booking.status = 'cancelled';
    await event.save();

    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;