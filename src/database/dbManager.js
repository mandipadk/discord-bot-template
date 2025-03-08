const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');
const NodeCache = require('node-cache');

/**
 * Database manager for handling MongoDB connections and operations
 */
class DatabaseManager {
    constructor() {
        this.mongoose = mongoose;
        this.isConnected = false;
        this.cache = new NodeCache({
            stdTTL: config.database.cache.ttl,
            checkperiod: config.database.cache.checkPeriod,
        });
        
        // Set mongoose options
        mongoose.set('strictQuery', true);
    }
    
    /**
     * Connect to MongoDB
     * @returns {Promise<void>}
     */
    async connect() {
        if (this.isConnected) {
            logger.info('Database connection already established.');
            return;
        }
        
        try {
            await mongoose.connect(config.database.uri, config.database.options);
            
            this.isConnected = true;
            logger.info('Successfully connected to MongoDB');
            
            // Handle connection events
            mongoose.connection.on('error', error => {
                logger.error(`MongoDB connection error: ${error}`);
            });
            
            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected. Attempting to reconnect...');
                this.isConnected = false;
                this.connect();
            });
            
        } catch (error) {
            logger.error(`Failed to connect to MongoDB: ${error.message}`);
            // In production, might want to retry instead of exiting
            // process.exit(1);
            throw error;
        }
    }
    
    /**
     * Disconnect from MongoDB
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('Disconnected from MongoDB');
        } catch (error) {
            logger.error(`Failed to disconnect from MongoDB: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Get data from cache or database
     * @param {string} key - Cache key
     * @param {Function} fetchFunction - Function to fetch data if not in cache
     * @returns {Promise<any>} - Retrieved data
     */
    async getOrFetch(key, fetchFunction) {
        // Try to get from cache first
        const cachedData = this.cache.get(key);
        if (cachedData !== undefined) {
            logger.debug(`Cache hit for key: ${key}`);
            return cachedData;
        }
        
        // If not in cache, fetch from database
        logger.debug(`Cache miss for key: ${key}, fetching from database`);
        try {
            const data = await fetchFunction();
            
            // Store in cache for future requests
            if (data !== null && data !== undefined) {
                this.cache.set(key, data);
            }
            
            return data;
        } catch (error) {
            logger.error(`Error fetching data for key ${key}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Invalidate a specific cache key
     * @param {string} key - Cache key to invalidate
     */
    invalidateCache(key) {
        this.cache.del(key);
        logger.debug(`Cache invalidated for key: ${key}`);
    }
    
    /**
     * Clear the entire cache
     */
    clearCache() {
        this.cache.flushAll();
        logger.debug('Entire cache cleared');
    }
}

// Create a singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager; 