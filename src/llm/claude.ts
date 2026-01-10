/**
 * Anthropic Claude LLM Provider
 *
 * Uses Claude with web search for accurate, up-to-date responses.
 */
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, GenerateOptions } from './types';

export class ClaudeProvider implements LLMProvider {
  public readonly name = 'claude';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: options?.maxTokens || 1500,
        system: options?.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(
        `Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
