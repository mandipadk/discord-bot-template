const { PermissionFlagsBits } = require('discord.js');
const permissionManager = require('../../utils/permissions');
const EmbedUtil = require('../../utils/embed');

module.exports = {
    name: 'permissions',
    description: 'Manage or view permission levels for users',
    options: [
        {
            name: 'view',
            description: 'View permission level for a user',
            type: 1, // SUB_COMMAND
            options: [
                {
                    name: 'user',
                    description: 'The user to check permissions for',
                    type: 6, // USER
                    required: true
                }
            ]
        },
        {
            name: 'refresh',
            description: 'Refresh permission cache for a user',
            type: 1, // SUB_COMMAND
            options: [
                {
                    name: 'user',
                    description: 'The user to refresh permissions for',
                    type: 6, // USER
                    required: true
                }
            ]
        }
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageRoles,
    
    execute: async (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        
        if (!targetMember) {
            return interaction.reply({
                embeds: [EmbedUtil.error('User Not Found', 'This user is not a member of this server.')],
                ephemeral: true
            });
        }
        
        switch (subcommand) {
            case 'view': {
                // Get permission level
                const permLevel = await permissionManager.getPermissionLevel(targetMember, client);
                
                // Convert level number to name
                let levelName = 'Unknown';
                for (const [name, level] of Object.entries(permissionManager.levels)) {
                    if (level === permLevel) {
                        levelName = name;
                        break;
                    }
                }
                
                // Get Discord permissions
                const permissions = [];
                if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
                    permissions.push('Administrator');
                } else {
                    if (targetMember.permissions.has(PermissionFlagsBits.ManageGuild)) permissions.push('Manage Server');
                    if (targetMember.permissions.has(PermissionFlagsBits.ManageRoles)) permissions.push('Manage Roles');
                    if (targetMember.permissions.has(PermissionFlagsBits.ManageChannels)) permissions.push('Manage Channels');
                    if (targetMember.permissions.has(PermissionFlagsBits.KickMembers)) permissions.push('Kick Members');
                    if (targetMember.permissions.has(PermissionFlagsBits.BanMembers)) permissions.push('Ban Members');
                    if (targetMember.permissions.has(PermissionFlagsBits.ModerateMembers)) permissions.push('Moderate Members');
                    if (targetMember.permissions.has(PermissionFlagsBits.ManageMessages)) permissions.push('Manage Messages');
                }
                
                // Create permission embed
                const permEmbed = EmbedUtil.base({
                    title: `Permissions for ${targetUser.username}`,
                    thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
                    fields: [
                        { name: 'Permission Level', value: `${levelName} (${permLevel})`, inline: true },
                        { name: 'Discord Permissions', value: permissions.length > 0 ? permissions.join(', ') : 'None', inline: false },
                        { name: 'Roles', value: targetMember.roles.cache.size > 1 
                            ? targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ')
                            : 'None'
                        }
                    ],
                    footer: `User ID: ${targetUser.id}`
                });
                
                return interaction.reply({ embeds: [permEmbed] });
            }
            
            case 'refresh': {
                // Refresh permission cache
                permissionManager.clearUserCache(interaction.guild.id, targetUser.id);
                
                return interaction.reply({
                    embeds: [EmbedUtil.success(
                        'Cache Refreshed',
                        `Permission cache for ${targetUser.username} has been refreshed.`
                    )]
                });
            }
        }
    }
}; 