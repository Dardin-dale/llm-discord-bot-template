---
name: add-prompt
description: Create a new LLM prompt template. Use when the user wants to add a prompt, create a prompt template, customize AI behavior, or add a new AI capability.
---

# Add Prompt Template

Create a reusable prompt template for LLM interactions.

## Instructions

1. Ask the user for:
   - Prompt name (lowercase, no spaces)
   - What should it do?
   - What variables/inputs does it need?

2. Read the template at `src/llm/prompts/_template.ts`

3. Create `src/llm/prompts/builtin/<name>.ts`:
   - Export as `<name>Prompt`
   - Set descriptive `name` and `description`
   - Write a focused `systemPrompt` for the AI's role
   - Create `template` with `{{variable}}` placeholders
   - Set appropriate `defaultOptions` (temperature, maxTokens)

4. Register in `src/llm/prompts/registry.ts`:
   - Add import: `import { <name>Prompt } from './builtin/<name>';`
   - Add to `registerBuiltinPrompts()`: `this.register(<name>Prompt);`

5. Export from `src/llm/prompts/index.ts`:
   - Add: `export { <name>Prompt } from './builtin/<name>';`

6. After creating, tell them:
   - How to use: `runPrompt('<name>', { variable: 'value' })`
   - Offer to create a command that uses this prompt

## Temperature Guide

- 0.0-0.3: Factual, consistent (translations, summaries)
- 0.4-0.6: Balanced (explanations, Q&A)
- 0.7-0.9: Creative (stories, brainstorming)

## Example

User: "I want a prompt that roasts people in a friendly way"

Create `src/llm/prompts/builtin/roast.ts`:
```typescript
export const roastPrompt: PromptTemplate = {
  name: 'roast',
  description: 'Generate friendly roasts',
  systemPrompt: `You are a comedian who gives friendly, playful roasts.
Keep it light-hearted and never mean-spirited.
Make it funny but not hurtful.`,
  template: 'Give a friendly roast for someone who {{trait}}',
  defaultOptions: {
    maxTokens: 200,
    temperature: 0.8,
  },
};
```
