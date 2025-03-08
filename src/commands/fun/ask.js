const { EmbedBuilder } = require('discord.js');
const openaiService = require('../../api/services/openaiService');
const EmbedUtil = require('../../utils/embed');

module.exports = {
    name: 'ask',
    description: 'Ask the AI a question',
    options: [
        {
            name: 'question',
            description: 'What do you want to ask?',
            type: 3, // STRING type
            required: true
        }
    ],
    
    execute: async (interaction, client) => {
        await interaction.deferReply();
        
        // Check if the service is configured
        if (!openaiService.isReady()) {
            return interaction.editReply({
                embeds: [EmbedUtil.error(
                    'Service Unavailable',
                    'The AI service is not configured. Please contact the bot administrator.'
                )]
            });
        }
        
        // Get the question from command options
        const question = interaction.options.getString('question');
        
        try {
            // Moderate the content first to check for violations
            const moderation = await openaiService.moderateText(question);
            
            if (moderation.flagged) {
                // Get the categories that were flagged
                const flaggedCategories = Object.entries(moderation.categories)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key.replace(/[-_]/g, ' '))
                    .join(', ');
                
                return interaction.editReply({
                    embeds: [EmbedUtil.warning(
                        'Content Filtered',
                        `Your question was flagged for potentially containing ${flaggedCategories}. Please rephrase your question.`
                    )]
                });
            }
            
            // Get AI response
            const aiResponse = await openaiService.generateText(question);
            
            // Create response embed
            const responseEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('AI Response')
                .setDescription(aiResponse)
                .addFields({ name: 'Question', value: question })
                .setFooter({ text: 'Powered by OpenAI' })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [responseEmbed] });
            
        } catch (error) {
            await interaction.editReply({
                embeds: [EmbedUtil.error('Error', `Could not generate a response: ${error.message}`)]
            });
        }
    }
}; 