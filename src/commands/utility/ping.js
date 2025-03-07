const EmbedUtil = require('../../utils/embed');

module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency and response time',
    options: [],
    
    execute: async (interaction, client) => {
        // Calculate bot latency
        const sent = await interaction.deferReply({ fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        // Create embed for ping information
        const pingEmbed = EmbedUtil.info('Pong!', 
            `🏓 **Bot Latency**: ${latency}ms\n` +
            `📡 **WebSocket Latency**: ${Math.round(client.ws.ping)}ms`
        );
        
        // Reply with ping information
        await interaction.editReply({ embeds: [pingEmbed] });
    }
}; 