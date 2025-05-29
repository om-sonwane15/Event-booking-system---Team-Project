const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name must be at most 50 characters'],
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
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
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
            minlength: [8, 'Password must be at least 8 characters'],
            validate: {
                validator: function (v) {
                    // Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
                    return (
                        /[a-z]/.test(v) &&
                        /[A-Z]/.test(v) &&
                        /[0-9]/.test(v) &&
                        /[^A-Za-z0-9]/.test(v)
                    );
                },
                message:
                    'Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
            },
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
