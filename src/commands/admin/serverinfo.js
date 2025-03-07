const { PermissionFlagsBits } = require('discord.js');
const EmbedUtil = require('../../utils/embed');

module.exports = {
    name: 'serverinfo',
    description: 'Display information about the server',
    options: [],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    
    execute: async (interaction, client) => {
        const { guild } = interaction;
        
        // Verify context
        if (!guild) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Command Failed', 'This command can only be used in a server.')],
                ephemeral: true
            });
        }
        
        // Fetch additional guild information
        await guild.fetch();
        
        // Gather guild information
        const createdAt = guild.createdAt.toLocaleDateString();
        const memberCount = guild.memberCount;
        const boostCount = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;
        const verificationLevel = guild.verificationLevel;
        const roles = guild.roles.cache.size;
        const channels = guild.channels.cache.size;
        const emojis = guild.emojis.cache.size;
        
        // Create embed
        const serverEmbed = EmbedUtil.base({
            title: `${guild.name}`,
            description: `Information about this server`,
            thumbnail: guild.iconURL({ dynamic: true }),
            fields: [
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Created On', value: createdAt, inline: true },
                { name: 'Members', value: memberCount.toString(), inline: true },
                { name: 'Roles', value: roles.toString(), inline: true },
                { name: 'Channels', value: channels.toString(), inline: true },
                { name: 'Emojis', value: emojis.toString(), inline: true },
                { name: 'Boost Level', value: `Level ${boostLevel} (${boostCount} boosts)`, inline: true },
                { name: 'Verification', value: verificationLevel.toString(), inline: true },
            ],
            footer: `Requested by ${interaction.user.tag}`
        });
        
        // Reply with server information
        await interaction.reply({ embeds: [serverEmbed] });
    }
}; 