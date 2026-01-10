/**
 * EventBridge Notification Handler
 *
 * Handles events from EventBridge and sends notifications to Discord.
 * Used for async notifications, scheduled task results, etc.
 */
import { EventBridgeEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

interface NotificationDetail {
  /** Channel or webhook to send to */
  channelId?: string;
  /** Message content */
  content: string;
  /** Optional embed data */
  embed?: {
    title?: string;
    description?: string;
    color?: number;
  };
}

/**
 * Handler for EventBridge notification events
 */
export async function handler(
  event: EventBridgeEvent<'notification', NotificationDetail>
): Promise<void> {
  console.log('Received notification event:', JSON.stringify(event));

  const { content, embed } = event.detail;

  try {
    // Get webhook URL from SSM Parameter Store
    const webhookUrl = await getWebhookUrl();

    if (!webhookUrl) {
      console.warn('No webhook URL configured - skipping notification');
      return;
    }

    // Send to Discord webhook
    await sendWebhookMessage(webhookUrl, content, embed);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

/**
 * Get Discord webhook URL from SSM Parameter Store
 */
async function getWebhookUrl(): Promise<string | null> {
  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: '/discord-bot/webhook-url',
        WithDecryption: true,
      })
    );
    return response.Parameter?.Value || null;
  } catch (error) {
    console.error('Failed to get webhook URL:', error);
    return null;
  }
}

/**
 * Send a message to a Discord webhook
 */
async function sendWebhookMessage(
  webhookUrl: string,
  content: string,
  embed?: NotificationDetail['embed']
): Promise<void> {
  const body: Record<string, unknown> = { content };

  if (embed) {
    body.embeds = [embed];
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook error: ${response.status} ${errorText}`);
  }
}
