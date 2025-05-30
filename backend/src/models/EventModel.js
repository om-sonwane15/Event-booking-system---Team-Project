const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Conference', 'Workshop', 'Meetup', 'Seminar', 'Other'], // Customize as needed
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: 1000,
    },
    image: {
      type: String, // store image URL or path
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
