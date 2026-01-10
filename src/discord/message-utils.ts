/**
 * Message utilities for Discord
 *
 * Handles message splitting, formatting, and other Discord-specific concerns.
 */

/** Discord's maximum message length */
const MAX_MESSAGE_LENGTH = 2000;

/** Buffer for safety margin */
const SAFE_MESSAGE_LENGTH = 1900;

/**
 * Split a long message into chunks that fit Discord's limit.
 *
 * Tries to split at natural boundaries (paragraphs, sentences, words)
 * to avoid awkward mid-word breaks.
 */
export function splitMessage(content: string, maxLength = SAFE_MESSAGE_LENGTH): string[] {
  if (content.length <= maxLength) {
    return [content];
  }

  const chunks: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find the best split point
    let splitIndex = findSplitPoint(remaining, maxLength);

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks;
}

/**
 * Find the best point to split a message.
 * Prefers paragraph breaks > sentence breaks > word breaks > hard cut.
 */
function findSplitPoint(text: string, maxLength: number): number {
  const searchRange = text.slice(0, maxLength);

  // Try to split at paragraph break (double newline)
  const paragraphBreak = searchRange.lastIndexOf('\n\n');
  if (paragraphBreak > maxLength * 0.5) {
    return paragraphBreak + 2;
  }

  // Try to split at single newline
  const lineBreak = searchRange.lastIndexOf('\n');
  if (lineBreak > maxLength * 0.5) {
    return lineBreak + 1;
  }

  // Try to split at sentence end
  const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
  let bestSentenceBreak = -1;
  for (const ender of sentenceEnders) {
    const index = searchRange.lastIndexOf(ender);
    if (index > bestSentenceBreak) {
      bestSentenceBreak = index + ender.length;
    }
  }
  if (bestSentenceBreak > maxLength * 0.3) {
    return bestSentenceBreak;
  }

  // Try to split at word boundary
  const wordBreak = searchRange.lastIndexOf(' ');
  if (wordBreak > maxLength * 0.3) {
    return wordBreak + 1;
  }

  // Hard cut as last resort
  return maxLength;
}

/**
 * Send a potentially long message as multiple follow-ups.
 * Includes a small delay between messages to avoid rate limiting.
 */
export async function sendLongMessage(
  applicationId: string,
  interactionToken: string,
  content: string,
  options?: { delayMs?: number }
): Promise<void> {
  const { editOriginalResponse, sendFollowUp } = await import('./responses');
  const chunks = splitMessage(content);
  const delay = options?.delayMs ?? 300;

  // First chunk edits the original "thinking..." message
  if (chunks.length > 0) {
    await editOriginalResponse(applicationId, interactionToken, chunks[0]);
  }

  // Subsequent chunks are follow-ups
  for (let i = 1; i < chunks.length; i++) {
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, delay));
    await sendFollowUp(applicationId, interactionToken, chunks[i]);
  }
}

/**
 * Truncate a message to fit Discord's limit with an ellipsis indicator.
 */
export function truncateMessage(content: string, maxLength = SAFE_MESSAGE_LENGTH): string {
  if (content.length <= maxLength) {
    return content;
  }

  const truncated = content.slice(0, maxLength - 3);
  // Try to end at a word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Format text as a Discord code block.
 */
export function codeBlock(content: string, language = ''): string {
  return `\`\`\`${language}\n${content}\n\`\`\``;
}

/**
 * Format text as inline code.
 */
export function inlineCode(content: string): string {
  return `\`${content}\``;
}

/**
 * Escape Discord markdown characters.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[*_`~|\\]/g, '\\$&');
}
