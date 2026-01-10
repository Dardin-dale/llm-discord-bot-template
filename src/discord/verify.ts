/**
 * Discord signature verification
 */
import { verifyKey } from 'discord-interactions';

export interface VerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Verify Discord request signature
 *
 * Discord sends a signature with each request that must be verified
 * to ensure the request is authentic.
 */
export function verifyDiscordRequest(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined,
  publicKey: string
): VerificationResult {
  if (!signature || !timestamp) {
    return {
      isValid: false,
      error: 'Missing signature or timestamp headers',
    };
  }

  const isValid = verifyKey(rawBody, signature, timestamp, publicKey);

  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid request signature',
    };
  }

  return { isValid: true };
}
