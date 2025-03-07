const EmbedUtil = require('../../utils/embed');
const VoiceUtil = require('../../utils/voice');

module.exports = {
    name: 'join',
    description: 'Join your voice channel',
    options: [],
    
    execute: async (interaction, client) => {
        // Check if user is in a voice channel
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;
        
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Voice Channel Required', 'You must be in a voice channel to use this command.')],
                ephemeral: true
            });
        }
        
        try {
            // Check bot permissions
            const permissions = voiceChannel.permissionsFor(client.user);
            if (!permissions.has('Connect') || !permissions.has('Speak')) {
                return interaction.reply({
                    embeds: [EmbedUtil.error('Missing Permissions', 'I need the permissions to connect and speak in your voice channel.')],
                    ephemeral: true
                });
            }
            
            // Join the channel
            await VoiceUtil.joinChannel({
                channel: voiceChannel,
                guild: interaction.guild
            });
            
            // Send success message
            return interaction.reply({
                embeds: [EmbedUtil.success('Connected!', `Successfully joined ${voiceChannel.name}!`)]
            });
        } catch (error) {
            // Handle errors
            return interaction.reply({
                embeds: [EmbedUtil.error('Connection Error', `Failed to join the voice channel: ${error.message}`)],
                ephemeral: true
            });
        }
    }
}; 