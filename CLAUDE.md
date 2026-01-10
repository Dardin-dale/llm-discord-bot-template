# Discord Bot Template - Development Guide

## Quick Reference

### Adding a New Command
1. Copy `src/commands/_template.ts` to `src/commands/your-command.ts`
2. Change the `name` and `description` fields
3. Modify the `execute()` function
4. Run `npm run register` to update Discord
5. Deploy with `npm run deploy`

### Common Tasks

**Add a simple command that responds with text:**
- Copy `src/commands/ping.ts` as a starting point
- Modify the `content` in the return statement

**Add a command that uses AI/LLM:**
- Copy `src/commands/ask.ts` as a starting point
- Use `getProviderManager().getProvider().generate()` in `processDeferred()`

**Add command options (arguments):**
```typescript
definition: new SlashCommandBuilder()
  .setName('mycommand')
  .setDescription('My command')
  .addStringOption(option =>
    option.setName('input').setDescription('Your input').setRequired(true)
  )
  .toJSON(),
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/commands/` | Slash commands - **ADD NEW COMMANDS HERE** |
| `src/llm/` | LLM providers (gemini, claude) |
| `src/discord/` | Discord utilities (verification, responses) |
| `src/events/` | EventBridge event handlers (optional) |
| `lib/` | AWS CDK infrastructure |
| `scripts/` | Helper scripts (register, validate, local-server) |
| `templates/` | Additional templates for commands |

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build TypeScript |
| `npm run deploy` | Deploy to AWS (validates env first) |
| `npm run register` | Register Discord commands |
| `npm run validate` | Check commands for errors |
| `npm run validate:env` | Check environment configuration |
| `npm test` | Run tests |

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DISCORD_APP_ID` | Yes | Discord application ID |
| `DISCORD_BOT_PUBLIC_KEY` | Yes | For signature verification |
| `DISCORD_BOT_SECRET_TOKEN` | Yes | Bot token for API calls |
| `DISCORD_SERVER_ID` | No | For instant command registration |
| `DEFAULT_LLM_PROVIDER` | No | 'gemini' (default) or 'claude' |
| `GEMINI_API_KEY` | If using Gemini | Gemini API key |
| `ANTHROPIC_API_KEY` | If using Claude | Claude API key |
| `ENABLE_EVENTBRIDGE` | No | Set 'true' for EventBridge |

## Code Style

- TypeScript with strict typing
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Keep files under 100 lines when possible
- One command per file
- Use async/await over Promises
- Handle errors with try/catch blocks

## Command Pattern

Every command file exports a `Command` object:

```typescript
const command: Command = {
  name: 'mycommand',           // Lowercase, no spaces
  description: 'What it does', // Shown in Discord
  definition: /* SlashCommandBuilder */.toJSON(),

  async execute(interaction) {
    // For instant responses:
    return { type: 'instant', content: 'Hello!' };

    // For async processing:
    return { type: 'deferred' };
  },

  // Only needed if execute returns { type: 'deferred' }
  async processDeferred(interaction) {
    // Do async work, then send result
    await editOriginalResponse(appId, token, 'Done!');
  }
};
```

## Response Types

**Instant Response** - For quick operations (<3 seconds):
```typescript
return {
  type: 'instant',
  content: 'Your message here',
  ephemeral: true,  // Only visible to user (optional)
};
```

**Deferred Response** - For long operations (LLM calls, API requests):
```typescript
async execute() {
  return { type: 'deferred' };
},

async processDeferred(interaction) {
  // Do your async work here
  const result = await someAsyncOperation();

  // Send the result back
  await editOriginalResponse(appId, interaction.token, result);
}
```

## LLM Integration

Use the provider manager for AI features:

```typescript
import { getProviderManager } from '../llm/provider';

const provider = getProviderManager().getProvider();
const response = await provider.generate('Your prompt here');
```

**Handling long responses** (auto-splits for Discord's 2000 char limit):
```typescript
import { sendLongMessage } from '../discord/message-utils';

// In processDeferred:
await sendLongMessage(appId, interaction.token, longResponse);
```

**Switch providers at runtime** with `/provider set gemini` or `/provider set claude`

## SSM Parameter Store

Use SSM for runtime configuration (free, unlike Secrets Manager):

```typescript
import { getParameter, setParameter, serverConfig } from '../config/ssm';

// Read/write simple values
const value = await getParameter('my-key');
await setParameter('my-key', 'my-value');

// Server-specific settings
await serverConfig.set(serverId, 'prefix', '!');
const prefix = await serverConfig.get(serverId, 'prefix');

// Store webhook URLs securely
await serverConfig.setWebhook(serverId, webhookUrl);
```

## Troubleshooting

**Commands not appearing in Discord:**
- Run `npm run register`
- Set `DISCORD_SERVER_ID` for instant updates during development
- Global commands take up to 1 hour to propagate

**"Application did not respond" error:**
- Check CloudWatch logs: AWS Console -> Lambda -> your function -> Monitor
- Verify environment variables are set
- Operations over 3 seconds need deferred responses

**LLM not working:**
- Check API key is set in `.env`
- Run `npm run deploy` after changing `.env`
- Check provider: `getProviderManager().getAvailableProviders()`

**Deployment fails:**
- Run `source .env` before `npm run deploy`
- Check AWS credentials are configured
- Try `npm run build` first to catch TypeScript errors

## Testing Locally

1. Start the local server: `npm run dev`
2. In another terminal: `ngrok http 3000`
3. Copy the ngrok HTTPS URL
4. Paste in Discord Developer Portal -> Interactions Endpoint URL
5. Test your commands in Discord

## EventBridge (Optional)

Enable EventBridge for:
- Scheduled tasks (daily summaries, reminders)
- Operations longer than 15 minutes
- Decoupled async notifications

Set `ENABLE_EVENTBRIDGE=true` in `.env` before deploying.

## AWS Resources Created

- **Lambda**: Discord interaction handler
- **API Gateway**: `/interactions` endpoint for Discord
- **IAM Role**: Permissions for Lambda, SSM, self-invocation
- **SSM Parameters**: Configuration storage (free tier)
- **EventBridge** (optional): Event bus and notification handler

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| Lambda (1000 invocations/day) | ~$0.20 |
| API Gateway | ~$0.35 |
| SSM Parameters (standard) | Free |
| Gemini API (free tier) | Free |
| **Total** | **~$0.55/month** |

## Security Notes

- Never commit `.env` file (it's in `.gitignore`)
- Use SSM Parameter Store for runtime secrets
- Bot token should never appear in logs
- Discord signature verification prevents unauthorized requests

## MCP Server Integration

For enhanced Claude Code assistance, enable AWS MCP servers:

1. Install: `@aws/infrastructure-as-code-mcp-server`
2. Install: `@aws/serverless-mcp-server`

These provide real-time AWS documentation and CDK code generation.

See `docs/MCP_SETUP.md` for detailed instructions.
