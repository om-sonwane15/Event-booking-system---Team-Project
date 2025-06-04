// src/routes/eventAdminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Event = require('../models/EventModel');
const mongoose = require('mongoose');


// Helper function for validating ObjectIds
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// View all events (including unpublished) with filtering, pagination, and search
router.get('/list-events', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      switch (status) {
        case 'pending':
          query.isPublished = false;
          query.cancelled = false;
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
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { startTime: -1 },
      populate: ['createdBy', 'attendees'],
      select: 'name email'
    };

    const events = await Event.paginate(query, options);

    res.json({
      success: true,
      data: events.docs,
      total: events.totalDocs,
      pages: events.totalPages,
      currentPage: events.page
    });
  } catch (err) {
    console.error('Admin event list error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View only events needing approval with pagination
router.get('/unpublished-events', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: 'createdBy',
      select: 'name email'
    };

    const events = await Event.paginate({ 
      isPublished: false,
      cancelled: false,
      startTime: { $gt: new Date() }
    }, options);

    res.json({
      success: true,
      data: events.docs,
      total: events.totalDocs,
      pages: events.totalPages,
      currentPage: events.page
    });
  } catch (err) {
    console.error('Unpublished events error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch pending events',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View all attendees for a specific event
router.get('/event-attendees/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid event ID format' 
      });
    }

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
    console.error('Event attendees error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch attendees',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// View detailed event information
router.get('/event-detail/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid event ID format' 
      });
    }

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
    console.error('Event detail error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin create event (can choose to publish immediately)
router.post('/create-event', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, startTime, endTime, type, category, location, maxAttendees, description, isPublished, ticketTypes } = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'startTime', 'endTime', 'type', 'category', 'location', 'maxAttendees', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate ticket types if provided
    if (ticketTypes && Array.isArray(ticketTypes)) {
      for (const ticketType of ticketTypes) {
        if (!ticketType.name || ticketType.price === undefined || ticketType.available === undefined) {
          return res.status(400).json({ 
            success: false,
            message: 'Ticket type must have name, price, and available quantity' 
          });
        }
      }
    }

    // Validate times
    const eventStart = new Date(startTime);
    const eventEnd = new Date(endTime);
    const now = new Date();

    if (eventStart <= now) {
      return res.status(400).json({ 
        success: false,
        message: 'Event must be in the future' 
      });
    }

    if (eventEnd <= eventStart) {
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
      isPublished: isPublished || false,
      ticketTypes: ticketTypes || []
    });

    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (err) {
    console.error('Event creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin update any event
router.put('/update-event/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid event ID format' 
      });
    }

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
      const now = new Date();

      if (newStart <= now) {
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
      'cancellationPolicy', 'ticketTypes'
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
    console.error('Event update error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin delete or cancel event with reason
router.delete('/remove-event/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid event ID format' 
      });
    }

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
        message: 'Cancellation reason is required' 
      });
    }

    // If there are attendees, cancel instead of delete
    if (event.attendees.length > 0) {
      try {
        event.cancelled = true;
        event.cancellationPolicy = reason;
        await event.save();
        
        return res.json({ 
          success: true,
          message: 'Event cancelled successfully',
          data: { reason } 
        });
      } catch (saveErr) {
        console.error('Event cancellation error:', saveErr);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to cancel event',
          error: process.env.NODE_ENV === 'development' ? saveErr.message : undefined
        });
      }
    }

    // No attendees - can delete
    try {
      await event.deleteOne();
      return res.json({ 
        success: true,
        message: 'Event deleted successfully',
        data: { reason } 
      });
    } catch (deleteErr) {
      console.error('Event deletion error:', deleteErr);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete event',
        error: process.env.NODE_ENV === 'development' ? deleteErr.message : undefined
      });
    }
  } catch (err) {
    console.error('Event removal error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process event removal',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Approve/publish an event
router.post('/publish-event/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid event ID format' 
      });
    }

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

    if (event.cancelled) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot publish a cancelled event' 
      });
    }

    event.isPublished = !event.isPublished;
    await event.save();

    res.json({ 
      success: true,
      message: event.isPublished ? 'Event published successfully' : 'Event unpublished successfully',
      data: { isPublished: event.isPublished }
    });
  } catch (err) {
    console.error('Event publish error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update event publish status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// // Get event statistics
// router.get('/stats', verifyToken, isAdmin, async (req, res) => {
//   try {
//     const [
//       totalEvents,
//       publishedEvents,
//       cancelledEvents,
//       upcomingEvents,
//       popularCategories
//     ] = await Promise.all([
//       Event.countDocuments(),
//       Event.countDocuments({ isPublished: true }),
//       Event.countDocuments({ cancelled: true }),
//       Event.countDocuments({ startTime: { $gt: new Date() } }),
//       Event.aggregate([
//         { $match: { isPublished: true } },
//         { $group: { _id: '$category', count: { $sum: 1 } } },
//         { $sort: { count: -1 } },
//         { $limit: 5 }
//       ])
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalEvents,
//         publishedEvents,
//         cancelledEvents,
//         upcomingEvents,
//         popularCategories
//       }
//     });
//   } catch (err) {
//     console.error('Event stats error:', err);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to fetch event statistics',
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// });

module.exports = router;