const { handleCommand } = require('../functions/commandHandler');
const logger = require('../utils/logger');
const EmbedUtil = require('../utils/embed');

module.exports = {
    name: 'interactionCreate',
    once: false,
    
    execute: async (interaction, client) => {
        try {
            // Handle different interaction types
            if (interaction.isChatInputCommand()) {
                await handleCommand(interaction, client);
            }
            // Add handlers for other interaction types as needed
            
        } catch (error) {
            logger.error(`Error handling interaction: ${error.message}`, { error });
            
            // Try to respond to the interaction if possible
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'There was an error while processing this interaction!',
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                logger.error(`Error replying to interaction: ${replyError.message}`);
            }
        }
    }
}; 