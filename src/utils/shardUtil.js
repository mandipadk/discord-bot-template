const logger = require('./logger');

/**
 * Utility class for cross-shard operations
 */
class ShardUtil {
    /**
     * Fetch information across all shards
     * @param {Client} client - The Discord.js client
     * @param {Function} callback - Function to execute on each shard, must return data
     * @returns {Promise<Array>} - Array of results from all shards
     */
    static async fetchAcrossShards(client, callback) {
        // If sharding is not enabled, just run the callback
        if (!client.shard) {
            try {
                const result = await callback();
                return [result];
            } catch (error) {
                logger.error(`Error executing callback: ${error.message}`);
                throw error;
            }
        }

        try {
            // Execute the callback on all shards
            return await client.shard.fetchClientValues(
                `(async () => { 
                    try { 
                        return ${callback.toString()}(); 
                    } catch (e) { 
                        return null; 
                    } 
                })()`
            );
        } catch (error) {
            logger.error(`Error fetching across shards: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get the total number of guilds across all shards
     * @param {Client} client - The Discord.js client
     * @returns {Promise<number>} - Total guild count
     */
    static async getTotalGuildCount(client) {
        if (!client.shard) return client.guilds.cache.size;

        try {
            const guildCounts = await client.shard.fetchClientValues('guilds.cache.size');
            return guildCounts.reduce((acc, count) => acc + count, 0);
        } catch (error) {
            logger.error(`Error getting total guild count: ${error.message}`);
            return client.guilds.cache.size; // Fallback to local count
        }
    }

    /**
     * Get the total number of users across all shards
     * @param {Client} client - The Discord.js client
     * @returns {Promise<number>} - Total user count
     */
    static async getTotalUserCount(client) {
        if (!client.shard) return client.users.cache.size;

        try {
            const userCounts = await client.shard.fetchClientValues('users.cache.size');
            return userCounts.reduce((acc, count) => acc + count, 0);
        } catch (error) {
            logger.error(`Error getting total user count: ${error.message}`);
            return client.users.cache.size; // Fallback to local count
        }
    }

    /**
     * Broadcast an event to all shards
     * @param {Client} client - The Discord.js client
     * @param {string} event - Event name to broadcast
     * @param {...any} args - Arguments to pass with the event
     * @returns {Promise<void>}
     */
    static async broadcastEvent(client, event, ...args) {
        if (!client.shard) return;

        try {
            await client.shard.broadcastEval((c, { event, args }) => {
                c.emit(event, ...args);
            }, { context: { event, args }});
        } catch (error) {
            logger.error(`Error broadcasting event ${event}: ${error.message}`);
        }
    }
}

module.exports = ShardUtil; 