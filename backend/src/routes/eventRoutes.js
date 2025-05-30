const express = require('express');
const router = express.Router();
const Event = require('../models/EventModel');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all events (user or admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching events', error: err.message });
  }
});

// Create event (user or admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, date, location, type, price, image } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      type,
      price: price || 0,
      image: image || '',
      createdBy: req.user.id,
    });

    await event.save();
    res.status(201).json({ msg: 'Event created', event });
  } catch (err) {
    const statusCode = err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ msg: 'Error creating event', error: err.message });
  }
});

// Update event (admin or owner only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this event' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ msg: 'Event updated', event: updated });
  } catch (err) {
    const statusCode = err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ msg: 'Error updating event', error: err.message });
  }
});

// Delete event (admin or owner only)
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
