const logger = require('../../utils/logger');

module.exports = (client) => {
    logger.info('Loading handlers...');
    
    // Require and execute all handler modules
    require('./handleCommands')(client);
    require('./handleEvents')(client);
    
    // Initialize handlers
    client.handleEvents();
    client.handleCommands();
    
    logger.info('All handlers loaded successfully.');
}; 