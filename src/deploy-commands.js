require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

// Check for required environment variables
if (!config.bot.token || !config.bot.clientId) {
    logger.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Array to store commands
const commands = [];

// Function to recursively get command files
const getCommands = (dir) => {
    const commandFiles = fs.readdirSync(dir);
    
    for (const file of commandFiles) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            
            // Only add commands with all required properties
            if (command.name && command.description) {
                commands.push({
                    name: command.name,
                    description: command.description,
                    options: command.options || [],
                    default_member_permissions: command.defaultMemberPermissions || null
                });
                logger.info(`Added command: ${command.name}`);
            } else {
                logger.warn(`Skipped command in ${filePath}: Missing required properties`);
            }
        }
    }
};

// Get all commands
getCommands(path.join(__dirname, 'commands'));

// Create REST instance
const rest = new REST({ version: '10' }).setToken(config.bot.token);

// Deploy commands
(async () => {
    try {
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);
        
        // The route to use depends on whether we're in dev or prod mode
        let route;
        if (config.env.isDevelopment && config.bot.guildId) {
            // Deploy to specific guild in dev mode (faster updates)
            route = Routes.applicationGuildCommands(
                config.bot.clientId,
                config.bot.guildId
            );
            logger.info(`Deploying commands to guild: ${config.bot.guildId} (development mode)`);
        } else {
            // Deploy globally in production (can take up to an hour to update)
            route = Routes.applicationCommands(config.bot.clientId);
            logger.info('Deploying commands globally (production mode)');
        }
        
        // Deploy commands
        await rest.put(route, { body: commands });
        
        logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.error(`Error deploying commands: ${error}`);
    }
})(); 