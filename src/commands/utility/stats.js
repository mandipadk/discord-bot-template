const { SlashCommandBuilder } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const ShardUtil = require('../../utils/shardUtil');
const os = require('os');

module.exports = {
    name: 'stats',
    description: 'Display bot statistics and system information',
    options: [],
    
    execute: async (interaction, client) => {
        await interaction.deferReply();
        
        // Get guild and user counts
        const guildCount = await ShardUtil.getTotalGuildCount(client);
        const userCount = await ShardUtil.getTotalUserCount(client);
        
        // Calculate uptime
        const uptime = process.uptime();
        const uptimeDays = Math.floor(uptime / 86400);
        const uptimeHours = Math.floor((uptime % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);
        
        const uptimeString = 
            `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;
        
        // Get system info
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = Math.round(memoryUsage.rss / 1024 / 1024);
        const memoryTotalMB = Math.round(os.totalmem() / 1024 / 1024);
        const cpuCount = os.cpus().length;
        
        // Create shard info
        let shardInfo = 'No sharding enabled';
        if (client.shard) {
            shardInfo = `Shard ${client.shard.ids.join(', ')} of ${client.shard.count}`;
        }
        
        // Create embed
        const statsEmbed = EmbedUtil.base({
            title: '📊 Bot Statistics',
            thumbnail: client.user.displayAvatarURL(),
            fields: [
                { name: '🤖 Bot Info', value: `Serving ${guildCount} servers and ${userCount} users` },
                { name: '⏱️ Uptime', value: uptimeString },
                { name: '🔄 Sharding', value: shardInfo },
                { name: '📝 Memory Usage', value: `${memoryUsedMB}MB / ${memoryTotalMB}MB` },
                { name: '💻 System', value: `Node.js ${process.version}\nDiscord.js v${require('discord.js').version}\nCPUs: ${cpuCount}` }
            ]
        });
        
        await interaction.editReply({ embeds: [statsEmbed] });
    }
}; 