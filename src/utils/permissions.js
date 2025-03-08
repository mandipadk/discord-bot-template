const { PermissionFlagsBits } = require('discord.js');
const logger = require('./logger');
const config = require('../config');

/**
 * Utility for handling advanced permissions in the bot
 */
class PermissionManager {
    constructor() {
        // Permission levels, higher number = higher permission
        this.levels = {
            EVERYONE: 0,
            MEMBER: 1,
            MODERATOR: 2,
            ADMINISTRATOR: 3,
            SERVER_OWNER: 4,
            BOT_OWNER: 5
        };
        
        // Cache for user permission levels
        this.cache = new Map();
        
        // Cache expiry (5 minutes)
        this.cacheExpiry = 5 * 60 * 1000;
    }
    
    /**
     * Get the permission level for a user in a guild
     * @param {GuildMember} member - Discord guild member
     * @param {Client} client - Discord client
     * @returns {Promise<number>} Permission level
     */
    async getPermissionLevel(member, client) {
        const { user, guild } = member;
        const cacheKey = `${guild.id}:${user.id}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return cached.level;
        }
        
        // Bot owner always has highest permissions
        if (user.id === config.ownerId) {
            this.setCacheEntry(cacheKey, this.levels.BOT_OWNER);
            return this.levels.BOT_OWNER;
        }
        
        // Server owner
        if (guild.ownerId === user.id) {
            this.setCacheEntry(cacheKey, this.levels.SERVER_OWNER);
            return this.levels.SERVER_OWNER;
        }
        
        // Administrator permission
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            this.setCacheEntry(cacheKey, this.levels.ADMINISTRATOR);
            return this.levels.ADMINISTRATOR;
        }
        
        // Moderator permissions
        const modPermissions = [
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.ModerateMembers
        ];
        
        if (modPermissions.some(perm => member.permissions.has(perm))) {
            this.setCacheEntry(cacheKey, this.levels.MODERATOR);
            return this.levels.MODERATOR;
        }
        
        // Regular member with no special permissions
        this.setCacheEntry(cacheKey, this.levels.MEMBER);
        return this.levels.MEMBER;
    }
    
    /**
     * Set a cache entry with expiration
     * @param {string} key - Cache key
     * @param {number} level - Permission level
     * @private
     */
    setCacheEntry(key, level) {
        this.cache.set(key, {
            level,
            expires: Date.now() + this.cacheExpiry
        });
    }
    
    /**
     * Check if a user has the required permission level
     * @param {GuildMember} member - Discord guild member
     * @param {number} requiredLevel - Required permission level
     * @param {Client} client - Discord client
     * @returns {Promise<boolean>} Whether the user has permission
     */
    async hasPermissionLevel(member, requiredLevel, client) {
        const userLevel = await this.getPermissionLevel(member, client);
        return userLevel >= requiredLevel;
    }
    
    /**
     * Clear permission cache for a specific user
     * @param {string} guildId - Guild ID
     * @param {string} userId - User ID
     */
    clearUserCache(guildId, userId) {
        const cacheKey = `${guildId}:${userId}`;
        this.cache.delete(cacheKey);
    }
    
    /**
     * Clear all permission cache
     */
    clearAllCache() {
        this.cache.clear();
    }
}

// Create singleton instance
const permissionManager = new PermissionManager();

module.exports = permissionManager; 