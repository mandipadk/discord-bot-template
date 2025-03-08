const { OpenAI } = require('openai');
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * Service for interacting with OpenAI's API
 */
class OpenAIService {
    constructor() {
        // Check if API key is configured
        if (!config.api.openai.apiKey) {
            logger.warn('OpenAI API key not configured. OpenAI service will not work.');
            this.isConfigured = false;
            return;
        }
        
        this.openai = new OpenAI({
            apiKey: config.api.openai.apiKey,
        });
        
        this.defaultModel = config.api.openai.model;
        this.maxTokens = config.api.openai.maxTokens;
        this.temperature = config.api.openai.temperature;
        this.isConfigured = true;
        
        logger.info('OpenAI service initialized');
    }
    
    /**
     * Check if OpenAI service is configured properly
     * @returns {boolean} Whether service is configured
     */
    isReady() {
        return this.isConfigured;
    }
    
    /**
     * Generate a text completion using OpenAI's API
     * @param {string} prompt - The prompt to send to OpenAI
     * @param {Object} options - Optional parameters
     * @param {string} options.model - The model to use
     * @param {number} options.maxTokens - Maximum tokens to generate
     * @param {number} options.temperature - Temperature for response randomness
     * @returns {Promise<string>} Generated text
     */
    async generateText(prompt, options = {}) {
        if (!this.isConfigured) {
            throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in your .env file.');
        }
        
        try {
            const response = await this.openai.chat.completions.create({
                model: options.model || this.defaultModel,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options.maxTokens || this.maxTokens,
                temperature: options.temperature || this.temperature,
            });
            
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            } else {
                throw new Error('OpenAI returned an empty response');
            }
        } catch (error) {
            logger.error(`OpenAI API Error: ${error.message}`);
            if (error.response) {
                logger.error(`OpenAI API Error details:`, error.response.data);
            }
            throw error;
        }
    }
    
    /**
     * Generate a moderation assessment using OpenAI's API
     * @param {string} text - The text to moderate
     * @returns {Promise<Object>} Moderation results
     */
    async moderateText(text) {
        if (!this.isConfigured) {
            throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in your .env file.');
        }
        
        try {
            const response = await this.openai.moderations.create({
                input: text,
            });
            
            return response.results[0];
        } catch (error) {
            logger.error(`OpenAI Moderation API Error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new OpenAIService(); 