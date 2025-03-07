const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    entersState,
    AudioPlayerStatus,
    VoiceConnectionStatus
} = require('@discordjs/voice');
const { Collection } = require('discord.js');
const logger = require('./logger');

/**
 * Utility class for managing voice connections and audio players
 */
class VoiceUtil {
    constructor() {
        this.connections = new Collection();
        this.players = new Collection();
    }
    
    /**
     * Join a voice channel
     * @param {Object} options - Options for joining
     * @param {VoiceChannel} options.channel - The voice channel to join
     * @param {Guild} options.guild - The guild of the voice channel
     * @param {boolean} options.selfDeaf - Whether the bot should be deafened
     * @param {boolean} options.selfMute - Whether the bot should be muted
     * @returns {Promise<VoiceConnection>} - The voice connection
     */
    async joinChannel({ channel, guild, selfDeaf = true, selfMute = false }) {
        if (!channel || !guild) {
            throw new Error('Missing channel or guild');
        }
        
        try {
            // Create the connection
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: selfDeaf,
                selfMute: selfMute
            });
            
            // Wait for the connection to be ready
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            
            // Store the connection
            this.connections.set(guild.id, connection);
            
            // Create a player for this connection
            const player = createAudioPlayer();
            this.players.set(guild.id, player);
            
            // Subscribe the connection to the player
            connection.subscribe(player);
            
            // Set up event listeners
            this.setupConnectionListeners(connection, guild.id);
            this.setupPlayerListeners(player, guild.id);
            
            logger.info(`Joined voice channel: ${channel.name} in ${guild.name}`);
            
            return connection;
        } catch (error) {
            logger.error(`Error joining voice channel: ${error}`);
            throw error;
        }
    }
    
    /**
     * Play audio from a resource
     * @param {string} guildId - The ID of the guild
     * @param {AudioResource|string} resource - The audio resource or path to audio file
     * @returns {Promise<void>}
     */
    async play(guildId, resource) {
        const player = this.players.get(guildId);
        
        if (!player) {
            throw new Error('No player found for this guild');
        }
        
        try {
            // Create resource if string
            if (typeof resource === 'string') {
                resource = createAudioResource(resource);
            }
            
            // Play the resource
            player.play(resource);
            
            // Wait for the player to start playing
            await entersState(player, AudioPlayerStatus.Playing, 5_000);
            
            logger.info(`Started playing in guild: ${guildId}`);
        } catch (error) {
            logger.error(`Error playing audio: ${error}`);
            throw error;
        }
    }
    
    /**
     * Stop playing audio
     * @param {string} guildId - The ID of the guild
     */
    stop(guildId) {
        const player = this.players.get(guildId);
        
        if (player) {
            player.stop();
            logger.info(`Stopped playing in guild: ${guildId}`);
        }
    }
    
    /**
     * Leave a voice channel
     * @param {string} guildId - The ID of the guild
     */
    leave(guildId) {
        const connection = this.connections.get(guildId);
        const player = this.players.get(guildId);
        
        if (player) {
            player.stop();
            this.players.delete(guildId);
        }
        
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
            logger.info(`Left voice channel in guild: ${guildId}`);
        }
    }
    
    /**
     * Set up event listeners for the voice connection
     * @param {VoiceConnection} connection - The voice connection
     * @param {string} guildId - The ID of the guild
     * @private
     */
    setupConnectionListeners(connection, guildId) {
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                // Try to reconnect if disconnected
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                ]);
            } catch (error) {
                // Destroy the connection if we can't reconnect
                this.leave(guildId);
            }
        });
        
        connection.on(VoiceConnectionStatus.Destroyed, () => {
            this.leave(guildId);
        });
        
        connection.on('error', (error) => {
            logger.error(`Voice connection error in guild ${guildId}: ${error}`);
        });
    }
    
    /**
     * Set up event listeners for the audio player
     * @param {AudioPlayer} player - The audio player
     * @param {string} guildId - The ID of the guild
     * @private
     */
    setupPlayerListeners(player, guildId) {
        player.on('error', (error) => {
            logger.error(`Audio player error in guild ${guildId}: ${error}`);
        });
        
        player.on(AudioPlayerStatus.Idle, () => {
            logger.info(`Player is idle in guild: ${guildId}`);
        });
    }
}

module.exports = new VoiceUtil(); 