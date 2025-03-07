const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Display available commands and information',
    options: [],
    
    execute: async (interaction, client) => {
        // Defer the reply to give us time to generate the help content
        await interaction.deferReply({ ephemeral: true });
        
        // Get all command categories
        const commandFolders = fs.readdirSync(path.join(process.cwd(), 'src', 'commands'));
        const categories = {};
        
        // Loop through command folders to gather commands by category
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(path.join(process.cwd(), 'src', 'commands', folder))
                .filter(file => file.endsWith('.js'));
            
            // Skip empty folders
            if (commandFiles.length === 0) continue;
            
            // Initialize the category
            categories[folder] = [];
            
            // Add commands to the category
            for (const file of commandFiles) {
                const command = require(`../${folder}/${file}`);
                categories[folder].push({
                    name: command.name,
                    description: command.description
                });
            }
        }
        
        // Create the main help embed
        const helpEmbed = EmbedUtil.base({
            title: 'Help Menu',
            description: `Welcome to the help menu! Select a category to view commands.\n\nThis bot has ${client.commands.size} commands in ${Object.keys(categories).length} categories.`,
            thumbnail: client.user.displayAvatarURL(),
            footer: `Requested by ${interaction.user.tag}`
        });
        
        // Create a select menu for categories
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('Select a category')
            .addOptions(
                Object.keys(categories).map((category) => ({
                    label: category.charAt(0).toUpperCase() + category.slice(1),
                    description: `View ${category} commands`,
                    value: category
                }))
            );
        
        // Create action row with the select menu
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);
        
        // Send the help menu
        const response = await interaction.editReply({
            embeds: [helpEmbed],
            components: [actionRow]
        });
        
        // Create collector for select menu interactions
        const collector = response.createMessageComponentCollector({
            time: 60000 // 1 minute
        });
        
        // Handle select menu interactions
        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'This menu is not for you!',
                    ephemeral: true
                });
            }
            
            // Get the selected category
            const selectedCategory = i.values[0];
            const categoryCommands = categories[selectedCategory];
            
            // Create embed for the category
            const categoryEmbed = EmbedUtil.base({
                title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`,
                description: `Here are the commands in the ${selectedCategory} category:`,
                footer: `Requested by ${interaction.user.tag}`
            });
            
            // Add command fields
            categoryCommands.forEach((cmd) => {
                categoryEmbed.addFields({
                    name: `/${cmd.name}`,
                    value: cmd.description || 'No description provided'
                });
            });
            
            // Update the message
            await i.update({
                embeds: [categoryEmbed],
                components: [actionRow]
            });
        });
        
        // Handle collector end
        collector.on('end', () => {
            // Remove components when collector expires
            interaction.editReply({
                components: []
            }).catch(() => {});
        });
    }
}; 