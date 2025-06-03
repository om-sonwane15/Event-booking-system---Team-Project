const mongoose = require('mongoose');

// Helper to format date in dd/mm/yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: Date, required: true },
  time: { type: String, required: true, match: /^\d{1,2}:\d{2} (AM|PM)$/ },
  type: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  venueDetails: {
    address: String,
    mapLink: String,
    seatingChart: String,
  },
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
    },
  ],
  price: { type: Number, default: 0 },
  description: { type: String, required: true, maxlength: 1000 },
  image: { type: String, default: '' },
  gallery: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  ],
  tags: [String],
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  cancellationPolicy: { type: String, default: '' },
  ageRestriction: { type: String, default: '' },
  language: { type: String, default: '' },
  duration: { type: String, default: '' },
}, { timestamps: true });

// Virtuals for formatted date and time
EventSchema.virtual('formattedDate').get(function () {
  return formatDate(this.date);
});

EventSchema.virtual('formattedTime').get(function () {
  return this.time;
});

// Virtual for event status
EventSchema.virtual('status').get(function () {
  if (this.cancelled) return 'Cancelled';

  const now = new Date();

  // Parse stored date
  const eventDateTime = new Date(this.date);

  // Parse stored time
  const [hours, minutes, ampm] = this.time.split(/[: ]/);
  let eventHours = parseInt(hours, 10);
  if (ampm === 'PM' && eventHours !== 12) eventHours += 12;
  if (ampm === 'AM' && eventHours === 12) eventHours = 0;
  eventDateTime.setHours(eventHours, parseInt(minutes, 10), 0, 0);

  if (this.attendees.length >= this.maxAttendees) return 'Fully Booked';
  if (now.toDateString() === eventDateTime.toDateString()) return 'Today';
  if (eventDateTime < now) return 'Past';
  return 'Upcoming';
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
