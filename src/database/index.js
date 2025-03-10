const fs = require('fs');
const path = require('path');
const dbManager = require('./dbManager');
const logger = require('../utils/logger');

// Models collection
const models = {};

// Services collection
const services = {};

/**
 * Initialize database system and load all models and services
 * @returns {Promise<void>}
 */
async function initDatabase() {
    try {
        // Connect to database
        await dbManager.connect();
        
        // Load models
        const modelsPath = path.join(__dirname, 'models');
        const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js'));
        
        for (const file of modelFiles) {
            const modelName = file.split('.')[0];
            const model = require(path.join(modelsPath, file));
            models[modelName] = model;
            logger.info(`Loaded database model: ${modelName}`);
        }
        
        // Load services
        const servicesPath = path.join(__dirname, 'services');
        const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));
        
        for (const file of serviceFiles) {
            const fullServiceName = file.split('.')[0];
            const service = require(path.join(servicesPath, file));
            
            // Store with full name
            services[fullServiceName] = service;
            
            // Also store without 'Service' suffix for easier access
            if (fullServiceName.endsWith('Service')) {
                const shortName = fullServiceName.replace('Service', '');
                services[shortName] = service;
            }
            
            logger.info(`Loaded database service: ${fullServiceName}`);
        }
        
        logger.info('Database system initialized successfully');
        
    } catch (error) {
        logger.error(`Error initializing database: ${error.message}`);
        throw error;
    }
}

module.exports = {
    dbManager,
    models,
    services,
    initDatabase
}; 