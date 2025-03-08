const GuildSettings = require('../models/guildSettings');
const dbManager = require('../dbManager');
const logger = require('../../utils/logger');

/**
 * Service for interacting with guild settings
 */
class GuildSettingsService {
    /**
     * Get settings for a guild
     * @param {string} guildId - Discord guild ID
     * @returns {Promise<Object>} Guild settings
     */
    async getSettings(guildId) {
        const cacheKey = `guild_settings:${guildId}`;
        
        return dbManager.getOrFetch(cacheKey, async () => {
            try {
                let settings = await GuildSettings.findOne({ guildId });
                
                // If settings don't exist yet, create default ones
                if (!settings) {
                    settings = await this.createDefaultSettings(guildId);
                }
                
                return settings.toObject();
            } catch (error) {
                logger.error(`Error fetching guild settings for ${guildId}: ${error.message}`);
                throw error;
            }
        });
    }
    
    /**
     * Create default settings for a guild
     * @param {string} guildId - Discord guild ID
     * @returns {Promise<Object>} Created guild settings
     */
    async createDefaultSettings(guildId) {
        try {
            const newSettings = new GuildSettings({ guildId });
            await newSettings.save();
            logger.info(`Created default settings for guild ${guildId}`);
            return newSettings;
        } catch (error) {
            logger.error(`Error creating default settings for guild ${guildId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Update guild settings
     * @param {string} guildId - Discord guild ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated guild settings
     */
    async updateSettings(guildId, updateData) {
        try {
            const settings = await GuildSettings.findOneAndUpdate(
                { guildId },
                { $set: updateData },
                { new: true, upsert: true, runValidators: true }
            );
            
            // Invalidate cache
            dbManager.invalidateCache(`guild_settings:${guildId}`);
            
            logger.info(`Updated settings for guild ${guildId}`);
            return settings.toObject();
        } catch (error) {
            logger.error(`Error updating guild settings for ${guildId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Delete guild settings
     * @param {string} guildId - Discord guild ID
     * @returns {Promise<boolean>} Whether deletion was successful
     */
    async deleteSettings(guildId) {
        try {
            await GuildSettings.deleteOne({ guildId });
            
            // Invalidate cache
            dbManager.invalidateCache(`guild_settings:${guildId}`);
            
            logger.info(`Deleted settings for guild ${guildId}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting guild settings for ${guildId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Add custom command
     * @param {string} guildId - Discord guild ID
     * @param {string} command - Command name
     * @param {string} response - Command response
     * @returns {Promise<Object>} Updated guild settings
     */
    async addCustomCommand(guildId, command, response) {
        try {
            const settings = await GuildSettings.findOne({ guildId });
            
            if (!settings) {
                return this.createDefaultSettings(guildId);
            }
            
            // Update custom commands map
            settings.customCommands.set(command.toLowerCase(), response);
            await settings.save();
            
            // Invalidate cache
            dbManager.invalidateCache(`guild_settings:${guildId}`);
            
            logger.info(`Added custom command '${command}' for guild ${guildId}`);
            return settings.toObject();
        } catch (error) {
            logger.error(`Error adding custom command for guild ${guildId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Remove custom command
     * @param {string} guildId - Discord guild ID
     * @param {string} command - Command name
     * @returns {Promise<Object>} Updated guild settings
     */
    async removeCustomCommand(guildId, command) {
        try {
            const settings = await GuildSettings.findOne({ guildId });
            
            if (!settings) {
                return this.createDefaultSettings(guildId);
            }
            
            // Delete from custom commands map
            settings.customCommands.delete(command.toLowerCase());
            await settings.save();
            
            // Invalidate cache
            dbManager.invalidateCache(`guild_settings:${guildId}`);
            
            logger.info(`Removed custom command '${command}' for guild ${guildId}`);
            return settings.toObject();
        } catch (error) {
            logger.error(`Error removing custom command for guild ${guildId}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new GuildSettingsService(); 