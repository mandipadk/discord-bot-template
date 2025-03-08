const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    reputation: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
        default: null,
    },
    lastReputation: {
        type: Date,
        default: null,
    },
    badges: {
        type: [String],
        default: [],
    },
    bio: {
        type: String,
        default: '',
        maxlength: 1000,
    },
    balance: {
        type: Number,
        default: 0,
    },
    inventory: {
        type: Map,
        of: Number,
        default: new Map(),
    },
}, { timestamps: true });

// Create index for faster lookups
userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema); 