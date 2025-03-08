const { PermissionFlagsBits } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const userProfileService = require('../../database/services/userProfileService');

module.exports = {
    name: 'profile',
    description: 'View your profile or another user\'s profile',
    options: [
        {
            name: 'user',
            description: 'The user to view the profile of',
            type: 6, // USER type
            required: false
        }
    ],
    
    execute: async (interaction, client) => {
        await interaction.deferReply();
        
        // Get the target user (mentioned user or the command user)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        try {
            // Get user profile from database
            const profile = await userProfileService.getProfile(targetUser.id);
            
            // Format dates
            const createdAt = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';
            const lastDaily = profile.lastDaily ? new Date(profile.lastDaily).toLocaleDateString() : 'Never';
            
            // Create embed
            const profileEmbed = EmbedUtil.base({
                title: `${targetUser.username}'s Profile`,
                description: profile.bio || 'No bio set',
                thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
                fields: [
                    { name: '📊 Level', value: `${profile.level} (${profile.xp} XP)`, inline: true },
                    { name: '⭐ Reputation', value: `${profile.reputation}`, inline: true },
                    { name: '💰 Balance', value: `${profile.balance} coins`, inline: true },
                    { name: '🏆 Badges', value: profile.badges.length > 0 ? profile.badges.join(', ') : 'None', inline: true },
                    { name: '📅 Last Daily', value: lastDaily, inline: true },
                    { name: '📝 Profile Created', value: createdAt, inline: true }
                ],
                footer: `User ID: ${targetUser.id}`
            });
            
            await interaction.editReply({ embeds: [profileEmbed] });
            
        } catch (error) {
            // Handle errors
            await interaction.editReply({
                embeds: [EmbedUtil.error('Error', `Could not fetch profile: ${error.message}`)]
            });
        }
    }
}; 