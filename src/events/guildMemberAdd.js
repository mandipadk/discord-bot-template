const { EmbedBuilder } = require('discord.js');
const guildSettingsService = require('../database/services/guildSettingsService');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    
    execute: async (member, client) => {
        const { guild, user } = member;
        
        try {
            // Get guild settings
            const settings = await guildSettingsService.getSettings(guild.id);
            
            // Check if welcome messages are enabled
            if (!settings.welcomeChannel) return;
            
            // Get welcome channel
            const welcomeChannel = guild.channels.cache.get(settings.welcomeChannel);
            if (!welcomeChannel) {
                logger.warn(`Welcome channel ${settings.welcomeChannel} not found in guild ${guild.id}`);
                return;
            }
            
            // Format welcome message
            let welcomeMessage = settings.welcomeMessage || 'Welcome {user} to {server}!';
            welcomeMessage = welcomeMessage
                .replace('{user}', `<@${user.id}>`)
                .replace('{server}', guild.name)
                .replace('{username}', user.username)
                .replace('{membercount}', guild.memberCount);
                
            // Create welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`Welcome to ${guild.name}!`)
                .setDescription(welcomeMessage)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Member #${guild.memberCount}` })
                .setTimestamp();
                
            // Send welcome message
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
            
            logger.info(`Sent welcome message for ${user.tag} in ${guild.name}`);
            
        } catch (error) {
            logger.error(`Error sending welcome message in ${guild.id}: ${error.message}`);
        }
    }
}; 