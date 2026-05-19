/**
 * AWS Lambda handler for Discord interactions
 *
 * Handles:
 * 1. API Gateway requests from Discord (signature verification + command routing)
 * 2. Async self-invocation for deferred processing (LLM calls, etc.)
 * 3. Scheduled tasks via EventBridge (if enabled)
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import {
  APIInteraction,
  InteractionType,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { verifyDiscordRequest } from './discord/verify';
import {
  createPongResponse,
  commandResultToResponse,
  editOriginalResponse,
} from './discord/responses';
import { getCommand } from './commands/loader';
import { DeferredProcessingEvent, ScheduledTaskEvent, BotEvent } from './discord/types';
import { logger } from './utils/logger';

// Load environment variables
process.loadEnvFile();

const lambdaClient = new LambdaClient({});

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent | BotEvent
): Promise<APIGatewayProxyResult | void> {
  // Check for async events (deferred processing or scheduled tasks)
  if ('type' in event) {
    if (event.type === 'deferred_processing') {
      logger.info('Processing deferred command', { command: event.commandName });
      await processDeferred(event);
      return;
    }

    if (event.type === 'scheduled_task') {
      logger.info('Processing scheduled task', { task: event.task });
      await processScheduledTask(event);
      return;
    }
  }

  // Otherwise, this is an API Gateway event from Discord
  const apiEvent = event as APIGatewayProxyEvent;
  logger.info('Received Discord interaction');

  // Get public key for verification
  const publicKey = process.env.DISCORD_BOT_PUBLIC_KEY;
  if (!publicKey) {
    logger.error('DISCORD_BOT_PUBLIC_KEY not configured');
    return errorResponse(500, 'Server configuration error');
  }

  // Verify Discord signature
  const signature = apiEvent.headers['x-signature-ed25519'];
  const timestamp = apiEvent.headers['x-signature-timestamp'];
  const rawBody = apiEvent.body || '';

  const verification = verifyDiscordRequest(rawBody, signature, timestamp, publicKey);
  if (!verification.isValid) {
    logger.error('Signature verification failed', undefined, { reason: verification.error });
    return errorResponse(401, verification.error || 'Unauthorized');
  }

  // Parse interaction
  const interaction: APIInteraction = JSON.parse(rawBody);

  // Handle PING (Discord's verification check)
  if (interaction.type === InteractionType.Ping) {
    logger.info('Responding to PING');
    return jsonResponse(createPongResponse());
  }

  // Handle application commands
  if (interaction.type === InteractionType.ApplicationCommand) {
    return handleCommand(interaction as APIChatInputApplicationCommandInteraction);
  }

  // Unknown interaction type
  logger.warn('Unknown interaction type', { interactionType: interaction.type });
  return errorResponse(400, 'Unknown interaction type');
}

/**
 * Handle a slash command
 */
async function handleCommand(
  interaction: APIChatInputApplicationCommandInteraction
): Promise<APIGatewayProxyResult> {
  const commandName = interaction.data.name;
  logger.info('Handling command', { command: commandName });

  try {
    const command = await getCommand(commandName);

    if (!command) {
      logger.error('Unknown command', undefined, { command: commandName });
      return jsonResponse(
        commandResultToResponse({
          type: 'instant',
          content: `Unknown command: ${commandName}`,
          ephemeral: true,
        })
      );
    }

    // Execute the command
    const result = await command.execute(interaction);
    const response = commandResultToResponse(result);

    // If deferred, trigger async processing
    if (result.type === 'deferred' && command.processDeferred) {
      await triggerDeferredProcessing(commandName, interaction);
    }

    return jsonResponse(response);
  } catch (error) {
    logger.error('Error handling command', error as Error, { command: commandName });
    return jsonResponse(
      commandResultToResponse({
        type: 'instant',
        content: 'An error occurred while processing your command.',
        ephemeral: true,
      })
    );
  }
}

/**
 * Trigger async deferred processing via Lambda self-invocation
 */
async function triggerDeferredProcessing(
  commandName: string,
  interaction: APIChatInputApplicationCommandInteraction
): Promise<void> {
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (!functionName) {
    logger.error('AWS_LAMBDA_FUNCTION_NAME not set - cannot process deferred');
    return;
  }

  logger.info('Invoking self async for deferred processing', { command: commandName });

  const payload: DeferredProcessingEvent = {
    type: 'deferred_processing',
    commandName,
    interaction,
  };

  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event', // Async invocation
      Payload: JSON.stringify(payload),
    })
  );
}

/**
 * Process deferred command asynchronously
 */
async function processDeferred(event: DeferredProcessingEvent): Promise<void> {
  const { commandName, interaction } = event;
  const applicationId = process.env.DISCORD_APP_ID || interaction.application_id;

  try {
    const command = await getCommand(commandName);

    if (!command?.processDeferred) {
      logger.error('Command has no processDeferred handler', undefined, { command: commandName });
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'This command does not support deferred processing.'
      );
      return;
    }

    await command.processDeferred(interaction);
  } catch (error) {
    logger.error('Error in deferred processing', error as Error, { command: commandName });
    await editOriginalResponse(
      applicationId,
      interaction.token,
      'An error occurred while processing your request.'
    );
  }
}

/**
 * Process scheduled task from EventBridge
 */
async function processScheduledTask(event: ScheduledTaskEvent): Promise<void> {
  logger.info('Scheduled task triggered', { task: event.task });
  // Implement scheduled task handling here
  // Example: daily summaries, cleanup jobs, etc.
}

/**
 * Create a JSON response
 */
function jsonResponse(data: unknown): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

/**
 * Create an error response
 */
function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}
