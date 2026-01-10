# Discord Bot Template - Setup Guide

This guide walks you through setting up your Discord bot from scratch. No coding experience required!

## Step 1: Prerequisites

### Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version
3. Run the installer

Verify installation:
```bash
node --version  # Should show v18 or higher
npm --version   # Should show v9 or higher
```

### Install AWS CLI

1. Go to [AWS CLI Installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Follow instructions for your operating system
3. Configure with your AWS credentials:
   ```bash
   aws configure
   # Enter your Access Key ID
   # Enter your Secret Access Key
   # Enter your region (e.g., us-west-2)
   # Enter output format: json
   ```

### Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (this is your bot's name)
4. Go to the "Bot" section in the left sidebar
5. Click "Reset Token" and copy the token (you'll need this)
6. Save these values from different sections:
   - **General Information**: Application ID, Public Key
   - **Bot**: Token (after clicking Reset Token)

### Invite the Bot to Your Server

1. Go to "OAuth2" -> "URL Generator" in the left sidebar
2. Under "Scopes", select: `bot`, `applications.commands`
3. Under "Bot Permissions", select: `Send Messages`, `Use Slash Commands`
4. Copy the generated URL at the bottom
5. Open the URL in your browser and add the bot to your server

## Step 2: Set Up the Project

### Clone and Install

```bash
# Clone the template
git clone <repository-url> my-discord-bot
cd my-discord-bot

# Install dependencies
npm install
```

### Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your values:
```
DISCORD_APP_ID=your_application_id_here
DISCORD_BOT_PUBLIC_KEY=your_public_key_here
DISCORD_BOT_SECRET_TOKEN=your_bot_token_here
DISCORD_SERVER_ID=your_server_id_here

AWS_REGION=us-west-2

DEFAULT_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key_here
```

**How to get your server ID:**
1. In Discord, enable Developer Mode: User Settings -> App Settings -> Advanced -> Developer Mode
2. Right-click your server name -> "Copy Server ID"

**How to get a Gemini API key (free):**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key

## Step 3: Deploy

```bash
# Load environment variables
source .env

# Build the project
npm run build

# Deploy to AWS
npm run deploy
```

After deployment, you'll see output like:
```
Outputs:
BotStack.InteractionsUrl = https://xxxxx.execute-api.us-west-2.amazonaws.com/prod/interactions
```

Copy this URL!

## Step 4: Configure Discord

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "General Information"
4. Scroll down to "Interactions Endpoint URL"
5. Paste the URL from the deploy output
6. Click "Save Changes"

Discord will verify the endpoint. If it fails, check the CloudWatch logs.

## Step 5: Register Commands

```bash
npm run register
```

This registers your slash commands with Discord. With `DISCORD_SERVER_ID` set, commands appear immediately. Without it, global commands take up to 1 hour.

## Step 6: Test It!

In your Discord server, type `/ping` - you should see "Pong! Bot is online and ready."

Try `/help` to see all available commands.

## Troubleshooting

### "This interaction failed" error
- Check CloudWatch logs: AWS Console -> Lambda -> BotStack-DiscordHandler -> Monitor -> View CloudWatch Logs
- Verify your environment variables are correct
- Make sure you ran `source .env` before deploying

### Commands not appearing
- Run `npm run register` again
- Make sure `DISCORD_SERVER_ID` is set for instant registration
- Wait up to 1 hour for global commands

### Deployment fails
- Check your AWS credentials: `aws sts get-caller-identity`
- Make sure you have permission to create Lambda functions
- Try `npm run build` first to catch TypeScript errors

### Bot doesn't respond
- Check the Interactions Endpoint URL is correctly set in Discord
- Verify the bot has proper permissions in your server
- Check CloudWatch logs for errors

## Next Steps

- Read [CLAUDE.md](./CLAUDE.md) for development tips
- Check [docs/ADDING_COMMANDS.md](./docs/ADDING_COMMANDS.md) to add your own commands
- Use Claude Code to help you customize the bot!

## Getting Help

Ask Claude Code to help you:
- "Add a command that tells jokes"
- "Make the ask command use a different prompt"
- "Add a scheduled daily reminder"
