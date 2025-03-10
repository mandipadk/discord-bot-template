const { EmbedBuilder, Colors } = require('discord.js');
const config = require('../config');
const localizationManager = require('./localizationManager');

// Convert hex colors to integers if they're strings
const processColor = (color) => {
    if (typeof color === 'string' && color.startsWith('#')) {
        return parseInt(color.slice(1), 16);
    }
    return color;
};

/**
 * Creates consistent embed messages throughout the bot
 */
class EmbedUtil {
    /**
     * Create a base embed with consistent styling
     * @param {Object} options - Embed options
     * @returns {EmbedBuilder} Styled embed
     */
    static base(options = {}) {
        return new EmbedBuilder({
            color: processColor(options.color || config.colors.primary),
            title: options.title,
            description: options.description,
            fields: options.fields || [],
            footer: options.footer ? {
                text: typeof options.footer === 'string' ? options.footer : options.footer.text,
                iconURL: options.footer?.iconURL
            } : null,
            timestamp: options.timestamp ? new Date() : null,
            thumbnail: options.thumbnail ? { url: options.thumbnail } : null,
            image: options.image ? { url: options.image } : null,
            author: options.author ? {
                name: options.author.name,
                iconURL: options.author.icon,
                url: options.author.url
            } : null,
            url: options.url
        });
    }
    
    /**
     * Create an error embed
     * @param {string} title - Error title
     * @param {string} description - Error description
     * @param {Object} options - Additional embed options
     * @returns {EmbedBuilder} Error embed
     */
    static error(title, description, options = {}) {
        return this.base({
            color: processColor(config.colors.error),
            title: title,
            description: description,
            ...options
        });
    }
    
    /**
     * Create a success embed
     * @param {string} title - Success title
     * @param {string} description - Success description
     * @param {Object} options - Additional embed options
     * @returns {EmbedBuilder} Success embed
     */
    static success(title, description, options = {}) {
        return this.base({
            color: processColor(config.colors.success),
            title: title,
            description: description,
            ...options
        });
    }
    
    /**
     * Create a warning embed
     * @param {string} title - Warning title
     * @param {string} description - Warning description
     * @param {Object} options - Additional embed options
     * @returns {EmbedBuilder} Warning embed
     */
    static warning(title, description, options = {}) {
        return this.base({
            color: processColor(config.colors.warning),
            title: title,
            description: description,
            ...options
        });
    }
    
    /**
     * Create an info embed
     * @param {string} title - Info title
     * @param {string} description - Info description
     * @param {Object} options - Additional embed options
     * @returns {EmbedBuilder} Info embed
     */
    static info(title, description, options = {}) {
        return this.base({
            color: processColor(config.colors.info),
            title: title,
            description: description,
            ...options
        });
    }
    
    /**
     * Create a localized embed for a specific guild
     * @param {string} guildId - Discord guild ID
     * @param {string} titleKey - Translation key for title
     * @param {string} descriptionKey - Translation key for description
     * @param {Object} titleVars - Variables for title translation
     * @param {Object} descriptionVars - Variables for description translation
     * @param {Object} options - Additional embed options
     * @returns {Promise<EmbedBuilder>} Localized embed
     */
    static async localizedEmbed(guildId, titleKey, descriptionKey, titleVars = {}, descriptionVars = {}, options = {}) {
        const title = await localizationManager.translateGuild(titleKey, guildId, titleVars);
        const description = await localizationManager.translateGuild(descriptionKey, guildId, descriptionVars);
        
        return this.base({
            title,
            description,
            ...options
        });
    }
    
    /**
     * Create a localized error embed
     * @param {string} guildId - Discord guild ID
     * @param {string} titleKey - Translation key for title
     * @param {string} descriptionKey - Translation key for description
     * @param {Object} titleVars - Variables for title translation
     * @param {Object} descriptionVars - Variables for description translation
     * @param {Object} options - Additional embed options
     * @returns {Promise<EmbedBuilder>} Localized error embed
     */
    static async localizedError(guildId, titleKey, descriptionKey, titleVars = {}, descriptionVars = {}, options = {}) {
        const embed = await this.localizedEmbed(guildId, titleKey, descriptionKey, titleVars, descriptionVars, options);
        embed.setColor(processColor(config.colors.error));
        return embed;
    }
    
    /**
     * Create a localized success embed
     * @param {string} guildId - Discord guild ID
     * @param {string} titleKey - Translation key for title
     * @param {string} descriptionKey - Translation key for description
     * @param {Object} titleVars - Variables for title translation
     * @param {Object} descriptionVars - Variables for description translation
     * @param {Object} options - Additional embed options
     * @returns {Promise<EmbedBuilder>} Localized success embed
     */
    static async localizedSuccess(guildId, titleKey, descriptionKey, titleVars = {}, descriptionVars = {}, options = {}) {
        const embed = await this.localizedEmbed(guildId, titleKey, descriptionKey, titleVars, descriptionVars, options);
        embed.setColor(processColor(config.colors.success));
        return embed;
    }
}

module.exports = EmbedUtil; 