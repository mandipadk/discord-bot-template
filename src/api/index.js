const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Services collection
const services = {};

/**
 * Initialize API services
 * @returns {Promise<void>}
 */
async function initApiServices() {
    try {
        // Load services
        const servicesPath = path.join(__dirname, 'services');
        const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));
        
        for (const file of serviceFiles) {
            const serviceName = file.split('.')[0].replace('Service', '');
            const service = require(path.join(servicesPath, file));
            services[serviceName] = service;
            logger.info(`Loaded API service: ${serviceName}`);
        }
        
        logger.info('API services initialized successfully');
    } catch (error) {
        logger.error(`Error initializing API services: ${error.message}`);
        throw error;
    }
}

module.exports = {
    services,
    initApiServices
}; 