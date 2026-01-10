/**
 * Creative Prompt
 *
 * Creative writing and brainstorming.
 */
import { PromptTemplate } from '../types';

export const creativePrompt: PromptTemplate = {
  name: 'creative',
  description: 'Creative writing, brainstorming, and imaginative tasks',

  systemPrompt: `You are a creative writer with a vivid imagination.
Be creative, engaging, and original in your responses.
Feel free to use metaphors, wordplay, and expressive language.
Have fun with it!`,

  template: '{{prompt}}',

  defaultOptions: {
    maxTokens: 1200,
    temperature: 0.9, // Higher temperature for creativity
  },
};
