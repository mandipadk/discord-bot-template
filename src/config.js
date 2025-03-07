require('dotenv').config();

const config = {
    // Bot configuration
    bot: {
        token: process.env.BOT_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        prefix: process.env.PREFIX || '!', // Legacy prefix for message commands
    },
    
    // Environment settings
    env: {
        isDevelopment: process.env.NODE_ENV !== 'production',
        logLevel: process.env.LOG_LEVEL || 'info',
    },
    
    // Command settings
    commands: {
        cooldown: 3, // Default cooldown in seconds
        globalCooldown: 5, // Global command cooldown in seconds
    },
    
    // Intent settings
    intents: {
        useMessageContent: process.env.USE_MESSAGE_CONTENT === 'true',
        useGuildMembers: process.env.USE_GUILD_MEMBERS === 'true',
    },
    
    // Discord API settings
    api: {
        version: '10', // Discord API version
    },
    
    // Bot owners/admins
    owners: [
        // Add Discord user IDs here
    ],
    
    // Custom emojis
    emojis: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
    },
    
    // Colors for embeds
    colors: {
        primary: '#5865F2', // Discord blurple
        success: '#57F287', // Discord green
        error: '#ED4245',   // Discord red
        warning: '#FEE75C', // Discord yellow
        info: '#5865F2',    // Discord blurple
    },
};

module.exports = config; 