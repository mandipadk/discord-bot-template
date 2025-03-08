const logger = require('./logger');
const config = require('../config');

/**
 * Manages command cooldowns for users, roles, and channels
 */
class CooldownManager {
    constructor() {
        // Cooldown collections for different types
        this.userCooldowns = new Map();
        this.roleCooldowns = new Map();
        this.channelCooldowns = new Map();
        this.globalCooldowns = new Map();
        
        // Clean up expired cooldowns every 5 minutes
        setInterval(() => this.cleanupExpiredCooldowns(), 5 * 60 * 1000);
    }
    
    /**
     * Set a cooldown for a user, role, or channel
     * @param {string} commandName - Command name
     * @param {string} id - User/Role/Channel ID
     * @param {number} cooldown - Cooldown in seconds
     * @param {string} type - Type of cooldown ('user', 'role', 'channel', 'global')
     */
    setCooldown(commandName, id, cooldown, type = 'user') {
        const expirationTime = Date.now() + (cooldown * 1000);
        const cooldownKey = `${commandName}:${id}`;
        
        switch (type) {
            case 'user':
                this.userCooldowns.set(cooldownKey, expirationTime);
                break;
            case 'role':
                this.roleCooldowns.set(cooldownKey, expirationTime);
                break;
            case 'channel':
                this.channelCooldowns.set(cooldownKey, expirationTime);
                break;
            case 'global':
                this.globalCooldowns.set(commandName, expirationTime);
                break;
            default:
                logger.warn(`Unknown cooldown type: ${type}`);
        }
    }
    
    /**
     * Check if a user, role, or channel is on cooldown
     * @param {string} commandName - Command name
     * @param {string} id - User/Role/Channel ID
     * @param {string} type - Type of cooldown ('user', 'role', 'channel', 'global')
     * @returns {number|null} Time remaining in seconds or null if not on cooldown
     */
    checkCooldown(commandName, id, type = 'user') {
        const cooldownKey = `${commandName}:${id}`;
        let collection;
        
        switch (type) {
            case 'user':
                collection = this.userCooldowns;
                break;
            case 'role':
                collection = this.roleCooldowns;
                break;
            case 'channel':
                collection = this.channelCooldowns;
                break;
            case 'global':
                collection = this.globalCooldowns;
                cooldownKey = commandName;
                break;
            default:
                logger.warn(`Unknown cooldown type: ${type}`);
                return null;
        }
        
        const expirationTime = collection.get(cooldownKey);
        if (!expirationTime) return null;
        
        // Calculate remaining time
        const now = Date.now();
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return timeLeft;
        }
        
        // Cooldown has expired, remove it
        collection.delete(cooldownKey);
        return null;
    }
    
    /**
     * Remove all cooldowns for a specific command
     * @param {string} commandName - Command name
     */
    clearCommandCooldowns(commandName) {
        // Clear from all cooldown types
        for (const [key, _] of this.userCooldowns) {
            if (key.startsWith(`${commandName}:`)) {
                this.userCooldowns.delete(key);
            }
        }
        
        for (const [key, _] of this.roleCooldowns) {
            if (key.startsWith(`${commandName}:`)) {
                this.roleCooldowns.delete(key);
            }
        }
        
        for (const [key, _] of this.channelCooldowns) {
            if (key.startsWith(`${commandName}:`)) {
                this.channelCooldowns.delete(key);
            }
        }
        
        this.globalCooldowns.delete(commandName);
    }
    
    /**
     * Remove all cooldowns for a specific user
     * @param {string} userId - User ID
     */
    clearUserCooldowns(userId) {
        for (const [key, _] of this.userCooldowns) {
            if (key.endsWith(`:${userId}`)) {
                this.userCooldowns.delete(key);
            }
        }
    }
    
    /**
     * Clean up expired cooldowns to prevent memory leaks
     * @private
     */
    cleanupExpiredCooldowns() {
        const now = Date.now();
        
        // Helper function to clean a collection
        const cleanCollection = (collection) => {
            for (const [key, expiration] of collection) {
                if (now > expiration) {
                    collection.delete(key);
                }
            }
        };
        
        // Clean all cooldown collections
        cleanCollection(this.userCooldowns);
        cleanCollection(this.roleCooldowns);
        cleanCollection(this.channelCooldowns);
        cleanCollection(this.globalCooldowns);
        
        logger.debug('Cleaned up expired cooldowns');
    }
}

// Create singleton instance
const cooldownManager = new CooldownManager();

module.exports = cooldownManager; 