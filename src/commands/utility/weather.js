const { EmbedBuilder } = require('discord.js');
const weatherService = require('../../api/services/weatherService');
const EmbedUtil = require('../../utils/embed');
const config = require('../../config');

module.exports = {
    name: 'weather',
    description: 'Get weather information for a location',
    options: [
        {
            name: 'location',
            description: 'City name or coordinates',
            type: 3, // STRING type
            required: true
        },
        {
            name: 'units',
            description: 'Temperature units',
            type: 3, // STRING type
            required: false,
            choices: [
                { name: 'Metric (°C)', value: 'metric' },
                { name: 'Imperial (°F)', value: 'imperial' },
                { name: 'Standard (K)', value: 'standard' }
            ]
        }
    ],
    
    execute: async (interaction, client) => {
        await interaction.deferReply();
        
        // Check if the service is configured
        if (!weatherService.isReady()) {
            return interaction.editReply({
                embeds: [EmbedUtil.error(
                    'Service Unavailable',
                    'The weather service is not configured. Please contact the bot administrator.'
                )]
            });
        }
        
        // Get command parameters
        const location = interaction.options.getString('location');
        const units = interaction.options.getString('units') || config.api.weather.units;
        
        try {
            // Get weather data
            const weatherData = await weatherService.getCurrentWeather(location, units);
            
            // Format temperature based on units
            const unitSymbol = units === 'imperial' ? '°F' : units === 'metric' ? '°C' : 'K';
            
            // Get weather icon URL
            const iconUrl = `http://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`;
            
            // Create weather embed
            const weatherEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`Weather for ${weatherData.location.name}, ${weatherData.location.country}`)
                .setDescription(`**${weatherData.current.description}**`)
                .setThumbnail(iconUrl)
                .addFields(
                    { name: 'Temperature', value: `${Math.round(weatherData.current.temp)}${unitSymbol}`, inline: true },
                    { name: 'Feels Like', value: `${Math.round(weatherData.current.feels_like)}${unitSymbol}`, inline: true },
                    { name: 'Min/Max', value: `${Math.round(weatherData.current.temp_min)}${unitSymbol} / ${Math.round(weatherData.current.temp_max)}${unitSymbol}`, inline: true },
                    { name: 'Humidity', value: `${weatherData.current.humidity}%`, inline: true },
                    { name: 'Wind', value: `${weatherData.current.windSpeed} ${units === 'imperial' ? 'mph' : 'm/s'}`, inline: true },
                    { name: 'Cloudiness', value: `${weatherData.current.cloudiness}%`, inline: true }
                )
                .setFooter({ text: 'Data from OpenWeatherMap' })
                .setTimestamp(new Date(weatherData.current.timestamp * 1000));
            
            await interaction.editReply({ embeds: [weatherEmbed] });
            
        } catch (error) {
            await interaction.editReply({
                embeds: [EmbedUtil.error('Error', `Could not get weather data: ${error.message}`)]
            });
        }
    }
}; 