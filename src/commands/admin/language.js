const { PermissionFlagsBits } = require('discord.js');
const EmbedUtil = require('../../utils/embed');
const localizationManager = require('../../utils/localizationManager');

module.exports = {
    name: 'language',
    description: 'Change the bot language for this server',
    options: [
        {
            name: 'show',
            description: 'Show current language and available options',
            type: 1 // SUB_COMMAND
        },
        {
            name: 'set',
            description: 'Set a new language for this server',
            type: 1, // SUB_COMMAND
            options: [
                {
                    name: 'language_code',
                    description: 'The language code to set',
                    type: 3, // STRING
                    required: true,
                    // Choices will be added by handleCommands.js
                }
            ]
        }
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    
    execute: async (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        
        switch (subcommand) {
            case 'show': {
                await interaction.deferReply();
                
                // Get current language
                const currentLang = await localizationManager.getGuildLanguage(guildId);
                const languageList = localizationManager.getSupportedLanguages();
                
                // Format language list
                const languageOptions = languageList.map(lang => 
                    `${lang.flag} \`${lang.code}\` - ${lang.name} (${lang.nativeName})${lang.isDefault ? ' (Default)' : ''}`
                ).join('\n');
                
                // Get current language data
                const currentLangData = languageList.find(lang => lang.code === currentLang);
                
                // Create embed
                const embed = EmbedUtil.base({
                    title: await localizationManager.translateGuild('commands.language.title', guildId),
                    description: await localizationManager.translateGuild(
                        'commands.language.currentLanguage', 
                        guildId, 
                        { language: `${currentLangData.flag} ${currentLangData.name}` }
                    ),
                    fields: [
                        {
                            name: await localizationManager.translateGuild('commands.language.availableLanguages', guildId),
                            value: languageOptions || 'None'
                        },
                        {
                            name: 'How to change',
                            value: `Use \`/language set language_code:<code>\` to change the language.`
                        }
                    ]
                });
                
                await interaction.editReply({ embeds: [embed] });
                break;
            }
            
            case 'set': {
                await interaction.deferReply();
                
                const newLanguage = interaction.options.getString('language_code');
                const supportedLanguages = localizationManager.getSupportedLanguages();
                
                // Check if language is supported
                if (!supportedLanguages.some(lang => lang.code === newLanguage)) {
                    return interaction.editReply({
                        embeds: [EmbedUtil.error(
                            await localizationManager.translateGuild('common.error', guildId), 
                            await localizationManager.translateGuild('commands.language.languageNotFound', guildId)
                        )]
                    });
                }
                
                // Set the new language
                const success = await localizationManager.setGuildLanguage(guildId, newLanguage);
                
                if (success) {
                    // Get language data for the new language
                    const langData = supportedLanguages.find(lang => lang.code === newLanguage);
                    
                    // Respond with success (in the new language)
                    return interaction.editReply({
                        embeds: [EmbedUtil.success(
                            await localizationManager.translateGuild('common.success', guildId),
                            await localizationManager.translateGuild(
                                'commands.language.languageUpdated', 
                                guildId, 
                                { language: `${langData.flag} ${langData.name}` }
                            )
                        )]
                    });
                } else {
                    // Error setting language
                    return interaction.editReply({
                        embeds: [EmbedUtil.error(
                            await localizationManager.translateGuild('common.error', guildId),
                            await localizationManager.translateGuild('errors.generic', guildId, { error: 'Failed to update language' })
                        )]
                    });
                }
                
                break;
            }
        }
    }
}; 