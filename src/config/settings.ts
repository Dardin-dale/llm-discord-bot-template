/**
 * Bot configuration settings
 *
 * Loaded from environment variables with sensible defaults.
 */

export interface BotSettings {
  /** Discord application ID */
  discordAppId: string;
  /** Discord bot public key for signature verification */
  discordPublicKey: string;
  /** Discord bot token */
  discordToken: string;
  /** Default LLM provider */
  defaultLlmProvider: 'gemini' | 'claude';
  /** Whether EventBridge is enabled */
  eventBridgeEnabled: boolean;
}

/**
 * Get bot settings from environment
 */
export function getSettings(): BotSettings {
  return {
    discordAppId: process.env.DISCORD_APP_ID || '',
    discordPublicKey: process.env.DISCORD_BOT_PUBLIC_KEY || '',
    discordToken: process.env.DISCORD_BOT_SECRET_TOKEN || '',
    defaultLlmProvider: (process.env.DEFAULT_LLM_PROVIDER as 'gemini' | 'claude') || 'gemini',
    eventBridgeEnabled: process.env.ENABLE_EVENTBRIDGE === 'true',
  };
}

/**
 * Validate required settings
 */
export function validateSettings(): string[] {
  const errors: string[] = [];
  const settings = getSettings();

  if (!settings.discordAppId) {
    errors.push('DISCORD_APP_ID is not set');
  }

  if (!settings.discordPublicKey) {
    errors.push('DISCORD_BOT_PUBLIC_KEY is not set');
  }

  if (!settings.discordToken) {
    errors.push('DISCORD_BOT_SECRET_TOKEN is not set');
  }

  return errors;
}
