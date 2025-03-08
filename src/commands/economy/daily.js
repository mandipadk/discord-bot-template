const { PermissionFlagsBits } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const userProfileService = require('../../database/services/userProfileService');

module.exports = {
    name: 'daily',
    description: 'Collect your daily reward of coins',
    options: [],
    
    execute: async (interaction, client) => {
        const userId = interaction.user.id;
        
        try {
            // Get user profile
            const profile = await userProfileService.getProfile(userId);
            
            // Check if user can claim daily reward
            const now = new Date();
            const lastDaily = profile.lastDaily ? new Date(profile.lastDaily) : null;
            
            // If user has already claimed today
            if (lastDaily && lastDaily.toDateString() === now.toDateString()) {
                // Calculate time until next daily
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                
                const timeRemaining = tomorrow - now;
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                
                return interaction.reply({
                    embeds: [EmbedUtil.warning(
                        'Already Claimed',
                        `You've already claimed your daily reward today. Come back in ${hours}h ${minutes}m.`
                    )],
                    ephemeral: true
                });
            }
            
            // Calculate reward - base amount plus streak bonus
            const dailyAmount = 100;
            
            // Update user profile with new balance and claim time
            const updatedProfile = await userProfileService.updateProfile(userId, {
                balance: profile.balance + dailyAmount,
                lastDaily: now
            });
            
            // Create embed for success message
            const dailyEmbed = EmbedUtil.success(
                'Daily Reward Collected!',
                `You claimed ${dailyAmount} coins. You now have ${updatedProfile.balance} coins.`
            );
            
            return interaction.reply({ embeds: [dailyEmbed] });
            
        } catch (error) {
            // Handle errors
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', `Could not process daily reward: ${error.message}`)],
                ephemeral: true
            });
        }
    }
}; 