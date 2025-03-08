require('dotenv').config();
const logger = require('./utils/logger');
const config = require('./config');
const { createShardManager } = require('./shard');
const { initDatabase } = require('./database');
const { initApiServices } = require('./api');

// Initialize the database and APIs, then start the bot
Promise.all([initDatabase(), initApiServices()])
    .then(() => {
        // Check if sharding is enabled
        if (config.sharding.enabled) {
            logger.info('Starting bot with sharding enabled');
            
            // Create and spawn shards
            const manager = createShardManager();
            
            manager.spawn({ timeout: 60000 })
                .then(shards => {
                    logger.info(`Successfully spawned ${shards.size} shards`);
                })
                .catch(error => {
                    logger.error(`Failed to spawn shards: ${error.message}`);
                    process.exit(1);
                });
                
            // Handle process termination signals for clean shutdown
            process.on('SIGINT', async () => {
                logger.info('SIGINT received. Shutting down shards and database...');
                const { dbManager } = require('./database');
                await Promise.all([
                    manager.respawnAll({ shardDelay: 5000, respawnDelay: 500, timeout: 30000 }),
                    dbManager.disconnect()
                ]);
                process.exit(0);
            });
            
        } else {
            // Run the bot without sharding
            logger.info('Starting bot without sharding');
            require('./index');
        }
    })
    .catch(error => {
        logger.error(`Failed to initialize services: ${error.message}`);
        process.exit(1);
    }); 