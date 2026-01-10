---
name: add-llm-command
description: Create a Discord command that uses AI/LLM. Use when the user wants to add an AI-powered command, create a command that uses the language model, or add intelligent/smart features to the bot.
---

# Add AI-Powered Discord Command

Create a Discord slash command that uses the LLM for AI-powered responses.

## Instructions

1. Ask the user for:
   - Command name (lowercase, no spaces)
   - What should the AI do? (e.g., "give advice", "write poems", "analyze text")

2. Read the example at `src/commands/ask.ts` (working LLM command)

3. Decide if a custom prompt is needed:
   - Simple Q&A: Use existing `answer` prompt
   - Specialized task: Create a custom prompt first (see `src/llm/prompts/builtin/`)

4. Create `src/commands/<name>.ts`:
   - Use deferred response pattern (required for LLM calls)
   - Import `runPrompt` from `../llm/prompts`
   - Add appropriate command options (string input, etc.)
   - Use `sendLongMessage` for the response (handles Discord's 2000 char limit)
   - Add structured logging

5. If creating a custom prompt, also:
   - Create `src/llm/prompts/builtin/<name>.ts`
   - Register in `src/llm/prompts/registry.ts`
   - Export from `src/llm/prompts/index.ts`

6. After creating, tell them:
   - Files created
   - Run `npm run register` to register
   - Remind them LLM commands need API keys configured

## Example

User: "I want a command that writes haikus about any topic"

1. Create `src/llm/prompts/builtin/haiku.ts`:
```typescript
export const haikuPrompt: PromptTemplate = {
  name: 'haiku',
  description: 'Write haikus about a topic',
  systemPrompt: 'You are a haiku poet. Write beautiful haikus.',
  template: 'Write a haiku about: {{topic}}',
  defaultOptions: { maxTokens: 100, temperature: 0.9 }
};
```

2. Create `src/commands/haiku.ts` using deferred response pattern

## Key Patterns

- Always use `{ type: 'deferred' }` for LLM commands
- Use `processDeferred()` for the actual LLM call
- Use `sendLongMessage()` to handle long responses
- Use `logger` for structured logging
