// src/routes/eventRoutes.js 
const express = require('express');
const router = express.Router();
const Event = require('../models/EventModel');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all events
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .lean();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching events', error: err.message });
  }
});

// Create event
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      date, // dd/mm/yyyy
      time, // hh:mm AM/PM
      location,
      type,
      category,
      price,
      image,
      maxAttendees,
      venueDetails,
      ticketTypes,
      tags,
    } = req.body;

    // Validate date format (dd/mm/yyyy)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ msg: 'Invalid date format, use dd/mm/yyyy' });
    }

    // Parse date to ISO
    const [day, month, year] = date.split('/');
    const eventDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(eventDate)) {
      return res.status(400).json({ msg: 'Invalid date' });
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{2} (AM|PM)$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ msg: 'Invalid time format, use hh:mm AM/PM' });
    }

    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      time,
      location,
      type,
      category,
      price: price || 0,
      image: image || '',
      maxAttendees,
      venueDetails: venueDetails || {},
      ticketTypes: ticketTypes || [],
      tags: tags || [],
      createdBy: req.user.id,
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });
  } catch (err) {
    const statusCode = err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ msg: 'Error creating event', error: err.message });
  }
});

// Update event
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this event' });
    }

    // Validate date if provided
    if (req.body.date) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(req.body.date)) {
        return res.status(400).json({ msg: 'Invalid date format, use dd/mm/yyyy' });
      }
      const [day, month, year] = req.body.date.split('/');
      const newDate = new Date(`${year}-${month}-${day}`);
      if (isNaN(newDate)) {
        return res.status(400).json({ msg: 'Invalid date' });
      }
      req.body.date = newDate;
    }

    // Validate time if provided
    if (req.body.time) {
      const timeRegex = /^\d{1,2}:\d{2} (AM|PM)$/;
      if (!timeRegex.test(req.body.time)) {
        return res.status(400).json({ msg: 'Invalid time format, use hh:mm AM/PM' });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ msg: 'Event updated', event: updatedEvent });
  } catch (err) {
    const statusCode = err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ msg: 'Error updating event', error: err.message });
  }
});

// Cancel event
router.put('/cancel/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this event' });
    }

    event.cancelled = true;
    await event.save();
    res.status(200).json({ msg: 'Event cancelled', event });
  } catch (err) {
    res.status(500).json({ msg: 'Error cancelling event', error: err.message });
  }
});

// Delete event
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.status(200).json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting event', error: err.message });
  }
});

module.exports = router;