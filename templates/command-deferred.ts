/**
 * Deferred Response Command Template
 *
 * Use this template for commands that take longer than 3 seconds.
 * Good for: API calls, LLM queries, database operations
 *
 * Copy to: src/commands/your-command.ts
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { editOriginalResponse } from '../discord/responses';
import { getProviderManager } from '../llm/provider';

const command: Command = {
  // TODO: Change these
  name: 'mycommand',
  description: 'Description of what this command does',

  definition: new SlashCommandBuilder()
    .setName('mycommand')  // Must match name above
    .setDescription('Description of what this command does')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Your input')
        .setRequired(true)
    )
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    // Return deferred to show "thinking..." while we process
    return { type: 'deferred' };
  },

  async processDeferred(interaction: APIChatInputApplicationCommandInteraction): Promise<void> {
    const applicationId = process.env.DISCORD_APP_ID || interaction.application_id;

    try {
      // Get the input from options
      const inputOption = interaction.data.options?.find(o => o.name === 'input');
      const input = (inputOption as any)?.value as string;

      // TODO: Add your async logic here
      // Example using LLM:
      const provider = getProviderManager().getProvider();
      const result = await provider.generate(input);

      // Send the response back to Discord
      await editOriginalResponse(applicationId, interaction.token, result);
    } catch (error) {
      console.error('Error processing command:', error);
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'Sorry, something went wrong.'
      );
    }
  },
};

export default command;
