/**
 * Prompt Registry
 *
 * Manages available prompt templates and provides easy access to run them.
 */
import { PromptTemplate, PromptOptions, PromptVariables, PromptResult } from './types';
import { getProviderManager } from '../provider';

// Built-in prompts
import { answerPrompt } from './builtin/answer';
import { summarizePrompt } from './builtin/summarize';
import { explainPrompt } from './builtin/explain';
import { translatePrompt } from './builtin/translate';
import { creativePrompt } from './builtin/creative';

class PromptRegistry {
  private prompts: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.registerBuiltinPrompts();
  }

  /**
   * Register built-in prompts
   */
  private registerBuiltinPrompts(): void {
    this.register(answerPrompt);
    this.register(summarizePrompt);
    this.register(explainPrompt);
    this.register(translatePrompt);
    this.register(creativePrompt);
  }

  /**
   * Register a prompt template
   */
  public register(prompt: PromptTemplate): void {
    this.prompts.set(prompt.name, prompt);
  }

  /**
   * Get a prompt by name
   */
  public get(name: string): PromptTemplate | undefined {
    return this.prompts.get(name);
  }

  /**
   * List all available prompts
   */
  public list(): PromptTemplate[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Check if a prompt exists
   */
  public has(name: string): boolean {
    return this.prompts.has(name);
  }

  /**
   * Run a prompt with the given variables
   */
  public async run(
    promptName: string,
    variables: PromptVariables,
    options?: PromptOptions
  ): Promise<PromptResult> {
    const promptTemplate = this.get(promptName);

    if (!promptTemplate) {
      throw new Error(`Prompt '${promptName}' not found. Available: ${this.listNames().join(', ')}`);
    }

    // Build the prompt from template
    const userPrompt = this.buildPrompt(promptTemplate.template, variables);

    // Merge options
    const finalOptions = {
      ...promptTemplate.defaultOptions,
      ...options,
    };

    // Get system prompt
    const systemPrompt = options?.systemPrompt || promptTemplate.systemPrompt;

    // Build full prompt with additional context if provided
    let fullPrompt = userPrompt;
    if (options?.additionalContext) {
      fullPrompt = `${userPrompt}\n\nAdditional context: ${options.additionalContext}`;
    }

    // Run through LLM provider
    const provider = getProviderManager().getProvider();
    const response = await provider.generate(fullPrompt, {
      maxTokens: finalOptions.maxTokens,
      temperature: finalOptions.temperature,
      systemPrompt,
    });

    return {
      response,
      prompt: promptName,
      provider: provider.name,
    };
  }

  /**
   * Build a prompt from a template with variable substitution
   */
  private buildPrompt(template: string, variables: PromptVariables): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value);
    }

    // Check for unsubstituted variables
    const remaining = result.match(/{{(\w+)}}/g);
    if (remaining) {
      const missing = remaining.map((m) => m.slice(2, -2));
      throw new Error(`Missing variables for prompt: ${missing.join(', ')}`);
    }

    return result;
  }

  /**
   * List prompt names
   */
  public listNames(): string[] {
    return Array.from(this.prompts.keys());
  }
}

// Singleton instance
let registry: PromptRegistry | null = null;

/**
 * Get the prompt registry
 */
export function getPromptRegistry(): PromptRegistry {
  if (!registry) {
    registry = new PromptRegistry();
  }
  return registry;
}

/**
 * Convenience function to run a prompt
 */
export async function runPrompt(
  promptName: string,
  variables: PromptVariables,
  options?: PromptOptions
): Promise<PromptResult> {
  return getPromptRegistry().run(promptName, variables, options);
}
