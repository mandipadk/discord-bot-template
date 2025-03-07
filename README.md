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
- A Discord bot application with a token

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application
3. Navigate to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section:
   - Enable "MESSAGE CONTENT INTENT" if your bot needs to read message content
   - Enable "SERVER MEMBERS INTENT" if your bot needs to access member information
5. Copy your Bot Token and Client ID for use in the .env file

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
   - Set `USE_MESSAGE_CONTENT=true` if you enabled Message Content Intent
   - Set `USE_GUILD_MEMBERS=true` if you enabled Server Members Intent

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

## Troubleshooting

### "Error: Used disallowed intents"
This error occurs when your bot is trying to use privileged intents that aren't enabled in the Discord Developer Portal.

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to the "Bot" tab
4. Under "Privileged Gateway Intents" enable the required intents
5. Or, set the intent environment variables to `false` in your `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details. 