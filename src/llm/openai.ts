/**
 * OpenAI LLM Provider
 *
 * Uses OpenAI's GPT models for text generation.
 */
import { LLMProvider, GenerateOptions } from './types';

export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || process.env.OPENAI_MODEL || 'gpt-5-nano';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: options?.maxTokens || 1500,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
