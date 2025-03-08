# Discord Bot Template

A production-ready Discord bot template using Discord.js v14. This template includes command handling, event management, logging, sharding, database integration, and API support to kickstart your Discord bot development.

## Features

- Advanced command handler with category support
- Event handler for all Discord events
- Slash commands and Message commands support
- Comprehensive logging system
- Environment variable configuration
- Sharding support for large bots
- MongoDB database integration with caching
- Third-party API integration (OpenAI, Weather)
- Voice capability with @discordjs/voice
- Error handling and recovery

## Prerequisites

- Node.js 16.9.0 or higher
- npm or yarn
- MongoDB Server (local or cloud)
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

1. Clone the repository:
```bash
git clone https://github.com/yourusername/discord-bot-template.git
cd discord-bot-template
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables by creating a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your Discord Bot Token, Application ID, and other settings:]
   - Set `USE_MESSAGE_CONTENT=true` if you enabled Message Content Intent
   - Set `USE_GUILD_MEMBERS=true` if you enabled Server Members Intent
```
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_development_guild_id_here
```

5. Register slash commands:
```bash
npm run register-commands
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Without Sharding
```bash
npm run start:no-sharding
```

## Project Structure

```
discord-bot-template/
├── src/
│   ├── api/               # API integrations
│   │   ├── services/      # Third-party API services
│   │   └── apiClient.js   # Base API client with rate limiting
│   ├── commands/          # Bot commands
│   │   ├── admin/         # Admin commands
│   │   ├── economy/       # Economy commands
│   │   ├── fun/           # Fun commands
│   │   ├── moderation/    # Moderation commands
│   │   └── utility/       # Utility commands
│   ├── database/          # Database integration
│   │   ├── models/        # Mongoose models
│   │   ├── services/      # Database services
│   │   └── dbManager.js   # Database connection manager
│   ├── events/            # Event handlers
│   ├── functions/         # Helper functions
│   ├── utils/             # Utility functions
│   ├── config.js          # Configuration
│   ├── index.js           # Main bot file
│   ├── main.js            # Entry point with sharding support
│   └── shard.js           # Sharding manager
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Adding Commands

1. Create a new file in the appropriate category folder inside `src/commands/`
2. Use the command template structure:

```javascript
module.exports = {
    name: 'command-name',
    description: 'Command description',
    options: [
        {
            name: 'option-name',
            description: 'Option description',
            type: 3, // See Discord.js option types
            required: true
        }
    ],
    execute: async (interaction, client) => {
        // Command implementation
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

## Database Usage

The template includes MongoDB integration with Mongoose. To interact with the database:

```javascript
const userProfileService = require('../database/services/userProfileService');

// Get user profile
const profile = await userProfileService.getProfile(userId);

// Update user profile
await userProfileService.updateProfile(userId, {
    balance: 100,
    xp: 500
});
```

## API Integration

The template includes integration with various third-party APIs:

```javascript
const { services } = require('../api');

// Use OpenAI
const aiResponse = await services.openai.generateText('What is the meaning of life?');

// Use Weather API
const weatherData = await services.weather.getCurrentWeather('London', 'metric');
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| BOT_TOKEN | Discord Bot Token | - |
| CLIENT_ID | Discord Application ID | - |
| GUILD_ID | Discord Guild ID for dev commands | - |
| NODE_ENV | Environment (development/production) | development |
| LOG_LEVEL | Logging level | info |
| PREFIX | Message command prefix | ! |
| USE_MESSAGE_CONTENT | Enable message content intent | true |
| USE_GUILD_MEMBERS | Enable guild members intent | true |
| SHARDING_ENABLED | Enable sharding | false |
| SHARDING_TOTAL_SHARDS | Number of shards or 'auto' | auto |
| DATABASE_URI | MongoDB connection URI | mongodb://localhost:27017/discordbot |
| OPENAI_API_KEY | OpenAI API key | - |
| WEATHER_API_KEY | OpenWeatherMap API key | - |

## Troubleshooting

### "Error: Used disallowed intents"
This error occurs when your bot is trying to use privileged intents that aren't enabled in the Discord Developer Portal.
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to the "Bot" tab
4. Under "Privileged Gateway Intents" enable the required intents
5. Or, set the intent environment variables to `false` in your `.env` file


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 