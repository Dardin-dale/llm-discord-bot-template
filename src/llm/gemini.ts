/**
 * Google Gemini LLM Provider
 *
 * Uses Gemini with Google Search grounding for accurate, up-to-date responses.
 * Recommended as default due to generous free tier.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, GenerateOptions } from './types';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 1500,
        temperature: options?.temperature,
      },
    });

    try {
      // Build the prompt with optional system context
      const fullPrompt = options?.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
