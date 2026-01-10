# Adding Commands

This guide shows you how to add new commands to your Discord bot.

## The Simple Way

1. Copy the template:
   ```bash
   cp src/commands/_template.ts src/commands/mycommand.ts
   ```

2. Edit `src/commands/mycommand.ts`:
   ```typescript
   const command: Command = {
     name: 'mycommand',  // Change this
     description: 'What my command does',  // Change this

     definition: new SlashCommandBuilder()
       .setName('mycommand')  // Must match name above
       .setDescription('What my command does')
       .toJSON(),

     async execute() {
       return {
         type: 'instant',
         content: 'Hello from my command!',  // Your response
       };
     },
   };
   ```

3. Register and deploy:
   ```bash
   npm run register
   npm run deploy
   ```

That's it! Your command is now live.

## Adding Options (Arguments)

Commands can accept user input:

```typescript
definition: new SlashCommandBuilder()
  .setName('greet')
  .setDescription('Greet someone')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Who to greet')
      .setRequired(true)
  )
  .toJSON(),

async execute(interaction) {
  const nameOption = interaction.data.options?.find(o => o.name === 'name');
  const name = (nameOption as any)?.value || 'stranger';

  return {
    type: 'instant',
    content: `Hello, ${name}!`,
  };
},
```

### Option Types

```typescript
// String input
.addStringOption(option => option.setName('text').setDescription('Text input'))

// Number input
.addNumberOption(option => option.setName('count').setDescription('A number'))

// Boolean (true/false)
.addBooleanOption(option => option.setName('enabled').setDescription('Enable feature'))

// User picker
.addUserOption(option => option.setName('user').setDescription('Select a user'))

// Channel picker
.addChannelOption(option => option.setName('channel').setDescription('Select a channel'))

// Choices (dropdown)
.addStringOption(option =>
  option.setName('color')
    .setDescription('Pick a color')
    .addChoices(
      { name: 'Red', value: 'red' },
      { name: 'Blue', value: 'blue' },
      { name: 'Green', value: 'green' }
    )
)
```

## Using Embeds (Rich Messages)

For prettier responses:

```typescript
async execute() {
  return {
    type: 'instant',
    embeds: [{
      title: 'My Embed Title',
      description: 'This is the main content',
      color: 0x5865F2,  // Discord blurple
      fields: [
        { name: 'Field 1', value: 'Value 1', inline: true },
        { name: 'Field 2', value: 'Value 2', inline: true },
      ],
      footer: { text: 'Footer text' },
    }],
  };
},
```

## Ephemeral Responses (Private)

Only the user who ran the command can see it:

```typescript
return {
  type: 'instant',
  content: 'Only you can see this!',
  ephemeral: true,
};
```

## Deferred Responses (For Slow Operations)

Discord requires a response within 3 seconds. For longer operations (API calls, LLM queries), use deferred responses:

```typescript
async execute() {
  // This tells Discord to show "thinking..."
  return { type: 'deferred' };
},

async processDeferred(interaction) {
  // Do your slow operation here
  const result = await someLongOperation();

  // Send the actual response
  const appId = process.env.DISCORD_APP_ID!;
  const { editOriginalResponse } = await import('../discord/responses');
  await editOriginalResponse(appId, interaction.token, result);
},
```

## Using the LLM

For AI-powered commands:

```typescript
import { getProviderManager } from '../llm/provider';

async processDeferred(interaction) {
  const provider = getProviderManager().getProvider();

  const response = await provider.generate(
    'Tell me a joke about programming',
    { maxTokens: 500 }
  );

  await editOriginalResponse(appId, interaction.token, response);
},
```

## Complete Example: Weather Command

```typescript
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { editOriginalResponse } from '../discord/responses';
import { getProviderManager } from '../llm/provider';

const command: Command = {
  name: 'weather',
  description: 'Get weather information for a city',

  definition: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather information for a city')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    )
    .toJSON(),

  async execute() {
    return { type: 'deferred' };
  },

  async processDeferred(interaction) {
    const appId = process.env.DISCORD_APP_ID!;

    try {
      const cityOption = interaction.data.options?.find(o => o.name === 'city');
      const city = (cityOption as any)?.value || 'Unknown';

      const provider = getProviderManager().getProvider();
      const weather = await provider.generate(
        `What's the current weather in ${city}? Give a brief, friendly summary.`,
        { maxTokens: 200 }
      );

      await editOriginalResponse(appId, interaction.token, weather);
    } catch (error) {
      await editOriginalResponse(
        appId,
        interaction.token,
        'Sorry, I could not get the weather information.'
      );
    }
  },
};

export default command;
```

## Tips

- **Keep names lowercase**: `mycommand` not `MyCommand`
- **Use descriptive descriptions**: Users see these in Discord's command picker
- **Test locally first**: `npm run dev` + ngrok
- **Check for errors**: `npm run validate`
- **One command per file**: Keeps things organized
