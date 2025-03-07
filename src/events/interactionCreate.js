const logger = require('../utils/logger');
const EmbedUtil = require('../utils/embed');

module.exports = {
    name: 'interactionCreate',
    once: false,
    
    execute: async (interaction, client) => {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            // Check if command exists
            if (!command) {
                logger.warn(`Command not found: ${interaction.commandName}`);
                return interaction.reply({
                    embeds: [EmbedUtil.error('Unknown Command', 'This command does not exist or is not properly registered.')],
                    ephemeral: true
                });
            }
            
            try {
                // Execute the command
                await command.execute(interaction, client);
                logger.info(`Command executed: ${interaction.commandName} by ${interaction.user.tag}`);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}: ${error}`);
                
                // Reply with an error message
                const errorReply = {
                    embeds: [EmbedUtil.error('Command Error', 'There was an error while executing this command.')],
                    ephemeral: true
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorReply);
                } else {
                    await interaction.reply(errorReply);
                }
            }
        } 
        // Handle button interactions
        else if (interaction.isButton()) {
            // Handle button interactions
            // (Example implementation)
            const [customId, ...args] = interaction.customId.split(':');
            
            // Add your button handling logic here
            // Example:
            // const button = client.buttons.get(customId);
            // if (button) await button.execute(interaction, args, client);
        }
        // Handle select menu interactions
        else if (interaction.isStringSelectMenu()) {
            // Handle select menu interactions
            // (Example implementation)
            const [customId, ...args] = interaction.customId.split(':');
            
            // Add your select menu handling logic here
            // Example:
            // const selectMenu = client.selectMenus.get(customId);
            // if (selectMenu) await selectMenu.execute(interaction, args, client);
        }
        // Handle modal submissions
        else if (interaction.isModalSubmit()) {
            // Handle modal submissions
            // (Example implementation)
            const [customId, ...args] = interaction.customId.split(':');
            
            // Add your modal handling logic here
            // Example:
            // const modal = client.modals.get(customId);
            // if (modal) await modal.execute(interaction, args, client);
        }
    }
}; 