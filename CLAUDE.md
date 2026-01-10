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
- Use `runPrompt('answer', { question })` for Q&A, or other built-in prompts
- See the Prompt Templates section for available prompts

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
| `src/llm/prompts/` | Prompt templates (reusable LLM patterns) |
| `src/discord/` | Discord utilities (verification, responses) |
| `src/events/` | EventBridge event handlers (optional) |
| `src/utils/` | Utilities (logger) |
| `lib/` | AWS CDK infrastructure |
| `scripts/` | Helper scripts (register, validate, local-server) |
| `templates/` | Additional templates for commands |
| `.github/workflows/` | CI/CD pipelines |
| `.claude/skills/` | Claude Code skills (model-invoked helpers) |

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

## Prompt Templates

Prompt templates are reusable patterns for common LLM tasks. Use templates instead of raw prompts for consistency across providers.

**Available built-in prompts:**
- `answer` - Answer questions (used by `/ask`)
- `summarize` - Summarize text into key points (used by `/summarize`)
- `explain` - Explain concepts simply (used by `/explain`)
- `translate` - Translate between languages
- `creative` - Creative writing tasks

**Using a prompt:**
```typescript
import { runPrompt } from '../llm/prompts';

const result = await runPrompt('answer', { question: 'What is TypeScript?' });
// result.response contains the LLM output
// result.provider shows which provider was used
```

**Creating a custom prompt:**
Create a file in `src/llm/prompts/builtin/`:
```typescript
import { PromptTemplate } from '../types';

export const myPrompt: PromptTemplate = {
  name: 'myprompt',
  description: 'What this prompt does',
  systemPrompt: 'Instructions for the LLM',
  template: 'User prompt with {{variable}} placeholders',
};
```

Then register it in `src/llm/prompts/registry.ts`:
```typescript
import { myPrompt } from './builtin/myprompt';
registry.register(myPrompt);
```

## Structured Logging

Use the structured logger for production-ready JSON logs that work with CloudWatch:

```typescript
import { logger } from '../utils/logger';

// Basic logging
logger.info('Processing request', { userId: '123', command: 'ask' });
logger.warn('Rate limit approaching', { remaining: 5 });
logger.error('Request failed', error, { endpoint: '/api' });

// Command-specific logging
logger.command('ask', 'start', { userId: interaction.member?.user?.id });
logger.command('ask', 'complete', { durationMs: Date.now() - startTime });

// Request-scoped logger
import { createRequestLogger } from '../utils/logger';
const reqLog = createRequestLogger(requestId, { command: 'ask' });
reqLog.info('Step completed'); // Includes requestId in all logs
```

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

## Claude Code Skills

This project includes Skills that Claude Code automatically uses when relevant. You don't need to invoke them - just describe what you want:

| Skill | Triggers when you say... |
|-------|--------------------------|
| `add-command` | "add a command", "create a new command", "I want a command that..." |
| `add-llm-command` | "add an AI command", "command that uses the LLM", "smart command" |
| `add-prompt` | "create a prompt", "add a prompt template", "customize AI behavior" |
| `deploy-bot` | "deploy", "push to production", "make it live" |
| `register-commands` | "register commands", "commands not showing up" |
| `local-dev` | "test locally", "run on my machine", "start dev server" |

**Example conversation:**
```
You: I want to add a command that tells jokes
Claude: [Uses add-command skill, asks clarifying questions, creates the file]

You: Actually, I want it to use AI to generate jokes
Claude: [Uses add-llm-command skill, creates command + prompt template]

You: Great, let's deploy it
Claude: [Uses deploy-bot skill, runs validation, builds, deploys]
```

Skills are in `.claude/skills/` - each has a `SKILL.md` with instructions Claude follows.

## GitHub Actions CI/CD

The template includes GitHub Actions workflows:

**Pull Request Checks** (`.github/workflows/pr.yml`):
- Runs on every PR
- Type checks, linting, and tests
- Validates command structure

**Deploy on Merge** (`.github/workflows/deploy.yml`):
- Triggers when PR merges to `main`
- Builds and deploys to AWS
- Registers Discord commands

**Required GitHub Secrets:**
| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | AWS credentials for deployment |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for deployment |
| `AWS_REGION` | AWS region (e.g., `us-east-1`) |
| `DISCORD_APP_ID` | Discord application ID |
| `DISCORD_BOT_SECRET_TOKEN` | Discord bot token |
| `DISCORD_BOT_PUBLIC_KEY` | Discord public key |

Set these in your GitHub repo: Settings -> Secrets and variables -> Actions
