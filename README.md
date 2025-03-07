# Discord Bot Template

A production-ready Discord bot template using Discord.js v14. This template includes command handling, event management, logging, and other essential features to kickstart your Discord bot development.

## Features

- Advanced command handler with category support
- Event handler for all Discord events
- Slash commands support
- Message commands support
- Comprehensive logging system
- Environment variable configuration
- Voice capability with @discordjs/voice
- Error handling and recovery

## Prerequisites

- Node.js 16.9.0 or higher
- npm or yarn

## Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/discord-bot-template.git
cd discord-bot-template
```

2. Install dependencies
```bash
npm install
```

3. Copy the example environment file and fill in your bot details
```bash
cp .env.example .env
```

4. Edit the `.env` file with your Discord bot token and other configuration

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Adding Commands

1. Create a new file in the appropriate category folder inside `src/commands/`
2. Use the command template structure:

```javascript
module.exports = {
    name: 'command-name',
    description: 'Command description',
    category: 'category',
    options: [], // Slash command options if needed
    
    execute: async (interaction, client) => {
        // Command code here
    }
};
```

## Adding Events

1. Create a new file in `src/events/` with the name of the event
2. Use the event template structure:

```javascript
module.exports = {
    name: 'eventName', // Discord.js event name
    once: false, // Run only once or on every occurrence
    
    execute: async (...args) => {
        // Event code here
    }
};
```

## Folder Structure

```
discord-bot-template/
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies
├── README.md                  # Project documentation
└── src/                       # Source code
    ├── commands/              # Bot commands
    │   ├── admin/             # Admin commands
    │   ├── general/           # General commands
    │   └── utility/           # Utility commands
    ├── events/                # Event handlers
    ├── utils/                 # Utility functions
    ├── config.js              # Bot configuration
    ├── deploy-commands.js     # Command deployment script
    └── index.js               # Main bot file
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 