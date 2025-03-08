const { ShardingManager } = require('discord.js');
const logger = require('./utils/logger');
const config = require('./config');
const path = require('path');

// Path to the bot's main file
const shardFile = path.join(__dirname, 'index.js');

/**
 * Creates and configures a ShardingManager for the bot
 * @returns {ShardingManager} The configured ShardingManager
 */
function createShardManager() {
    // Check for required environment variables
    if (!config.bot.token) {
        logger.error('Missing bot token. Please check your .env file.');
        process.exit(1);
    }

    // Create the sharding manager
    const manager = new ShardingManager(shardFile, {
        token: config.bot.token,
        totalShards: config.sharding.totalShards || 'auto',
        shardArgs: process.argv.slice(2),
        respawn: true,
        mode: config.sharding.mode || 'process'
    });

    // Set up event handlers
    manager.on('shardCreate', shard => {
        logger.info(`Launched shard ${shard.id}`);
        
        // Forward shard-specific events to logger
        shard.on('ready', () => {
            logger.info(`Shard ${shard.id} ready`);
        });
        
        shard.on('disconnect', () => {
            logger.warn(`Shard ${shard.id} disconnected`);
        });
        
        shard.on('reconnecting', () => {
            logger.info(`Shard ${shard.id} reconnecting`);
        });
        
        shard.on('error', (error) => {
            logger.error(`Shard ${shard.id} error: ${error.message}`);
        });
    });

    return manager;
}

module.exports = { createShardManager }; 