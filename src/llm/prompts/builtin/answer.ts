/**
 * Answer Prompt
 *
 * General question-answering prompt template.
 */
import { PromptTemplate } from '../types';

export const answerPrompt: PromptTemplate = {
  name: 'answer',
  description: 'Answer questions accurately and helpfully',

  systemPrompt: `You are a helpful assistant. Answer questions accurately and concisely.
If you don't know something, say so rather than making up information.
Use Discord markdown formatting when appropriate.`,

  template: '{{question}}',

  defaultOptions: {
    maxTokens: 1000,
    temperature: 0.7,
  },
};
