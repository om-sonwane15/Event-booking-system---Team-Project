// src/routes/eventRoutes.js 
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');
const mongoose = require('mongoose');


// Helper function for validating ObjectIds
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// View all published events with optional filtering, pagination, and search
router.get('/published-events', async (req, res) => {
  try {
    const { category, type, upcomingOnly, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true, cancelled: false };

    if (category) query.category = category;
    if (type) query.type = type;
    if (upcomingOnly === 'true') query.startTime = { $gt: new Date() };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { startTime: 1 },
      populate: 'createdBy',
      select: 'name email'
    };

    const events = await Event.paginate(query, options);

    res.json({
      events: events.docs,
      total: events.totalDocs,
      pages: events.totalPages,
      currentPage: events.page
    });
  } catch (err) {
    console.error('Error fetching published events:', err);
    res.status(500).json({
      msg: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View details of a specific published event
router.get('/published-events/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID format' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      isPublished: true,
      cancelled: false
    })
      .populate('createdBy', 'name email')
      .populate('attendees', 'name');

    if (!event) {
      return res.status(404).json({ msg: 'Published event not found or it may have been cancelled' });
    }

    res.json(event);
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({
      msg: 'Failed to fetch event details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    })
      .sort({ startTime: -1 })
      .populate('createdBy', 'name email')
      .populate('attendees', 'name');

    res.json(events);
  } catch (err) {
    console.error('Error fetching user events:', err);
    res.status(500).json({
      msg: 'Failed to fetch your events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create a new event (initially not published)
router.post('/create-event', verifyToken, async (req, res) => {
  try {
    const { title, startTime, endTime, type, category, location, maxAttendees, description, ticketTypes, image } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime || !type || !category || !location || !maxAttendees || !description) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Validate event time is in the future
    if (new Date(startTime) <= new Date()) {
      return res.status(400).json({ msg: 'Event start time must be in the future' });
    }

    // Validate end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    // Validate ticket types if provided
    if (ticketTypes && Array.isArray(ticketTypes)) {
      for (const ticketType of ticketTypes) {
        if (!ticketType.name || ticketType.price === undefined || ticketType.available === undefined) {
          return res.status(400).json({ msg: 'Ticket type must have name, price, and available quantity' });
        }
      }
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
      isPublished: false,
      ticketTypes: ticketTypes || [],
      image: image || ''
    });


    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({
      msg: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Edit event details (only by creator)
router.put('/edit-event/:id', verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID format' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You are not authorized to edit this event' });
    }

    if (event.cancelled) {
      return res.status(400).json({ msg: 'Cannot edit a cancelled event' });
    }

    // Update fields
    const updatableFields = ['title', 'startTime', 'endTime', 'description', 'location', 'maxAttendees', 'category', 'type', 'ticketTypes', 'image'];

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
    console.error('Error updating event:', err);
    res.status(500).json({
      msg: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete or cancel event (only by creator)
router.delete('/remove-event/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: 'Invalid event ID format' });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You are not authorized to delete this event' });
    }

    if (event.attendees.length > 0) {
      try {
        event.cancelled = true;
        event.cancellationPolicy = req.body.reason || 'Event cancelled by organizer';
        await event.save();
        return res.json({ msg: 'Event cancelled successfully' });
      } catch (saveError) {
        console.error('Error saving cancelled event:', saveError);
        return res.status(500).json({
          msg: 'Failed to cancel the event',
          error: process.env.NODE_ENV === 'development' ? saveError.message : undefined
        });
      }
    }

    // No attendees - can delete
    try {
      await event.deleteOne();
      return res.json({ msg: 'Event deleted successfully' });
    } catch (deleteError) {
      console.error('Error deleting event:', deleteError);
      return res.status(500).json({
        msg: 'Failed to delete event',
        error: process.env.NODE_ENV === 'development' ? deleteError.message : undefined
      });
    }

  } catch (err) {
    console.error('Unexpected error in remove-event:', err);
    return res.status(500).json({
      msg: 'Server error while processing your request',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Book tickets for an event
router.post('/book-ticket/:id', verifyToken, async (req, res) => {
  try {
    const { ticketTypeId, quantity = 1 } = req.body;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID format' });
    }

    if (!ticketTypeId || !isValidObjectId(ticketTypeId)) {
      return res.status(400).json({ msg: 'Invalid ticket type ID' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ msg: 'Quantity must be at least 1' });
    }

    const event = await Event.findById(req.params.id);

    if (!event || !event.isPublished || event.cancelled) {
      return res.status(400).json({ msg: 'Event is not available for booking' });
    }

    if (event.startTime <= new Date()) {
      return res.status(400).json({ msg: 'Event has already started or completed' });
    }

    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ msg: 'Specified ticket type not found in this event' });
    }

    if (ticketType.available < quantity) {
      return res.status(400).json({
        msg: `Only ${ticketType.available} tickets available for this type`
      });
    }

    const userBookings = event.bookings.filter(
      booking => booking.user.toString() === req.user.id &&
        booking.status === 'confirmed' &&
        booking.ticketType.toString() === ticketTypeId
    );
    const userTickets = userBookings.reduce((sum, booking) => sum + booking.tickets, 0);

    if (userTickets + quantity > ticketType.maxPerUser) {
      return res.status(400).json({
        msg: `You can only book ${ticketType.maxPerUser} tickets of this type (already booked ${userTickets})`
      });
    }

    ticketType.available -= quantity;

    event.bookings.push({
      user: req.user.id,
      tickets: quantity,
      status: 'confirmed',
      paymentStatus: 'paid',
      ticketType: ticketTypeId,
      bookedAt: new Date()
    });

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
    }

    await event.save();
    res.json({
      msg: 'Tickets booked successfully',
      bookingId: event.bookings[event.bookings.length - 1]._id,
      ticketsRemaining: ticketType.available
    });
  } catch (err) {
    console.error('Error booking tickets:', err);
    res.status(500).json({
      msg: 'Failed to book tickets',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
      .select('title startTime endTime location bookings ticketTypes image')

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
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }));
    }).flat();

    res.json(userTickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({
      msg: 'Failed to fetch your tickets',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Cancel a booking
router.post('/cancel-booking/:id', verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    const event = await Event.findOne({
      'bookings._id': req.params.id,
      'bookings.user': req.user.id
    });

    if (!event) {
      return res.status(404).json({ msg: 'Booking not found or you are not authorized' });
    }

    const booking = event.bookings.id(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking is already cancelled' });
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
    booking.cancelledAt = new Date();

    await event.save();

    res.json({
      msg: 'Booking cancelled successfully',
      refundAmount: ticketType ? ticketType.price * booking.tickets : 0
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({
      msg: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;