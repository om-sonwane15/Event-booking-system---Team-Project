// src/routes/eventAdminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');


// View all events (including unpublished) with filtering
router.get('/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status) {
      switch (status) {
        case 'pending':
          query.isPublished = false;
          break;
        case 'published':
          query.isPublished = true;
          query.cancelled = false;
          break;
        case 'cancelled':
          query.cancelled = true;
          break;
        case 'upcoming':
          query.startTime = { $gt: new Date() };
          break;
        case 'past':
          query.endTime = { $lt: new Date() };
          break;
      }
    }

    if (category) query.category = category;

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ startTime: -1 })
      .lean();

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View only events needing approval
router.get('/admin/events/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await Event.find({ 
      isPublished: false,
      cancelled: false,
      startTime: { $gt: new Date() }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    console.error('Error fetching pending events:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching pending events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View all attendees for a specific event
router.get('/admin/events/:id/attendees', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email phone')
      .populate('bookings.user', 'name email');
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      eventTitle: event.title,
      totalAttendees: event.attendees.length,
      attendees: event.attendees,
      bookings: event.bookings
    });
  } catch (err) {
    console.error('Error fetching event attendees:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching attendees',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View detailed event information
router.get('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .populate('bookings.user', 'name email');
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching event details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin create event (can choose to publish immediately)
router.post('/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, startTime, endTime, type, category, location, maxAttendees, description, isPublished } = req.body;
    
    if (!title || !startTime || !endTime || !type || !category || !location || !maxAttendees || !description) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const eventDateTime = new Date(startTime);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Event must be in the future' 
      });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ 
        success: false,
        message: 'End time must be after start time' 
      });
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
      isPublished: isPublished || false
    });

    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin update any event
router.put('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Validate new times if being updated
    if (req.body.startTime || req.body.endTime) {
      const newStart = req.body.startTime ? new Date(req.body.startTime) : event.startTime;
      const newEnd = req.body.endTime ? new Date(req.body.endTime) : event.endTime;

      if (newStart <= new Date()) {
        return res.status(400).json({ 
          success: false,
          message: 'Event must be in the future' 
        });
      }
      if (newEnd <= newStart) {
        return res.status(400).json({ 
          success: false,
          message: 'End time must be after start time' 
        });
      }
    }

    // Update all allowed fields
    const updatableFields = [
      'title', 'startTime', 'endTime', 'type', 'category', 'location', 
      'maxAttendees', 'description', 'image', 'isFeatured',
      'cancellationPolicy'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin delete or cancel event with reason
router.delete('/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a reason for cancellation/deletion' 
      });
    }

    // If there are attendees, cancel instead of delete
    if (event.attendees.length > 0) {
      event.cancelled = true;
      event.cancellationPolicy = reason;
      await event.save();
      
      return res.json({ 
        success: true,
        message: 'Event cancelled successfully',
        reason 
      });
    }

    // No attendees - can delete
    await event.remove();
    
    res.json({ 
      success: true,
      message: 'Event deleted successfully',
      reason 
    });
  } catch (err) {
    console.error('Error cancelling event:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while cancelling event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Approve/publish an event
router.post('/admin/events/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    if (event.startTime <= new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot publish an event with past start time' 
      });
    }

    event.isPublished = !event.isPublished;
    await event.save();

    res.json({ 
      success: true,
      message: event.isPublished ? 'Event published successfully' : 'Event unpublished successfully',
      isPublished: event.isPublished
    });
  } catch (err) {
    console.error('Error approving event:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while approving event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get event statistics
router.get('/admin/events/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ isPublished: true });
    const cancelledEvents = await Event.countDocuments({ cancelled: true });
    const upcomingEvents = await Event.countDocuments({ startTime: { $gt: new Date() } });
    
    const popularCategories = await Event.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        cancelledEvents,
        upcomingEvents,
        popularCategories
      }
    });
  } catch (err) {
    console.error('Error fetching event stats:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;