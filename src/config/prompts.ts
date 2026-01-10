/**
 * LLM Prompt Templates
 *
 * Customize these prompts to change how the AI responds.
 */

/**
 * System prompt for general questions
 */
export const SYSTEM_PROMPT = `You are a helpful Discord bot assistant.
Keep your responses concise and friendly.
Use Discord markdown formatting when appropriate.`;

/**
 * Build a prompt with the system context
 */
export function buildPrompt(userPrompt: string, systemPrompt?: string): string {
  const system = systemPrompt || SYSTEM_PROMPT;
  return `${system}\n\nUser: ${userPrompt}`;
}

/**
 * Prompt for summarization tasks
 */
export const SUMMARIZE_PROMPT = `Summarize the following text in a clear, concise manner.
Keep the summary to 2-3 sentences maximum.`;

/**
 * Prompt for creative responses
 */
export const CREATIVE_PROMPT = `Be creative and entertaining in your response.
Feel free to use humor and personality.`;
