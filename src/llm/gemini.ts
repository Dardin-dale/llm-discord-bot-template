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

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    // Use Gemini with Google Search grounding for real-time information
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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
