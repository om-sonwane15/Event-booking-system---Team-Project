// src/routes/eventAdminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');


// View all events (including unpublished)
router.get('/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View only events needing approval
router.get('/admin/events/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await Event.find({ isPublished: false })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View all attendees for a specific event
router.get('/admin/events/:id/attendees', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email phone')
      .populate('bookings.user', 'name email');
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json({
      eventTitle: event.title,
      totalAttendees: event.attendees.length,
      attendees: event.attendees,
      bookings: event.bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// View detailed event information
router.get('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .populate('bookings.user', 'name email')
      .populate('ratings.user', 'name');
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin create event (can choose to publish immediately)
router.post('/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, date, time, type, category, location, maxAttendees, description, isPublished } = req.body;
    
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
      createdBy: req.user.id, // Admin is the creator
      isPublished: isPublished || false
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin update any event
router.put('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
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

    // Update all allowed fields
    const updatableFields = [
      'title', 'date', 'time', 'type', 'category', 'location', 
      'maxAttendees', 'description', 'image', 'gallery', 'tags',
      'isFeatured', 'cancellationPolicy', 'ageRestriction', 'language', 'duration'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin delete or cancel event with reason
router.delete('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (!reason) {
      return res.status(400).json({ msg: 'Please provide a reason for cancellation/deletion' });
    }

    // Instead of deleting, we'll mark as cancelled and store the reason
    event.cancelled = true;
    event.cancellationPolicy = reason;
    
    // Notify the creator (in a real app, you'd send an email or notification)
    console.log(`Event ${event._id} cancelled by admin. Reason: ${reason}`);
    
    await event.save();
    res.json({ msg: 'Event cancelled successfully', reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve/publish an event
router.post('/admin/events/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if event date is in the future
    const eventDateTime = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ msg: 'Cannot publish an event with past date/time' });
    }

    // Toggle publish status
    event.isPublished = !event.isPublished;
    await event.save();

    res.json({ 
      msg: event.isPublished ? 'Event published successfully' : 'Event unpublished successfully',
      isPublished: event.isPublished
    });
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