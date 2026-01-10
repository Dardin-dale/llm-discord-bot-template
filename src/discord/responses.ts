/**
 * Discord response helpers
 */
import {
  InteractionResponseType,
  APIInteractionResponse,
  MessageFlags,
} from 'discord-api-types/v10';
import { CommandResult, EmbedData } from './types';

/**
 * Create a PONG response for Discord's ping check
 */
export function createPongResponse(): APIInteractionResponse {
  return { type: InteractionResponseType.Pong };
}

/**
 * Create an instant message response
 */
export function createMessageResponse(
  content: string,
  options?: { ephemeral?: boolean; embeds?: EmbedData[] }
): APIInteractionResponse {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content,
      embeds: options?.embeds,
      flags: options?.ephemeral ? MessageFlags.Ephemeral : undefined,
    },
  };
}

/**
 * Create a deferred response (shows "thinking..." to user)
 */
export function createDeferredResponse(ephemeral?: boolean): APIInteractionResponse {
  return {
    type: InteractionResponseType.DeferredChannelMessageWithSource,
    data: {
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    },
  };
}

/**
 * Convert CommandResult to Discord API response
 */
export function commandResultToResponse(result: CommandResult): APIInteractionResponse {
  if (result.type === 'deferred') {
    return createDeferredResponse(result.ephemeral);
  }

  return createMessageResponse(result.content || '', {
    ephemeral: result.ephemeral,
    embeds: result.embeds,
  });
}

/**
 * Send a follow-up message after deferred response
 */
export async function sendFollowUp(
  applicationId: string,
  interactionToken: string,
  content: string,
  options?: { embeds?: EmbedData[]; ephemeral?: boolean }
): Promise<void> {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      embeds: options?.embeds,
      flags: options?.ephemeral ? MessageFlags.Ephemeral : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send follow-up: ${response.status} ${errorText}`);
  }
}

/**
 * Edit the original deferred response
 */
export async function editOriginalResponse(
  applicationId: string,
  interactionToken: string,
  content: string,
  options?: { embeds?: EmbedData[] }
): Promise<void> {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      embeds: options?.embeds,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to edit response: ${response.status} ${errorText}`);
  }
}
