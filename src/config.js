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
    
    // Sharding settings
    sharding: {
        enabled: process.env.SHARDING_ENABLED === 'true',
        totalShards: process.env.SHARDING_TOTAL_SHARDS || 'auto',
        mode: process.env.SHARDING_MODE || 'process', // 'process' or 'worker'
        serversPerShard: process.env.SERVERS_PER_SHARD || 1000,
    },
    
    // Discord API settings
    api: {
        version: '10', // Discord API version
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        },
        weather: {
            apiKey: process.env.WEATHER_API_KEY,
            units: process.env.WEATHER_UNITS || 'metric',
        },
        rateLimiting: {
            maxRequestsPerMinute: parseInt(process.env.API_RATE_LIMIT || '60', 10),
            maxConcurrent: parseInt(process.env.API_MAX_CONCURRENT || '10', 10),
        },
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
    
    // Database settings
    database: {
        uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/discordbot',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        cache: {
            ttl: parseInt(process.env.DATABASE_CACHE_TTL || '300', 10), // Time-to-live in seconds
            checkPeriod: 60, // Check for expired entries every 60 seconds
        },
    },
};

module.exports = config; 