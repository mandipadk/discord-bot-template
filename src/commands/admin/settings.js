const { PermissionFlagsBits } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const guildSettingsService = require('../../database/services/guildSettingsService');

module.exports = {
    name: 'settings',
    description: 'Manage server settings',
    options: [
        {
            name: 'view',
            description: 'View current server settings',
            type: 1 // SUB_COMMAND type
        },
        {
            name: 'welcome',
            description: 'Set welcome message settings',
            type: 1, // SUB_COMMAND type
            options: [
                {
                    name: 'channel',
                    description: 'Channel to send welcome messages to',
                    type: 7, // CHANNEL type
                    required: true
                },
                {
                    name: 'message',
                    description: 'Welcome message (use {user} for username and {server} for server name)',
                    type: 3, // STRING type
                    required: true
                }
            ]
        },
        {
            name: 'prefix',
            description: 'Set custom command prefix for this server',
            type: 1, // SUB_COMMAND type
            options: [
                {
                    name: 'value',
                    description: 'New prefix to use',
                    type: 3, // STRING type
                    required: true
                }
            ]
        },
        {
            name: 'reset',
            description: 'Reset server settings to default',
            type: 1 // SUB_COMMAND type
        }
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    
    execute: async (interaction, client) => {
        // Get subcommand
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        
        try {
            // Handle different subcommands
            switch (subcommand) {
                case 'view': {
                    await handleViewSettings(interaction, guildId);
                    break;
                }
                
                case 'welcome': {
                    const channel = interaction.options.getChannel('channel');
                    const message = interaction.options.getString('message');
                    
                    // Verify channel is a text channel
                    if (channel.type !== 0) { // 0 is GUILD_TEXT
                        return interaction.reply({
                            embeds: [EmbedUtil.error('Invalid Channel', 'Welcome channel must be a text channel.')],
                            ephemeral: true
                        });
                    }
                    
                    // Update settings
                    await guildSettingsService.updateSettings(guildId, {
                        welcomeChannel: channel.id,
                        welcomeMessage: message
                    });
                    
                    // Send confirmation
                    return interaction.reply({
                        embeds: [EmbedUtil.success(
                            'Settings Updated',
                            `Welcome messages will now be sent to ${channel} with the message:\n${message}`
                        )]
                    });
                }
                
                case 'prefix': {
                    const prefix = interaction.options.getString('value');
                    
                    // Validate prefix length
                    if (prefix.length > 3) {
                        return interaction.reply({
                            embeds: [EmbedUtil.error('Invalid Prefix', 'Prefix must be 3 characters or less.')],
                            ephemeral: true
                        });
                    }
                    
                    // Update settings
                    await guildSettingsService.updateSettings(guildId, { prefix });
                    
                    // Send confirmation
                    return interaction.reply({
                        embeds: [EmbedUtil.success('Settings Updated', `Server prefix has been set to \`${prefix}\`.`)]
                    });
                }
                
                case 'reset': {
                    // Delete existing settings to reset to defaults
                    await guildSettingsService.deleteSettings(guildId);
                    
                    // Send confirmation
                    return interaction.reply({
                        embeds: [EmbedUtil.success('Settings Reset', 'Server settings have been reset to default values.')]
                    });
                }
            }
        } catch (error) {
            // Handle errors
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', `Could not update settings: ${error.message}`)],
                ephemeral: true
            });
        }
    }
};

// Function to handle viewing settings
async function handleViewSettings(interaction, guildId) {
    // Get settings
    const settings = await guildSettingsService.getSettings(guildId);
    
    // Get channel name for welcome channel
    let welcomeChannelName = 'Not set';
    if (settings.welcomeChannel) {
        const channel = interaction.guild.channels.cache.get(settings.welcomeChannel);
        welcomeChannelName = channel ? `#${channel.name}` : 'Unknown channel';
    }
    
    // Create settings embed
    const settingsEmbed = EmbedUtil.base({
        title: `${interaction.guild.name} Settings`,
        thumbnail: interaction.guild.iconURL({ dynamic: true }),
        fields: [
            { name: 'Prefix', value: settings.prefix || 'Default', inline: true },
            { name: 'Language', value: settings.language, inline: true },
            { name: 'Welcome Channel', value: welcomeChannelName, inline: true },
            { name: 'Welcome Message', value: settings.welcomeMessage || 'Default', inline: false },
            { name: 'Custom Commands', value: settings.customCommands.size > 0 
                ? `${settings.customCommands.size} commands defined` 
                : 'None', inline: true },
            { name: 'Disabled Commands', value: settings.disabledCommands.length > 0 
                ? settings.disabledCommands.join(', ') 
                : 'None', inline: true }
        ]
    });
    
    // Send settings
    return interaction.reply({ embeds: [settingsEmbed] });
} 