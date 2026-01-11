# Discord Bot Template

Build your own Discord bot with AI help. No coding experience required.

This template is designed to work with [Claude Code](https://claude.ai/code) - just describe what you want your bot to do, and Claude will help you build it.

## What You'll Get

- A Discord bot that runs in the cloud (AWS)
- AI-powered commands using Gemini (free) or Claude
- Costs less than $1/month to run
- Easy to customize with Claude Code's help

## Before You Start

You'll need:
1. **A Discord account** and a server where you're an admin
2. **An AWS account** (free tier works) - [Create one here](https://aws.amazon.com/free/)
3. **Claude Code** installed - [Get it here](https://claude.ai/code)
4. **Node.js** installed - [Download here](https://nodejs.org/) (pick the LTS version)

## Getting Started

### Step 1: Create Your Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" in the sidebar and click "Add Bot"
4. Copy the **Token** (you'll need this later - keep it secret!)
5. Go to "General Information" and copy the **Application ID** and **Public Key**

### Step 2: Invite the Bot to Your Server

1. Go to "OAuth2" → "URL Generator" in the sidebar
2. Check these boxes:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`
3. Copy the generated URL and open it in your browser
4. Select your server and click "Authorize"

### Step 3: Set Up the Project

Open a terminal and run:

```bash
git clone <this-repo>
cd discord-bot-template
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and fill in your Discord credentials from Step 1.

### Step 4: Get an AI API Key (for smart commands)

Your bot can use AI to answer questions, write content, etc. You need an API key from at least one provider:

**Option A: Gemini (Recommended - Free)**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `.env`:
   ```
   GEMINI_API_KEY=your-key-here
   ```

**Option B: Claude**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and add billing info
3. Go to "API Keys" and create a new key
4. Copy the key and add to `.env`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

> **Tip:** Start with Gemini - it's free and works great. You can add Claude later if you want.

### Step 5: Open in Claude Code

Open the project folder in Claude Code. Claude will automatically understand the project structure.

**Just tell Claude what you want:**

> "Deploy my bot"

> "I want to add a command that tells jokes"

> "Help me test this locally"

Claude will guide you through each step.

## How It Works

This template includes **Skills** that teach Claude how to help you:

| When you say... | Claude will... |
|-----------------|----------------|
| "Add a command that..." | Create a new bot command for you |
| "I want an AI command that..." | Create a command that uses AI to respond |
| "Deploy" or "make it live" | Build and deploy your bot to AWS |
| "Test locally" | Help you run the bot on your computer |
| "Commands aren't showing up" | Help you register commands with Discord |

You don't need to remember special commands - just describe what you want in plain English.

## Example Conversation

```
You: I want my bot to have a command that gives compliments

Claude: I'll create a /compliment command for you. Should it:
        1. Give random compliments from a list, or
        2. Use AI to generate unique compliments?

You: AI generated ones sound fun

Claude: [Creates the command file and prompt template]
        Done! The /compliment command is ready.
        Say "deploy" when you want to make it live.

You: Deploy it

Claude: [Runs validation, builds, deploys to AWS]
        Your bot is live! Try /compliment in your Discord server.
```

## Project Structure

```
discord-bot-template/
├── src/commands/     ← Your bot's commands live here
├── src/llm/          ← AI/LLM configuration
├── .claude/skills/   ← Skills that help Claude help you
├── CLAUDE.md         ← Detailed guide for Claude
└── .env              ← Your secret credentials (don't share!)
```

## Included Commands

The template comes with these example commands:

| Command | What it does |
|---------|--------------|
| `/ping` | Simple test command |
| `/help` | Shows available commands |
| `/ask` | Ask the AI a question |
| `/explain` | Get simple explanations of topics |
| `/summarize` | Summarize long text |

## Common Tasks

### Adding a New Command
Just tell Claude: *"I want to add a command that [does something]"*

### Using AI in Commands
Tell Claude: *"I want an AI command that [does something smart]"*

### Deploying Changes
Tell Claude: *"Deploy"* or *"Push my changes live"*

### Testing Locally
Tell Claude: *"Help me test locally"* - Claude will walk you through setting up ngrok

### Fixing Issues
Describe the problem: *"My commands aren't showing up"* or *"I'm getting an error when..."*

## Cost

Running this bot costs approximately **$0.55/month** for typical usage:
- AWS Lambda: ~$0.20
- API Gateway: ~$0.35
- Gemini AI: Free tier
- Discord: Free

## Troubleshooting

**Bot isn't responding:**
- Check that you've deployed: tell Claude "deploy"
- Check that commands are registered: tell Claude "register commands"
- Make sure the bot is in your server and has permissions

**Commands not showing up:**
- Tell Claude "register commands"
- Wait a minute and try again (global commands can take up to an hour)
- Try kicking and re-inviting the bot

**Deployment fails:**
- Make sure AWS CLI is configured: `aws configure`
- Check your `.env` file has all the required values
- Tell Claude "help me fix deployment" with the error message

## Need Help?

1. Ask Claude Code - it knows this project inside and out
2. Check [CLAUDE.md](./CLAUDE.md) for technical details
3. See [SETUP.md](./SETUP.md) for detailed setup instructions

## License

MIT - do whatever you want with it!
