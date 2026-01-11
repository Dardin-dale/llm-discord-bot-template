/**
 * LLM Provider Manager
 *
 * Manages multiple LLM providers and provides a unified interface.
 * Supports Gemini (default, free tier), Claude, and OpenAI.
 */
import { LLMProvider } from './types';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';

export class LLMProviderManager {
  private providers: Map<string, LLMProvider> = new Map();
  private currentProvider: string;

  constructor(defaultProvider: 'gemini' | 'claude' | 'openai' = 'gemini') {
    this.currentProvider = defaultProvider;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Gemini if API key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.providers.set('gemini', new GeminiProvider(geminiKey));
    }

    // Initialize Claude if API key is available
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    if (claudeKey) {
      this.providers.set('claude', new ClaudeProvider(claudeKey));
    }

    // Initialize OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.providers.set('openai', new OpenAIProvider(openaiKey));
    }

    // Warn if no providers available
    if (this.providers.size === 0) {
      console.warn('No LLM providers configured. Set GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.');
    }
  }

  /**
   * Get a provider by name, or the current default provider
   */
  public getProvider(name?: string): LLMProvider {
    const providerName = name || this.currentProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      const available = this.getAvailableProviders();
      if (available.length === 0) {
        throw new Error('No LLM providers configured. Set GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.');
      }
      throw new Error(
        `Provider '${providerName}' not available. Available: ${available.join(', ')}`
      );
    }

    return provider;
  }

  /**
   * Set the current default provider
   */
  public setCurrentProvider(name: 'gemini' | 'claude' | 'openai'): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' is not configured`);
    }
    this.currentProvider = name;
  }

  /**
   * Get the current provider name
   */
  public getCurrentProvider(): string {
    return this.currentProvider;
  }

  /**
   * Get list of available provider names
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Global singleton instance
let providerManager: LLMProviderManager | null = null;

/**
 * Get the global provider manager instance
 */
export function getProviderManager(): LLMProviderManager {
  if (!providerManager) {
    const defaultProvider =
      (process.env.DEFAULT_LLM_PROVIDER as 'gemini' | 'claude' | 'openai') || 'gemini';
    providerManager = new LLMProviderManager(defaultProvider);
  }
  return providerManager;
}
