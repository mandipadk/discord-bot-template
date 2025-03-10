const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const config = require('../../config');

// Helper function to process BigInt values
function processCommandsForRegistration(commands) {
    return commands.map(cmd => {
        // Create a copy we can safely modify
        const processedCmd = { ...cmd };
        
        // Convert BigInt permissions to strings
        if (processedCmd.defaultMemberPermissions !== undefined) {
            processedCmd.defaultMemberPermissions = processedCmd.defaultMemberPermissions.toString();
        }
        
        // Process options recursively if they exist
        if (processedCmd.options) {
            processedCmd.options = processCommandOptions(processedCmd.options);
        }
        
        return processedCmd;
    });
}

// Process command options recursively
function processCommandOptions(options) {
    return options.map(opt => {
        const processedOpt = { ...opt };
        
        // Process nested options (for subcommands)
        if (processedOpt.options) {
            processedOpt.options = processCommandOptions(processedOpt.options);
        }
        
        return processedOpt;
    });
}

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync(path.join(process.cwd(), 'src', 'commands'));
        const commandsArray = [];
        
        // First, try to initialize the localization manager if needed for language choices
        try {
            const localizationManager = require('../../utils/localizationManager');
            // Make sure it's initialized (it may already be from main.js)
            if (Object.keys(localizationManager.languages).length === 0) {
                await localizationManager.init();
            }
        } catch (error) {
            logger.error(`Error initializing localization for commands: ${error.message}`);
        }
        
        // Loop through all category folders
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(path.join(process.cwd(), 'src', 'commands', folder))
                .filter(file => file.endsWith('.js'));
            
            // Register each command in the collection
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                
                if (command.name) {
                    // Special handling for language command
                    if (command.name === 'language') {
                        try {
                            const localizationManager = require('../../utils/localizationManager');
                            const languages = localizationManager.getSupportedLanguages();
                            
                            // Create language choices
                            const languageChoices = languages.map(lang => ({
                                name: `${lang.flag} ${lang.name}`,
                                value: lang.code
                            }));
                            
                            // Add choices to the language_code option in the set subcommand
                            const setSubcommand = command.options.find(opt => opt.name === 'set');
                            if (setSubcommand) {
                                const langCodeOption = setSubcommand.options.find(opt => opt.name === 'language_code');
                                if (langCodeOption) {
                                    langCodeOption.choices = languageChoices;
                                    logger.info(`Added ${languageChoices.length} language choices to language command`);
                                }
                            }
                        } catch (error) {
                            logger.error(`Failed to add language choices: ${error.message}`);
                        }
                    }
                    
                    client.commands.set(command.name, command);
                    commandsArray.push(command);
                    logger.debug(`Registered command: ${command.name}`);
                } else {
                    logger.warn(`Command in ${file} is missing required "name" property`);
                }
            }
        }
        
        const rest = new REST({ version: config.api.version || '10' }).setToken(config.bot.token);
        
        try {
            logger.info('Started refreshing application (/) commands.');
            
            // Process commands to handle BigInt values before registration
            const processedCommands = processCommandsForRegistration(commandsArray);
            
            if (config.env.isDevelopment && config.bot.guildId) {
                // Deploy to specific guild in development
                logger.info(`Deploying commands to guild: ${config.bot.guildId} (development mode)`);
                await rest.put(
                    Routes.applicationGuildCommands(config.bot.clientId, config.bot.guildId),
                    { body: processedCommands }
                );
            } else {
                // Deploy globally in production
                logger.info('Deploying commands globally (production mode)');
                await rest.put(
                    Routes.applicationCommands(config.bot.clientId),
                    { body: processedCommands }
                );
            }
            
            logger.info('Successfully reloaded application (/) commands.');
        } catch (error) {
            logger.error(`Failed to refresh commands: ${error.message}`);
        }
    };
}; 