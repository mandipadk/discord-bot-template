const { InteractionType, PermissionFlagsBits } = require('discord.js');
const permissionManager = require('../utils/permissions');
const cooldownManager = require('../utils/cooldown');
const EmbedUtil = require('../utils/embed');
const logger = require('../utils/logger');
const config = require('../config');
const { services } = require('../database');

/**
 * Handle slash command interactions
 * @param {Interaction} interaction - Discord interaction object
 * @param {Client} client - Discord client
 */
async function handleCommand(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    
    // Get command from collection
    const command = client.commands.get(commandName);
    if (!command) {
        logger.warn(`Command not found: ${commandName}`);
        return interaction.reply({
            embeds: [EmbedUtil.error('Command Not Found', 'This command does not exist or has been disabled.')],
            ephemeral: true
        });
    }
    
    try {
        // Check if command is disabled globally
        if (config.commands.disabledCommands.includes(commandName)) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Command Disabled', 'This command is currently disabled.')],
                ephemeral: true
            });
        }
        
        // Check if command is disabled in this guild (check database)
        if (interaction.guild) {
            const guildSettingsService = services.guildSettings;
            const settings = await guildSettingsService.getSettings(interaction.guild.id);
            
            if (settings.disabledCommands && settings.disabledCommands.includes(commandName)) {
                return interaction.reply({
                    embeds: [EmbedUtil.error('Command Disabled', 'This command is disabled in this server.')],
                    ephemeral: true
                });
            }
        }
        
        // Check required Discord permissions if specified in command
        if (command.defaultMemberPermissions && interaction.guild) {
            const requiredPermissions = command.defaultMemberPermissions;
            const hasPermission = interaction.member.permissions.has(requiredPermissions);
            
            if (!hasPermission) {
                return interaction.reply({
                    embeds: [EmbedUtil.error('Missing Permissions', 'You do not have the required permissions to use this command.')],
                    ephemeral: true
                });
            }
        }
        
        // Check custom permission levels
        if (interaction.guild) {
            const requiredLevel = config.permissions[commandName] ?? 0;
            if (requiredLevel > 0) {
                const hasLevel = await permissionManager.hasPermissionLevel(
                    interaction.member,
                    requiredLevel,
                    client
                );
                
                if (!hasLevel) {
                    return interaction.reply({
                        embeds: [EmbedUtil.error('Insufficient Permissions', 'You do not have the required permission level to use this command.')],
                        ephemeral: true
                    });
                }
            }
        }
        
        // Check for global cooldown
        if (config.commands.globalCooldown > 0) {
            const globalCooldown = cooldownManager.checkCooldown(
                commandName,
                'global',
                'global'
            );
            
            if (globalCooldown) {
                return interaction.reply({
                    embeds: [EmbedUtil.warning(
                        'Command Cooldown',
                        `This command is on global cooldown. Please try again in ${globalCooldown.toFixed(1)} seconds.`
                    )],
                    ephemeral: true
                });
            }
            
            cooldownManager.setCooldown(
                commandName,
                'global',
                config.commands.globalCooldown,
                'global'
            );
        }
        
        // Check for user cooldown
        const userCooldown = command.cooldown ?? config.commands.defaultCooldown;
        if (userCooldown > 0) {
            const remainingCooldown = cooldownManager.checkCooldown(
                commandName,
                interaction.user.id,
                'user'
            );
            
            if (remainingCooldown) {
                return interaction.reply({
                    embeds: [EmbedUtil.warning(
                        'Command Cooldown',
                        `You can use this command again in ${remainingCooldown.toFixed(1)} seconds.`
                    )],
                    ephemeral: true
                });
            }
            
            cooldownManager.setCooldown(
                commandName,
                interaction.user.id,
                userCooldown,
                'user'
            );
        }
        
        // Check for channel cooldown if in a guild
        if (interaction.guild) {
            const channelCooldown = config.commands.channelCooldowns[interaction.channel.id];
            if (channelCooldown) {
                const remainingCooldown = cooldownManager.checkCooldown(
                    commandName,
                    interaction.channel.id,
                    'channel'
                );
                
                if (remainingCooldown) {
                    return interaction.reply({
                        embeds: [EmbedUtil.warning(
                            'Channel Cooldown',
                            `This command is on cooldown in this channel for ${remainingCooldown.toFixed(1)} more seconds.`
                        )],
                        ephemeral: true
                    });
                }
                
                cooldownManager.setCooldown(
                    commandName,
                    interaction.channel.id,
                    channelCooldown,
                    'channel'
                );
            }
        }
        
        // Check for role cooldowns if in a guild
        if (interaction.guild && interaction.member.roles) {
            for (const role of interaction.member.roles.cache.values()) {
                const roleCooldown = config.commands.roleCooldowns[role.id];
                if (roleCooldown) {
                    const remainingCooldown = cooldownManager.checkCooldown(
                        commandName,
                        role.id,
                        'role'
                    );
                    
                    if (remainingCooldown) {
                        return interaction.reply({
                            embeds: [EmbedUtil.warning(
                                'Role Cooldown',
                                `Members with the ${role.name} role must wait ${remainingCooldown.toFixed(1)} more seconds before using this command.`
                            )],
                            ephemeral: true
                        });
                    }
                    
                    cooldownManager.setCooldown(
                        commandName,
                        role.id,
                        roleCooldown,
                        'role'
                    );
                }
            }
        }
        
        // Execute the command
        await command.execute(interaction, client);
        
    } catch (error) {
        logger.error(`Command execution error: ${error.message}`, { command: commandName, error });
        
        // Reply to the user with error message
        const errorMessage = {
            embeds: [EmbedUtil.error(
                'Command Error',
                'An error occurred while executing this command. The error has been logged.'
            )],
            ephemeral: true
        };
        
        // Check if the interaction has already been replied to
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(errorMessage).catch(err => {
                logger.error(`Failed to edit reply with error message: ${err.message}`);
            });
        } else {
            await interaction.reply(errorMessage).catch(err => {
                logger.error(`Failed to reply with error message: ${err.message}`);
            });
        }
    }
}

module.exports = { handleCommand }; 