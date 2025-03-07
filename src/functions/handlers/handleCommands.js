const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const config = require('../../config');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync(path.join(process.cwd(), 'src', 'commands'));
        
        // Loop through all category folders
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(path.join(process.cwd(), 'src', 'commands', folder))
                .filter(file => file.endsWith('.js'));
            
            // Register each command in the collection
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                
                if (command.name) {
                    client.commands.set(command.name, command);
                    client.commandArray.push(command);
                    logger.info(`Command registered: ${command.name}`);
                } else {
                    logger.warn(`Failed to register command in ${file}: Missing name`);
                }
            }
        }
        
        // Deploy slash commands if tokens are available
        if (config.bot.token && config.bot.clientId) {
            const rest = new REST({ version: '10' }).setToken(config.bot.token);
            
            try {
                logger.info('Started refreshing application (/) commands.');
                
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
                
                // Convert commands to the format Discord API expects
                const commandsData = client.commandArray.map(command => ({
                    name: command.name,
                    description: command.description,
                    options: command.options || [],
                    default_member_permissions: command.defaultMemberPermissions || null
                }));
                
                await rest.put(route, { body: commandsData });
                
                logger.info('Successfully reloaded application (/) commands.');
            } catch (error) {
                logger.error(`Error refreshing commands: ${error}`);
            }
        } else {
            logger.warn('Bot token or client ID not defined. Skipping slash command registration.');
        }
    };
}; 