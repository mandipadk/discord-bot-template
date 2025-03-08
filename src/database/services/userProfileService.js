const UserProfile = require('../models/userProfile');
const dbManager = require('../dbManager');
const logger = require('../../utils/logger');

/**
 * Service for interacting with user profiles
 */
class UserProfileService {
    /**
     * Get a user profile
     * @param {string} userId - Discord user ID
     * @returns {Promise<Object>} User profile
     */
    async getProfile(userId) {
        const cacheKey = `user_profile:${userId}`;
        
        return dbManager.getOrFetch(cacheKey, async () => {
            try {
                let profile = await UserProfile.findOne({ userId });
                
                // If profile doesn't exist yet, create default one
                if (!profile) {
                    profile = await this.createDefaultProfile(userId);
                }
                
                return profile.toObject();
            } catch (error) {
                logger.error(`Error fetching user profile for ${userId}: ${error.message}`);
                throw error;
            }
        });
    }
    
    /**
     * Create default profile for a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<Object>} Created user profile
     */
    async createDefaultProfile(userId) {
        try {
            const newProfile = new UserProfile({ userId });
            await newProfile.save();
            logger.info(`Created default profile for user ${userId}`);
            return newProfile;
        } catch (error) {
            logger.error(`Error creating default profile for user ${userId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Update a user profile
     * @param {string} userId - Discord user ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user profile
     */
    async updateProfile(userId, updateData) {
        try {
            const profile = await UserProfile.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, upsert: true, runValidators: true }
            );
            
            // Invalidate cache
            dbManager.invalidateCache(`user_profile:${userId}`);
            
            logger.info(`Updated profile for user ${userId}`);
            return profile.toObject();
        } catch (error) {
            logger.error(`Error updating user profile for ${userId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Add XP to a user
     * @param {string} userId - Discord user ID
     * @param {number} amount - Amount of XP to add
     * @returns {Promise<{profile: Object, leveledUp: boolean}>} Updated profile and whether user leveled up
     */
    async addXP(userId, amount) {
        try {
            // Get current profile
            const profile = await this.getProfile(userId);
            
            // Calculate new XP and level
            const newXP = profile.xp + amount;
            const oldLevel = profile.level;
            const newLevel = Math.floor(0.1 * Math.sqrt(newXP));
            
            // Update profile
            const updatedProfile = await this.updateProfile(userId, {
                xp: newXP,
                level: newLevel
            });
            
            return {
                profile: updatedProfile,
                leveledUp: newLevel > oldLevel,
                oldLevel,
                newLevel
            };
        } catch (error) {
            logger.error(`Error adding XP for user ${userId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Add or remove balance from a user
     * @param {string} userId - Discord user ID
     * @param {number} amount - Amount to add (negative to remove)
     * @returns {Promise<Object>} Updated user profile
     */
    async updateBalance(userId, amount) {
        try {
            const profile = await UserProfile.findOne({ userId });
            
            if (!profile) {
                const newProfile = await this.createDefaultProfile(userId);
                newProfile.balance = Math.max(0, amount); // Don't allow negative balance for new profiles
                await newProfile.save();
                
                // Invalidate cache
                dbManager.invalidateCache(`user_profile:${userId}`);
                
                return newProfile.toObject();
            }
            
            // Update balance, don't allow negative
            profile.balance = Math.max(0, profile.balance + amount);
            await profile.save();
            
            // Invalidate cache
            dbManager.invalidateCache(`user_profile:${userId}`);
            
            logger.info(`Updated balance for user ${userId} by ${amount}`);
            return profile.toObject();
        } catch (error) {
            logger.error(`Error updating balance for user ${userId}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Get leaderboard by XP
     * @param {number} limit - Number of users to get
     * @returns {Promise<Array>} Leaderboard of users
     */
    async getXPLeaderboard(limit = 10) {
        try {
            const leaderboard = await UserProfile.find({})
                .sort({ xp: -1 })
                .limit(limit)
                .lean();
                
            return leaderboard;
        } catch (error) {
            logger.error(`Error fetching XP leaderboard: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UserProfileService(); 