/**
 * Summarize Prompt
 *
 * Summarize text into key points.
 */
import { PromptTemplate } from '../types';

export const summarizePrompt: PromptTemplate = {
  name: 'summarize',
  description: 'Summarize text into key points',

  systemPrompt: `You are a skilled summarizer. Create clear, concise summaries that capture the essential information.
Focus on the main points and key takeaways.
Use bullet points for clarity when appropriate.`,

  template: `Please summarize the following text:

{{text}}`,

  defaultOptions: {
    maxTokens: 500,
    temperature: 0.3, // Lower temperature for more focused summaries
  },
};
