const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Utility class for creating Discord embeds with consistent styling
 */
class EmbedUtil {
    /**
     * Create a base embed with default settings
     * @param {Object} options - Options for the embed
     * @returns {EmbedBuilder} - The created embed
     */
    static base(options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || config.colors.primary)
            .setTimestamp();
        
        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.footer) embed.setFooter({ text: options.footer });
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.url) embed.setURL(options.url);
        if (options.author) {
            embed.setAuthor({
                name: options.author.name,
                iconURL: options.author.icon || null,
                url: options.author.url || null
            });
        }
        if (options.fields) {
            embed.addFields(options.fields);
        }
        
        return embed;
    }
    
    /**
     * Create a success embed
     * @param {string} title - Title for the embed
     * @param {string} description - Description for the embed
     * @returns {EmbedBuilder} - The created embed
     */
    static success(title, description) {
        return this.base({
            title: `${config.emojis.success} ${title}`,
            description,
            color: config.colors.success
        });
    }
    
    /**
     * Create an error embed
     * @param {string} title - Title for the embed
     * @param {string} description - Description for the embed
     * @returns {EmbedBuilder} - The created embed
     */
    static error(title, description) {
        return this.base({
            title: `${config.emojis.error} ${title}`,
            description,
            color: config.colors.error
        });
    }
    
    /**
     * Create a warning embed
     * @param {string} title - Title for the embed
     * @param {string} description - Description for the embed
     * @returns {EmbedBuilder} - The created embed
     */
    static warning(title, description) {
        return this.base({
            title: `${config.emojis.warning} ${title}`,
            description,
            color: config.colors.warning
        });
    }
    
    /**
     * Create an info embed
     * @param {string} title - Title for the embed
     * @param {string} description - Description for the embed
     * @returns {EmbedBuilder} - The created embed
     */
    static info(title, description) {
        return this.base({
            title: `${config.emojis.info} ${title}`,
            description,
            color: config.colors.info
        });
    }
}

module.exports = EmbedUtil; 