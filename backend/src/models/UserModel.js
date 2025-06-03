// src/models/UserModel.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            
            validate: {
                validator: function (v) {
                    // Only allow letters and spaces
                    return /^[A-Za-z\s]+$/.test(v);
                },
                message: 'Name can only contain letters and spaces',
            },
        },
        phone: {
            type: String,
            trim: true,
            default: null,
        },

        bio: {
            type: String,
            trim: true,
            maxlength: [500, 'Bio must be at most 500 characters'],
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        profilePic: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [
                /^\S+@\S+\.\S+$/,
                'Please enter a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
         isBanned: {
      type: Boolean,
      default: false,
    },
    bannedReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
