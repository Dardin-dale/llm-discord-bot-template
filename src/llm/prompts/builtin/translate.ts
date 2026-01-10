/**
 * Translate Prompt
 *
 * Translate text between languages.
 */
import { PromptTemplate } from '../types';

export const translatePrompt: PromptTemplate = {
  name: 'translate',
  description: 'Translate text to another language',

  systemPrompt: `You are a professional translator.
Translate accurately while preserving the original meaning and tone.
If the target language isn't specified, translate to English.
Maintain formatting and structure where possible.`,

  template: `Translate the following to {{language}}:

{{text}}`,

  defaultOptions: {
    maxTokens: 1000,
    temperature: 0.2, // Low temperature for accurate translation
  },
};
