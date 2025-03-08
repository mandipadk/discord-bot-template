const ApiClient = require('../apiClient');
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * Service for fetching weather data from OpenWeatherMap API
 */
class WeatherService {
    constructor() {
        // Check if API key is configured
        if (!config.api.weather.apiKey) {
            logger.warn('Weather API key not configured. Weather service will not work.');
            this.isConfigured = false;
            return;
        }
        
        this.apiClient = new ApiClient({
            baseURL: 'https://api.openweathermap.org/data/2.5',
            maxRequestsPerMinute: 60, // OpenWeatherMap free tier limit
        });
        
        this.apiKey = config.api.weather.apiKey;
        this.units = config.api.weather.units;
        this.isConfigured = true;
        
        logger.info('Weather service initialized');
    }
    
    /**
     * Check if Weather service is configured properly
     * @returns {boolean} Whether service is configured
     */
    isReady() {
        return this.isConfigured;
    }
    
    /**
     * Get current weather for a location
     * @param {string} location - Location name or coordinates
     * @param {string} units - Units ('metric', 'imperial', or 'standard')
     * @returns {Promise<Object>} Weather data
     */
    async getCurrentWeather(location, units = this.units) {
        if (!this.isConfigured) {
            throw new Error('Weather service is not configured. Please set WEATHER_API_KEY in your .env file.');
        }
        
        try {
            // Determine if location is coordinates or city name
            const isCoords = location.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
            
            const params = {
                appid: this.apiKey,
                units: units
            };
            
            if (isCoords) {
                const [_, lat, __, lon] = isCoords;
                params.lat = lat;
                params.lon = lon;
            } else {
                params.q = location;
            }
            
            const weatherData = await this.apiClient.get('/weather', { params });
            
            // Process data for easier consumption
            return {
                location: {
                    name: weatherData.name,
                    country: weatherData.sys.country,
                    coordinates: {
                        lat: weatherData.coord.lat,
                        lon: weatherData.coord.lon
                    }
                },
                current: {
                    temp: weatherData.main.temp,
                    feels_like: weatherData.main.feels_like,
                    temp_min: weatherData.main.temp_min,
                    temp_max: weatherData.main.temp_max,
                    humidity: weatherData.main.humidity,
                    pressure: weatherData.main.pressure,
                    description: weatherData.weather[0].description,
                    icon: weatherData.weather[0].icon,
                    windSpeed: weatherData.wind.speed,
                    windDirection: weatherData.wind.deg,
                    cloudiness: weatherData.clouds.all,
                    timestamp: weatherData.dt,
                    sunrise: weatherData.sys.sunrise,
                    sunset: weatherData.sys.sunset
                }
            };
        } catch (error) {
            logger.error(`Weather API Error: ${error.message}`);
            
            if (error.response && error.response.status === 404) {
                throw new Error(`Location "${location}" not found. Please check the spelling or try a different location.`);
            }
            
            throw error;
        }
    }
    
    /**
     * Get weather forecast for a location
     * @param {string} location - Location name or coordinates
     * @param {string} units - Units ('metric', 'imperial', or 'standard')
     * @returns {Promise<Object>} Forecast data
     */
    async getForecast(location, units = this.units) {
        if (!this.isConfigured) {
            throw new Error('Weather service is not configured. Please set WEATHER_API_KEY in your .env file.');
        }
        
        try {
            // Determine if location is coordinates or city name
            const isCoords = location.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
            
            const params = {
                appid: this.apiKey,
                units: units,
                cnt: 5 // Number of forecast periods to return
            };
            
            if (isCoords) {
                const [_, lat, __, lon] = isCoords;
                params.lat = lat;
                params.lon = lon;
            } else {
                params.q = location;
            }
            
            const forecastData = await this.apiClient.get('/forecast', { params });
            
            // Process forecast data
            return {
                location: {
                    name: forecastData.city.name,
                    country: forecastData.city.country,
                    coordinates: {
                        lat: forecastData.city.coord.lat,
                        lon: forecastData.city.coord.lon
                    }
                },
                forecast: forecastData.list.map(item => ({
                    timestamp: item.dt,
                    temp: item.main.temp,
                    feels_like: item.main.feels_like,
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    humidity: item.main.humidity,
                    pressure: item.main.pressure,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    windSpeed: item.wind.speed,
                    windDirection: item.wind.deg,
                    cloudiness: item.clouds.all
                }))
            };
        } catch (error) {
            logger.error(`Weather API Error: ${error.message}`);
            
            if (error.response && error.response.status === 404) {
                throw new Error(`Location "${location}" not found. Please check the spelling or try a different location.`);
            }
            
            throw error;
        }
    }
}

module.exports = new WeatherService(); 