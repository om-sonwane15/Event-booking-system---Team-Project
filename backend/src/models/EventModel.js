// src/models/EventModel.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  startTime: { type: Date, required: true }, // Combined date and time
  endTime: { type: Date, required: true },   // Combined date and time
  type: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  maxAttendees: { type: Number, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ticketTypes: [
    {
      name: { type: String, required: true },
      price: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      maxPerUser: { type: Number, default: 1 },
    },
  ],
  bookings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      tickets: { type: Number, default: 1 },
      status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
      paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
      bookedAt: { type: Date, default: Date.now },
      ticketType: { type: mongoose.Schema.Types.ObjectId }
    },
  ],
  description: { type: String, required: true, maxlength: 1000 },
  image: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  cancellationPolicy: { type: String, default: '' },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for event status
EventSchema.virtual('status').get(function () {
  try {
    if (this.cancelled) return 'Cancelled';
    const now = new Date();

    if (this.endTime < now) return 'Past';
    if (this.startTime <= now && this.endTime >= now) return 'Ongoing';
    if (this.attendees && this.attendees.length >= this.maxAttendees) return 'Fully Booked';
    return 'Upcoming';
  } catch (err) {
    console.error('Error calculating event status:', err);
    return 'Status Unknown';
  }
});

EventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', EventSchema);