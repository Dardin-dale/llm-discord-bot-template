/**
 * Instant Response Command Template
 *
 * Use this template for commands that respond immediately.
 * Good for: simple queries, status checks, quick calculations
 *
 * Copy to: src/commands/your-command.ts
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';

const command: Command = {
  // TODO: Change these
  name: 'mycommand',
  description: 'Description of what this command does',

  definition: new SlashCommandBuilder()
    .setName('mycommand')  // Must match name above
    .setDescription('Description of what this command does')
    // Add options if needed:
    // .addStringOption(option =>
    //   option.setName('input').setDescription('Your input').setRequired(true)
    // )
    .toJSON(),

  async execute(interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    // TODO: Add your logic here

    // Get option values like this:
    // const input = interaction.data.options?.find(o => o.name === 'input');
    // const value = (input as any)?.value;

    return {
      type: 'instant',
      content: 'Your response here!',
      // ephemeral: true,  // Uncomment to make only visible to user
    };
  },
};

export default command;
