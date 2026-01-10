# Advanced Patterns

These patterns are for more complex use cases. You don't need these for basic commands.

## EventBridge Integration

EventBridge enables:
- Scheduled tasks (daily summaries, reminders)
- Operations longer than Lambda's 15-minute timeout
- Decoupled async notifications

### Enabling EventBridge

1. Set in `.env`:
   ```
   ENABLE_EVENTBRIDGE=true
   ```

2. Redeploy:
   ```bash
   source .env
   npm run deploy
   ```

### Sending Events

From any command or handler:

```typescript
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridgeClient({});

await eventBridge.send(new PutEventsCommand({
  Entries: [{
    Source: 'discord-bot',
    DetailType: 'notification',
    Detail: JSON.stringify({
      content: 'Hello from EventBridge!',
    }),
    EventBusName: 'discord-bot-events',
  }],
}));
```

### Scheduled Tasks

Edit `lib/eventbridge.ts` to add scheduled rules:

```typescript
// Daily reminder at 9 AM UTC
new events.Rule(this, 'DailyReminder', {
  schedule: events.Schedule.cron({ hour: '9', minute: '0' }),
  targets: [new targets.LambdaFunction(props.handler, {
    event: events.RuleTargetInput.fromObject({
      type: 'scheduled_task',
      task: 'daily_reminder',
    }),
  })],
});
```

Then handle in `src/index.ts`:

```typescript
async function processScheduledTask(event: ScheduledTaskEvent): Promise<void> {
  if (event.task === 'daily_reminder') {
    // Send a message to Discord via webhook
    // (Store webhook URL in SSM Parameter Store)
  }
}
```

### Webhook Storage

Store Discord webhook URLs in SSM:

```bash
aws ssm put-parameter \
  --name "/discord-bot/webhook-url" \
  --value "https://discord.com/api/webhooks/..." \
  --type "SecureString"
```

## SSM Parameter Store

Use SSM for runtime configuration (cheaper than Secrets Manager):

```typescript
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});

// Read a parameter
const response = await ssm.send(new GetParameterCommand({
  Name: '/discord-bot/my-config',
  WithDecryption: true,
}));
const value = response.Parameter?.Value;

// Write a parameter
await ssm.send(new PutParameterCommand({
  Name: '/discord-bot/my-config',
  Value: 'new-value',
  Type: 'String',
  Overwrite: true,
}));
```

## Longer Operations

For operations that exceed Lambda's 15-minute timeout:

1. **Use Step Functions** - Break into multiple Lambda invocations
2. **Use SQS** - Queue work items for processing
3. **Use ECS/Fargate** - Run longer containerized tasks

Example with SQS (add to CDK):

```typescript
import * as sqs from 'aws-cdk-lib/aws-sqs';

const queue = new sqs.Queue(this, 'WorkQueue');
handler.addEnvironment('WORK_QUEUE_URL', queue.queueUrl);
queue.grantSendMessages(handler);
```

## Multi-Server Support

For bots in multiple Discord servers:

1. Store per-server config in SSM:
   ```
   /discord-bot/servers/{server_id}/webhook-url
   /discord-bot/servers/{server_id}/settings
   ```

2. Use the server ID from the interaction:
   ```typescript
   const serverId = interaction.guild_id;
   const config = await getServerConfig(serverId);
   ```

## Rate Limiting

Respect Discord's rate limits:

```typescript
import { setTimeout } from 'timers/promises';

async function sendMessages(messages: string[], token: string) {
  for (const message of messages) {
    await sendFollowUp(appId, token, message);
    await setTimeout(500); // Wait 500ms between messages
  }
}
```

## Error Handling Best Practices

```typescript
async processDeferred(interaction) {
  const appId = process.env.DISCORD_APP_ID!;

  try {
    const result = await riskyOperation();
    await editOriginalResponse(appId, interaction.token, result);
  } catch (error) {
    console.error('Command failed:', error);

    // User-friendly error message
    await editOriginalResponse(
      appId,
      interaction.token,
      'Something went wrong. Please try again later.'
    );

    // Optionally: Send to monitoring/alerting
    // await sendToMonitoring(error);
  }
}
```

## Logging and Monitoring

CloudWatch logs are enabled by default. View them:

1. AWS Console -> Lambda -> BotStack-DiscordHandler
2. Monitor tab -> View CloudWatch Logs

Add structured logging:

```typescript
console.log(JSON.stringify({
  event: 'command_executed',
  command: commandName,
  userId: interaction.member?.user?.id,
  serverId: interaction.guild_id,
  timestamp: new Date().toISOString(),
}));
```

## Testing

### Unit Tests

```typescript
// test/commands/ping.test.ts
import command from '../../src/commands/ping';

describe('ping command', () => {
  it('returns pong', async () => {
    const result = await command.execute({} as any);
    expect(result.content).toContain('Pong');
  });
});
```

### Integration Testing

Use the local server with ngrok to test against Discord:

```bash
npm run dev
# In another terminal:
ngrok http 3000
```

## Security Considerations

1. **Never log tokens or secrets**
2. **Use SSM SecureString for sensitive values**
3. **Validate user permissions for admin commands**
4. **Sanitize user input before using in prompts**

```typescript
// Check for admin permissions
if (!interaction.member?.permissions?.includes('ADMINISTRATOR')) {
  return { type: 'instant', content: 'You need admin permissions.', ephemeral: true };
}
```
