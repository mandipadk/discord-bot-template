require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

// Log which intents are being used
logger.info(`Using intents: Guilds, GuildMessages, GuildVoiceStates${config.intents.useMessageContent ? ', MessageContent' : ''}${config.intents.useGuildMembers ? ', GuildMembers' : ''}`);

// Create intents array with non-privileged intents
const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
];

// Add privileged intents if enabled
if (config.intents.useMessageContent) intents.push(GatewayIntentBits.MessageContent);
if (config.intents.useGuildMembers) intents.push(GatewayIntentBits.GuildMembers);

// Create a new client instance with all necessary intents
const client = new Client({
    intents: intents,
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});

// Create collections for commands
client.commands = new Collection();
client.commandArray = [];

// Initialize handlers
require('./functions/handlers')(client);

// Setup process error handling for unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}`);
    logger.error(`Reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error}`);
});

// Display initialization message
logger.info(`Starting bot in ${config.env.isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

// Login to Discord with your token
client.login(config.bot.token)
    .then(() => {
        logger.info(`Bot successfully logged in as ${client.user.tag}`);
    })
    .catch((error) => {
        logger.error(`Error logging in: ${error}`);
        if (error.message.includes('disallowed intents')) {
            logger.error('This error is related to privileged intents. Please make sure they are enabled in the Discord Developer Portal, or disable them in your .env file.');
        }
        process.exit(1);
    });

// Add this line after client creation
if (process.env.SHARDING_ENABLED === 'true') {
    const { ShardClientUtil } = require('discord.js');
    if (!client.shard) {
        // If running from shard.js, this will already be set
        // If not, we need to mock it for local development testing
        client.shard = ShardClientUtil.singleton(client);
    }
} 