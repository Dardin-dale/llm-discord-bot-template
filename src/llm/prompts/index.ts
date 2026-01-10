/**
 * Prompt System
 *
 * Export all prompt-related functionality.
 */
export * from './types';
export * from './registry';

// Re-export built-in prompts for direct access if needed
export { answerPrompt } from './builtin/answer';
export { summarizePrompt } from './builtin/summarize';
export { explainPrompt } from './builtin/explain';
export { translatePrompt } from './builtin/translate';
export { creativePrompt } from './builtin/creative';
