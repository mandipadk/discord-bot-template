const dbManager = require('../dbManager');
const logger = require('../../utils/logger');

/**
 * Base service class with bypass mode support
 */
class BaseService {
    constructor(modelName, defaultData = {}) {
        this.modelName = modelName;
        this.defaultData = defaultData;
        this.bypassMode = dbManager.isBypassMode();
    }
    
    /**
     * Generate a storage key for in-memory data
     * @param {string} id - The main identifier (e.g., userId, guildId)
     * @returns {string} Storage key
     */
    getStorageKey(id) {
        return `${this.modelName}:${id}`;
    }
    
    /**
     * Get a document by its ID, with bypass mode support
     * @param {string} id - Document identifier
     * @param {Function} dbFetchFunction - Function to fetch from database
     * @returns {Promise<Object>} Document data
     */
    async getDocument(id, dbFetchFunction) {
        const key = this.getStorageKey(id);
        
        if (this.bypassMode) {
            // In bypass mode, use in-memory storage
            const data = dbManager.inMemoryStorage.get(key);
            if (data) {
                return data;
            }
            
            // If not found, create default data
            const defaultData = typeof this.defaultData === 'function' 
                ? this.defaultData(id) 
                : { ...this.defaultData, id };
                
            // Store in memory
            dbManager.setInMemoryData(key, defaultData);
            return defaultData;
        }
        
        // Normal mode - use database
        return dbManager.getOrFetch(key, dbFetchFunction);
    }
    
    /**
     * Update a document, with bypass mode support
     * @param {string} id - Document identifier
     * @param {Object} updateData - Data to update
     * @param {Function} dbUpdateFunction - Function to update in database
     * @returns {Promise<Object>} Updated document
     */
    async updateDocument(id, updateData, dbUpdateFunction) {
        const key = this.getStorageKey(id);
        
        if (this.bypassMode) {
            // In bypass mode, update in-memory storage
            const existingData = await this.getDocument(id, () => null);
            const updatedData = { ...existingData, ...updateData };
            
            // Store updated data
            dbManager.setInMemoryData(key, updatedData);
            logger.debug(`In-memory update for ${key}`);
            return updatedData;
        }
        
        // Normal mode - update in database
        try {
            const result = await dbUpdateFunction();
            
            // Invalidate cache
            dbManager.invalidateCache(key);
            
            return result;
        } catch (error) {
            logger.error(`Error updating ${this.modelName} for ${id}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Delete a document, with bypass mode support
     * @param {string} id - Document identifier
     * @param {Function} dbDeleteFunction - Function to delete from database
     * @returns {Promise<boolean>} Success status
     */
    async deleteDocument(id, dbDeleteFunction) {
        const key = this.getStorageKey(id);
        
        if (this.bypassMode) {
            // In bypass mode, delete from in-memory storage
            dbManager.invalidateCache(key);
            logger.debug(`In-memory delete for ${key}`);
            return true;
        }
        
        // Normal mode - delete from database
        try {
            await dbDeleteFunction();
            
            // Invalidate cache
            dbManager.invalidateCache(key);
            
            return true;
        } catch (error) {
            logger.error(`Error deleting ${this.modelName} for ${id}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BaseService; 