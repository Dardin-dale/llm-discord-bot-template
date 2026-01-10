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

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

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
      console.log(`Processing deferred command: ${event.commandName}`);
      await processDeferred(event);
      return;
    }

    if (event.type === 'scheduled_task') {
      console.log(`Processing scheduled task: ${event.task}`);
      await processScheduledTask(event);
      return;
    }
  }

  // Otherwise, this is an API Gateway event from Discord
  const apiEvent = event as APIGatewayProxyEvent;
  console.log('Received Discord interaction');

  // Get public key for verification
  const publicKey = process.env.DISCORD_BOT_PUBLIC_KEY;
  if (!publicKey) {
    console.error('DISCORD_BOT_PUBLIC_KEY not configured');
    return errorResponse(500, 'Server configuration error');
  }

  // Verify Discord signature
  const signature = apiEvent.headers['x-signature-ed25519'];
  const timestamp = apiEvent.headers['x-signature-timestamp'];
  const rawBody = apiEvent.body || '';

  const verification = verifyDiscordRequest(rawBody, signature, timestamp, publicKey);
  if (!verification.isValid) {
    console.error('Signature verification failed:', verification.error);
    return errorResponse(401, verification.error || 'Unauthorized');
  }

  // Parse interaction
  const interaction: APIInteraction = JSON.parse(rawBody);

  // Handle PING (Discord's verification check)
  if (interaction.type === InteractionType.Ping) {
    console.log('Responding to PING');
    return jsonResponse(createPongResponse());
  }

  // Handle application commands
  if (interaction.type === InteractionType.ApplicationCommand) {
    return handleCommand(interaction as APIChatInputApplicationCommandInteraction);
  }

  // Unknown interaction type
  console.warn('Unknown interaction type:', interaction.type);
  return errorResponse(400, 'Unknown interaction type');
}

/**
 * Handle a slash command
 */
async function handleCommand(
  interaction: APIChatInputApplicationCommandInteraction
): Promise<APIGatewayProxyResult> {
  const commandName = interaction.data.name;
  console.log(`Handling command: ${commandName}`);

  try {
    const command = await getCommand(commandName);

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
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
    console.error(`Error handling command ${commandName}:`, error);
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
    console.error('AWS_LAMBDA_FUNCTION_NAME not set - cannot process deferred');
    return;
  }

  console.log('Invoking self async for deferred processing');

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
      console.error(`Command ${commandName} has no processDeferred handler`);
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'This command does not support deferred processing.'
      );
      return;
    }

    await command.processDeferred(interaction);
  } catch (error) {
    console.error(`Error in deferred processing for ${commandName}:`, error);
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
  console.log(`Scheduled task: ${event.task}`);
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
