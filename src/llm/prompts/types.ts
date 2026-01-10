/**
 * Prompt System Types
 *
 * Prompt templates are reusable patterns for common LLM tasks.
 */

/**
 * A prompt template definition
 */
export interface PromptTemplate {
  /** Unique prompt name */
  name: string;
  /** Description of what the prompt does */
  description: string;
  /** System prompt for this template */
  systemPrompt: string;
  /** Template for the user prompt (use {{variable}} for substitution) */
  template: string;
  /** Default options for this prompt */
  defaultOptions?: PromptOptions;
}

/**
 * Options for running a prompt
 */
export interface PromptOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature (0-1, lower = more focused) */
  temperature?: number;
  /** Override the system prompt */
  systemPrompt?: string;
  /** Additional context to append */
  additionalContext?: string;
}

/**
 * Variables to substitute in the prompt template
 */
export type PromptVariables = Record<string, string>;

/**
 * Result from running a prompt
 */
export interface PromptResult {
  /** The generated response */
  response: string;
  /** Which prompt template was used */
  prompt: string;
  /** Which provider was used */
  provider: string;
}
