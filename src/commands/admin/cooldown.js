const { PermissionFlagsBits } = require('discord.js');
const cooldownManager = require('../../utils/cooldown');
const EmbedUtil = require('../../utils/embed');

module.exports = {
    name: 'cooldown',
    description: 'Manage command cooldowns',
    options: [
        {
            name: 'clear',
            description: 'Clear cooldowns',
            type: 1, // SUB_COMMAND
            options: [
                {
                    name: 'target',
                    description: 'What to clear cooldowns for',
                    type: 3, // STRING
                    required: true,
                    choices: [
                        { name: 'Command', value: 'command' },
                        { name: 'User', value: 'user' }
                    ]
                },
                {
                    name: 'command',
                    description: 'The command to clear cooldowns for',
                    type: 3, // STRING
                    required: false
                },
                {
                    name: 'user',
                    description: 'The user to clear cooldowns for',
                    type: 6, // USER
                    required: false
                }
            ]
        }
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    
    execute: async (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        
        switch (subcommand) {
            case 'clear': {
                const target = interaction.options.getString('target');
                
                if (target === 'command') {
                    const commandName = interaction.options.getString('command');
                    if (!commandName) {
                        return interaction.reply({
                            embeds: [EmbedUtil.error('Missing Parameter', 'You must provide a command name to clear cooldowns for.')],
                            ephemeral: true
                        });
                    }
                    
                    // Check if command exists
                    if (!client.commands.has(commandName)) {
                        return interaction.reply({
                            embeds: [EmbedUtil.error('Invalid Command', 'The specified command does not exist.')],
                            ephemeral: true
                        });
                    }
                    
                    // Clear command cooldowns
                    cooldownManager.clearCommandCooldowns(commandName);
                    
                    return interaction.reply({
                        embeds: [EmbedUtil.success(
                            'Cooldowns Cleared',
                            `All cooldowns for the command \`${commandName}\` have been cleared.`
                        )]
                    });
                    
                } else if (target === 'user') {
                    const user = interaction.options.getUser('user');
                    if (!user) {
                        return interaction.reply({
                            embeds: [EmbedUtil.error('Missing Parameter', 'You must provide a user to clear cooldowns for.')],
                            ephemeral: true
                        });
                    }
                    
                    // Clear user cooldowns
                    cooldownManager.clearUserCooldowns(user.id);
                    
                    return interaction.reply({
                        embeds: [EmbedUtil.success(
                            'Cooldowns Cleared',
                            `All cooldowns for ${user.username} have been cleared.`
                        )]
                    });
                }
                
                break;
            }
        }
    }
}; 