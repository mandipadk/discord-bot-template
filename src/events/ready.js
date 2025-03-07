const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    
    execute: async (client) => {
        // Set bot status and activity
        client.user.setPresence({
            activities: [{ 
                name: '/help | Discord Bot Template', 
                type: 0 // Playing
            }],
            status: 'online'
        });
        
        // Log successful startup
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`);
    }
}; 