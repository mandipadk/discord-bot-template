const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        default: null,
    },
    language: {
        type: String,
        default: 'en-US',
    },
    welcomeChannel: {
        type: String,
        default: null,
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome {user} to {server}!',
    },
    logChannel: {
        type: String,
        default: null,
    },
    autoRole: {
        type: String,
        default: null,
    },
    disabledCommands: {
        type: [String],
        default: [],
    },
    customCommands: {
        type: Map,
        of: String,
        default: new Map(),
    },
}, { timestamps: true });

// Create index for faster lookups
guildSettingsSchema.index({ guildId: 1 });

module.exports = mongoose.model('GuildSettings', guildSettingsSchema); 