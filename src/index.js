require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

// Create a new client instance with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
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
        process.exit(1);
    }); 