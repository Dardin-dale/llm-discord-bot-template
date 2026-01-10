/**
 * Explain Prompt
 *
 * Explain concepts in simple terms.
 */
import { PromptTemplate } from '../types';

export const explainPrompt: PromptTemplate = {
  name: 'explain',
  description: 'Explain concepts in simple, easy-to-understand terms',

  systemPrompt: `You are an excellent teacher who explains complex topics simply.
Break down concepts into easy-to-understand parts.
Use analogies and examples when helpful.
Avoid jargon unless you explain it.`,

  template: `Please explain this concept in simple terms:

{{topic}}`,

  defaultOptions: {
    maxTokens: 800,
    temperature: 0.5,
  },
};
