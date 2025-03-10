const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Manages localization and translations for the bot
 */
class LocalizationManager {
    constructor() {
        this.languages = {}; // Holds all loaded language translations
        this.defaultLanguage = 'en-US'; // Default fallback language
        this.cache = new Map(); // Cache for guild language settings
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Initialize the localization system
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Load all language files
            const localesPath = path.join(__dirname, '../locales');
            const files = fs.readdirSync(localesPath).filter(file => file.endsWith('.json'));
            
            for (const file of files) {
                const language = file.split('.')[0];
                const filePath = path.join(localesPath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                this.languages[language] = JSON.parse(content);
                logger.info(`Loaded language: ${language}`);
            }
            
            // Check if default language exists
            if (!this.languages[this.defaultLanguage]) {
                logger.warn(`Default language ${this.defaultLanguage} not found. Using first available language.`);
                this.defaultLanguage = Object.keys(this.languages)[0] || 'en-US';
            }
            
            logger.info(`Localization system initialized with ${Object.keys(this.languages).length} languages`);
            logger.info(`Default language set to: ${this.defaultLanguage}`);
            
        } catch (error) {
            logger.error(`Error initializing localization: ${error.message}`);
            // Create fallback language object
            this.languages[this.defaultLanguage] = {};
        }
    }
    
    /**
     * Get the language setting for a guild
     * @param {string} guildId - Discord guild ID
     * @returns {Promise<string>} - Language code
     */
    async getGuildLanguage(guildId) {
        // Check cache first
        const cached = this.cache.get(guildId);
        if (cached && cached.expires > Date.now()) {
            return cached.language;
        }
        
        try {
            // Make sure database module is loaded before accessing
            const { services } = require('../database');
            
            // Get from database - use correct service name
            if (!services.guildSettings) {
                logger.warn('Guild settings service not available, using default language');
                return this.defaultLanguage;
            }
            
            const settings = await services.guildSettings.getSettings(guildId);
            const language = settings.language || this.defaultLanguage;
            
            // Validate language exists
            if (!this.languages[language]) {
                logger.warn(`Language ${language} not found for guild ${guildId}. Using default.`);
                return this.defaultLanguage;
            }
            
            // Update cache
            this.cache.set(guildId, {
                language,
                expires: Date.now() + this.cacheExpiry
            });
            
            return language;
        } catch (error) {
            logger.error(`Error getting guild language: ${error.message}`);
            return this.defaultLanguage;
        }
    }
    
    /**
     * Set the language for a guild
     * @param {string} guildId - Discord guild ID
     * @param {string} language - Language code
     * @returns {Promise<boolean>} - Success status
     */
    async setGuildLanguage(guildId, language) {
        // Validate language exists
        if (!this.languages[language]) {
            logger.warn(`Attempted to set invalid language ${language} for guild ${guildId}`);
            return false;
        }
        
        try {
            // Make sure database module is loaded before accessing
            const { services } = require('../database');
            
            // Update in database - use correct service name
            if (!services.guildSettings) {
                logger.warn('Guild settings service not available, cannot set language');
                return false;
            }
            
            await services.guildSettings.updateSettings(guildId, { language });
            
            // Update cache
            this.cache.set(guildId, {
                language,
                expires: Date.now() + this.cacheExpiry
            });
            
            logger.info(`Set language for guild ${guildId} to ${language}`);
            return true;
        } catch (error) {
            logger.error(`Error setting guild language: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Get supported languages list
     * @returns {Object[]} Array of language objects
     */
    getSupportedLanguages() {
        return Object.keys(this.languages).map(code => {
            const langInfo = this.languages[code]._langInfo || {};
            return {
                code,
                name: langInfo.name || code,
                nativeName: langInfo.nativeName || code,
                flag: langInfo.flag || '🌐',
                isDefault: code === this.defaultLanguage
            };
        });
    }
    
    /**
     * Get a localized string
     * @param {string} key - Translation key in dot notation (e.g. 'commands.ping.response')
     * @param {string} language - Language code
     * @param {Object} vars - Variables to replace in the string
     * @returns {string} - Translated string
     */
    translate(key, language, vars = {}) {
        // Get language pack
        const langPack = this.languages[language] || this.languages[this.defaultLanguage] || {};
        
        // Find the string using the key path
        const keyParts = key.split('.');
        let value = langPack;
        
        for (const part of keyParts) {
            value = value?.[part];
            if (value === undefined) break;
        }
        
        // If not found in the specified language, try default language
        if (value === undefined && language !== this.defaultLanguage) {
            let defaultValue = this.languages[this.defaultLanguage];
            for (const part of keyParts) {
                defaultValue = defaultValue?.[part];
                if (defaultValue === undefined) break;
            }
            value = defaultValue;
        }
        
        // Use key as fallback
        if (value === undefined) {
            logger.debug(`Translation missing for key: ${key} in ${language}`);
            return key;
        }
        
        // If not a string (e.g. object or array), return as is
        if (typeof value !== 'string') {
            return value;
        }
        
        // Replace variables in the string {var} -> value
        return value.replace(/\{([^}]+)\}/g, (match, varName) => {
            return vars[varName] !== undefined ? vars[varName] : match;
        });
    }
    
    /**
     * Translate a string for a specific guild
     * @param {string} key - Translation key
     * @param {string} guildId - Discord guild ID
     * @param {Object} vars - Variables to replace
     * @returns {Promise<string>} - Translated string
     */
    async translateGuild(key, guildId, vars = {}) {
        const language = await this.getGuildLanguage(guildId);
        return this.translate(key, language, vars);
    }
    
    /**
     * Clear the language cache for a guild
     * @param {string} guildId - Discord guild ID
     */
    clearCache(guildId) {
        this.cache.delete(guildId);
    }
    
    /**
     * Clear the entire language cache
     */
    clearAllCache() {
        this.cache.clear();
    }
}

// Create a singleton instance
const localizationManager = new LocalizationManager();

module.exports = localizationManager; 