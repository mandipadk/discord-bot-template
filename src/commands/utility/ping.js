const { EmbedBuilder } = require('discord.js');
const localizationManager = require('../../utils/localizationManager');

module.exports = {
    name: 'ping',
    description: 'Check the bot\'s response time',
    
    execute: async (interaction, client) => {
        const sent = await interaction.deferReply({ fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        
        // Get localized response
        const responseText = await localizationManager.translateGuild(
            'commands.ping.response', 
            interaction.guild.id, 
            { ping }
        );
        
        // Create and send embed
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(responseText);
            
        await interaction.editReply({ embeds: [embed] });
    }
}; 