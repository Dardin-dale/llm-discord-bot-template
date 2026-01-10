# Discord Bot Template

A modular, serverless Discord bot template for AWS Lambda. Designed for easy customization with Claude Code.

## Features

- **Serverless** - Runs on AWS Lambda, pay only for what you use (~$0.55/month)
- **Auto-loading Commands** - Drop a file in `src/commands/`, it just works
- **LLM Integration** - Built-in support for Gemini (free tier) and Claude
- **EventBridge** - Optional async events and scheduled tasks
- **TypeScript** - Full type safety and IDE support

## Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured with credentials
- Discord application (create at [Discord Developer Portal](https://discord.com/developers/applications))

### Setup

1. **Clone and install:**
   ```bash
   git clone <this-repo>
   cd discord-bot-template
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Discord credentials
   ```

3. **Deploy:**
   ```bash
   source .env
   npm run deploy
   ```

4. **Register commands:**
   ```bash
   npm run register
   ```

5. **Configure Discord:**
   - Copy the `InteractionsUrl` from deploy output
   - Paste in Discord Developer Portal -> Interactions Endpoint URL

## Adding Commands

Just create a new file in `src/commands/`:

```typescript
// src/commands/hello.ts
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandResult } from '../discord/types';

const command: Command = {
  name: 'hello',
  description: 'Say hello!',
  definition: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Say hello!')
    .toJSON(),

  async execute() {
    return { type: 'instant', content: 'Hello, world!' };
  },
};

export default command;
```

Then: `npm run register && npm run deploy`

## Project Structure

```
src/
├── commands/       # Your bot commands (auto-loaded)
├── llm/            # LLM providers (Gemini, Claude)
├── discord/        # Discord utilities
└── events/         # EventBridge handlers (optional)
lib/                # AWS CDK infrastructure
scripts/            # Helper scripts
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development server |
| `npm run deploy` | Deploy to AWS |
| `npm run register` | Register Discord commands |
| `npm run validate` | Check commands for errors |

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for Claude Code
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [docs/ADDING_COMMANDS.md](./docs/ADDING_COMMANDS.md) - Command tutorial
- [docs/ADVANCED_PATTERNS.md](./docs/ADVANCED_PATTERNS.md) - EventBridge, scheduling

## Cost

~$0.55/month for typical usage (1000 invocations/day)

## License

MIT
