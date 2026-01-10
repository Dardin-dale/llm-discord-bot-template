---
name: add-command
description: Create a new Discord slash command. Use when the user wants to add a command, create a command, make a new bot command, or add functionality to the Discord bot.
---

# Add Discord Slash Command

Create a new instant-response Discord slash command.

## Instructions

1. Ask the user for:
   - Command name (lowercase, no spaces)
   - Description (what should it do?)

2. Read the template at `src/commands/_template.ts`

3. Create `src/commands/<name>.ts`:
   - Set the `name` field
   - Set the `description` field
   - Update SlashCommandBuilder with same name/description
   - Keep as instant response (not deferred)
   - Implement the logic based on user's description

4. After creating, tell them:
   - File created at `src/commands/<name>.ts`
   - Run `npm run register` to register with Discord
   - Test locally with `npm run dev`

## Example

User: "I want to add a command that rolls dice"

Create `src/commands/roll.ts` that:
- Takes an optional "sides" parameter (default 6)
- Returns a random number
- Uses instant response (dice rolls are fast)

## Notes

- For commands needing AI/LLM, suggest using the add-llm-command skill instead
- Commands are auto-discovered from the `src/commands/` directory
- Keep command names short and descriptive
