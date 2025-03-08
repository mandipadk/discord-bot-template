const axios = require('axios');
const Bottleneck = require('bottleneck');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Base API client with rate limiting and error handling
 */
class ApiClient {
    /**
     * Create a new API client
     * @param {Object} options - Configuration options
     * @param {string} options.baseURL - Base URL for API requests
     * @param {Object} options.headers - Default headers to include
     * @param {number} options.maxRequestsPerMinute - Maximum requests per minute
     * @param {number} options.maxConcurrent - Maximum concurrent requests
     * @param {number} options.minTime - Minimum time between requests in ms
     */
    constructor(options = {}) {
        // Create axios instance
        this.client = axios.create({
            baseURL: options.baseURL || '',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: options.timeout || 10000,
        });
        
        // Set up rate limiter
        this.limiter = new Bottleneck({
            maxConcurrent: options.maxConcurrent || config.api.rateLimiting.maxConcurrent,
            minTime: options.minTime || (60 * 1000) / (options.maxRequestsPerMinute || config.api.rateLimiting.maxRequestsPerMinute)
        });
        
        // Add request interceptor for logging
        this.client.interceptors.request.use(
            config => {
                logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, { 
                    params: config.params 
                });
                return config;
            },
            error => {
                logger.error(`API Request Error: ${error.message}`);
                return Promise.reject(error);
            }
        );
        
        // Add response interceptor for logging
        this.client.interceptors.response.use(
            response => {
                logger.debug(`API Response: ${response.status} from ${response.config.url}`);
                return response;
            },
            error => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    logger.error(`API Error: ${error.response.status} ${error.response.statusText}`, {
                        data: error.response.data,
                        url: error.response.config.url
                    });
                } else if (error.request) {
                    // The request was made but no response was received
                    logger.error(`API Error: No response received`, {
                        request: error.request,
                        url: error.config?.url
                    });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    logger.error(`API Error: ${error.message}`);
                }
                return Promise.reject(error);
            }
        );
    }
    
    /**
     * Make a rate-limited GET request
     * @param {string} url - URL to request
     * @param {Object} config - Axios request config
     * @returns {Promise<Object>} Response data
     */
    async get(url, config = {}) {
        return this.limiter.schedule(() => this.client.get(url, config))
            .then(response => response.data);
    }
    
    /**
     * Make a rate-limited POST request
     * @param {string} url - URL to request
     * @param {Object} data - Data to send
     * @param {Object} config - Axios request config
     * @returns {Promise<Object>} Response data
     */
    async post(url, data = {}, config = {}) {
        return this.limiter.schedule(() => this.client.post(url, data, config))
            .then(response => response.data);
    }
    
    /**
     * Make a rate-limited PUT request
     * @param {string} url - URL to request
     * @param {Object} data - Data to send
     * @param {Object} config - Axios request config
     * @returns {Promise<Object>} Response data
     */
    async put(url, data = {}, config = {}) {
        return this.limiter.schedule(() => this.client.put(url, data, config))
            .then(response => response.data);
    }
    
    /**
     * Make a rate-limited DELETE request
     * @param {string} url - URL to request
     * @param {Object} config - Axios request config
     * @returns {Promise<Object>} Response data
     */
    async delete(url, config = {}) {
        return this.limiter.schedule(() => this.client.delete(url, config))
            .then(response => response.data);
    }
}

module.exports = ApiClient; 