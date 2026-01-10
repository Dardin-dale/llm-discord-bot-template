/**
 * Interactive Command Template
 *
 * Use this template for commands with buttons or select menus.
 * Note: Full button/menu support requires additional handler setup.
 *
 * Copy to: src/commands/your-command.ts
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';

const command: Command = {
  // TODO: Change these
  name: 'mycommand',
  description: 'An interactive command',

  definition: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('An interactive command')
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    // Return a message with components
    // Note: Full component interaction handling requires additional setup
    return {
      type: 'instant',
      content: 'Choose an option:',
      // Components would go here, but require additional handler setup
      // See Discord.js documentation for component handling
    };
  },
};

export default command;
