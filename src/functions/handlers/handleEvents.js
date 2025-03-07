const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFiles = fs
            .readdirSync(path.join(process.cwd(), 'src', 'events'))
            .filter(file => file.endsWith('.js'));
        
        // Register each event
        for (const file of eventFiles) {
            const event = require(`../../events/${file}`);
            
            if (event.name) {
                if (event.once) {
                    // Register one-time event
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    // Register regular event
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                
                logger.info(`Event registered: ${event.name} (once: ${event.once || false})`);
            } else {
                logger.warn(`Failed to register event in ${file}: Missing name`);
            }
        }
    };
}; 