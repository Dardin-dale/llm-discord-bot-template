/**
 * Custom Prompt Template
 *
 * Copy this file to create a new prompt template.
 * Place in src/llm/prompts/builtin/ and import in registry.ts
 */
import { PromptTemplate } from './types';

export const myPrompt: PromptTemplate = {
  // Unique name for the prompt (lowercase, no spaces)
  name: 'myprompt',

  // Description shown in help
  description: 'What this prompt does',

  // System prompt that sets the AI's behavior
  systemPrompt: `You are a helpful assistant specialized in [your domain].
[Add any specific instructions here]`,

  // Prompt template with {{variables}} for substitution
  // Variables are passed when running the prompt
  template: `[Your prompt here]

{{input}}`,

  // Default options (can be overridden when running)
  defaultOptions: {
    maxTokens: 1000,
    temperature: 0.7, // 0 = focused, 1 = creative
  },
};
