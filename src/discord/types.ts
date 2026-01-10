/**
 * Discord bot types
 */
import {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';

/**
 * Command response type
 */
export type CommandResponseType = 'instant' | 'deferred';

/**
 * Result from a command execution
 */
export interface CommandResult {
  /** Response type - instant for immediate, deferred for async processing */
  type: CommandResponseType;
  /** Text content for the response */
  content?: string;
  /** Embed data for rich responses */
  embeds?: EmbedData[];
  /** Whether the response should be ephemeral (only visible to user) */
  ephemeral?: boolean;
}

/**
 * Embed data for rich Discord messages
 */
export interface EmbedData {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

/**
 * Command interface - all commands must implement this
 */
export interface Command {
  /** Command name (lowercase, no spaces) */
  name: string;
  /** Short description shown in Discord */
  description: string;
  /** Full command definition for Discord API */
  definition: RESTPostAPIChatInputApplicationCommandsJSONBody;
  /** Execute the command - return instant or deferred response */
  execute(interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult>;
  /** Process deferred command - called async after initial response */
  processDeferred?(interaction: APIChatInputApplicationCommandInteraction): Promise<void>;
}

/**
 * Event for async deferred processing via Lambda self-invocation
 */
export interface DeferredProcessingEvent {
  type: 'deferred_processing';
  commandName: string;
  interaction: APIChatInputApplicationCommandInteraction;
}

/**
 * Event for scheduled tasks via EventBridge
 */
export interface ScheduledTaskEvent {
  type: 'scheduled_task';
  task: string;
}

/**
 * Combined event type for Lambda handler
 */
export type BotEvent = DeferredProcessingEvent | ScheduledTaskEvent;
