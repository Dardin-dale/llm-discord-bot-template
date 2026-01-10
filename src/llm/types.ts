/**
 * LLM Provider types
 */

/**
 * LLM Provider interface
 *
 * All LLM providers must implement this interface.
 */
export interface LLMProvider {
  /** Provider name */
  name: string;

  /**
   * Generate a response from the LLM
   *
   * @param prompt - The prompt to send to the LLM
   * @param options - Optional generation options
   * @returns The generated text response
   */
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

/**
 * Options for text generation
 */
export interface GenerateOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for randomness (0-1) */
  temperature?: number;
  /** System prompt to set context */
  systemPrompt?: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Default provider to use */
  default: 'gemini' | 'claude';
  /** Gemini API key */
  geminiApiKey?: string;
  /** Anthropic API key */
  claudeApiKey?: string;
}
