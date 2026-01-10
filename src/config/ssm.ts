/**
 * SSM Parameter Store Utilities
 *
 * Helpers for reading and writing runtime configuration.
 * Uses SSM Parameter Store (free tier) instead of Secrets Manager ($0.40/secret/month).
 *
 * Parameters are stored under: /discord-bot/{key}
 */
import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
  DeleteParameterCommand,
  GetParametersByPathCommand,
} from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

/** Base path for all bot parameters */
const PARAMETER_PREFIX = '/discord-bot';

/**
 * Get a parameter value from SSM
 *
 * @param key - Parameter key (without prefix)
 * @param decrypt - Whether to decrypt SecureString values (default: true)
 * @returns The parameter value, or null if not found
 */
export async function getParameter(key: string, decrypt = true): Promise<string | null> {
  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: `${PARAMETER_PREFIX}/${key}`,
        WithDecryption: decrypt,
      })
    );
    return response.Parameter?.Value ?? null;
  } catch (error: any) {
    if (error.name === 'ParameterNotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * Set a parameter value in SSM
 *
 * @param key - Parameter key (without prefix)
 * @param value - Value to store
 * @param options - Additional options
 */
export async function setParameter(
  key: string,
  value: string,
  options?: {
    /** Use SecureString for sensitive values (default: false) */
    secure?: boolean;
    /** Description for the parameter */
    description?: string;
  }
): Promise<void> {
  await ssmClient.send(
    new PutParameterCommand({
      Name: `${PARAMETER_PREFIX}/${key}`,
      Value: value,
      Type: options?.secure ? 'SecureString' : 'String',
      Description: options?.description,
      Overwrite: true,
    })
  );
}

/**
 * Delete a parameter from SSM
 *
 * @param key - Parameter key (without prefix)
 */
export async function deleteParameter(key: string): Promise<void> {
  try {
    await ssmClient.send(
      new DeleteParameterCommand({
        Name: `${PARAMETER_PREFIX}/${key}`,
      })
    );
  } catch (error: any) {
    if (error.name === 'ParameterNotFound') {
      return; // Already deleted
    }
    throw error;
  }
}

/**
 * Get all parameters under a path
 *
 * @param path - Path under the prefix (e.g., 'servers' for /discord-bot/servers/*)
 * @returns Map of key -> value
 */
export async function getParametersByPath(path: string): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  let nextToken: string | undefined;

  do {
    const response = await ssmClient.send(
      new GetParametersByPathCommand({
        Path: `${PARAMETER_PREFIX}/${path}`,
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      })
    );

    for (const param of response.Parameters ?? []) {
      if (param.Name && param.Value) {
        // Remove prefix from key
        const key = param.Name.replace(`${PARAMETER_PREFIX}/`, '');
        results.set(key, param.Value);
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return results;
}

/**
 * Get a JSON object from SSM
 *
 * @param key - Parameter key
 * @returns Parsed JSON object, or null if not found
 */
export async function getJson<T>(key: string): Promise<T | null> {
  const value = await getParameter(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    console.error(`Failed to parse JSON from SSM parameter: ${key}`);
    return null;
  }
}

/**
 * Store a JSON object in SSM
 *
 * @param key - Parameter key
 * @param value - Object to store (will be JSON.stringify'd)
 */
export async function setJson<T>(key: string, value: T): Promise<void> {
  await setParameter(key, JSON.stringify(value));
}

/**
 * Server-specific configuration helpers
 */
export const serverConfig = {
  /**
   * Get a server-specific setting
   */
  async get(serverId: string, key: string): Promise<string | null> {
    return getParameter(`servers/${serverId}/${key}`);
  },

  /**
   * Set a server-specific setting
   */
  async set(serverId: string, key: string, value: string): Promise<void> {
    await setParameter(`servers/${serverId}/${key}`, value);
  },

  /**
   * Get all settings for a server
   */
  async getAll(serverId: string): Promise<Map<string, string>> {
    return getParametersByPath(`servers/${serverId}`);
  },

  /**
   * Store the Discord webhook URL for a server
   */
  async setWebhook(serverId: string, webhookUrl: string): Promise<void> {
    await setParameter(`servers/${serverId}/webhook`, webhookUrl, {
      secure: true,
      description: `Discord webhook for server ${serverId}`,
    });
  },

  /**
   * Get the Discord webhook URL for a server
   */
  async getWebhook(serverId: string): Promise<string | null> {
    return getParameter(`servers/${serverId}/webhook`);
  },
};
