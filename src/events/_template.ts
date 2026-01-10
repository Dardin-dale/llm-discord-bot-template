/**
 * Event Handler Template
 *
 * Copy this file to create a new EventBridge event handler.
 * Event handlers process async events from EventBridge.
 */
import { EventBridgeEvent } from 'aws-lambda';

/**
 * Define your event detail type
 */
interface MyEventDetail {
  // Add your event properties here
  message: string;
}

/**
 * Handler for your custom event
 */
export async function handler(
  event: EventBridgeEvent<'my-event-type', MyEventDetail>
): Promise<void> {
  console.log('Received event:', JSON.stringify(event));

  const { message } = event.detail;

  // Process your event here
  console.log('Processing:', message);
}
