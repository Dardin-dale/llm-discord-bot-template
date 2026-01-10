/**
 * Help Command
 *
 * Shows available commands with descriptions.
 * Example of using embeds for rich responses.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { loadCommands } from './loader';

const command: Command = {
  name: 'help',
  description: 'Show available commands',

  definition: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands')
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    const commands = await loadCommands();

    // Build command list
    const commandList = Array.from(commands.values())
      .filter((cmd) => !cmd.name.startsWith('_')) // Exclude templates
      .map((cmd) => `**/${cmd.name}** - ${cmd.description}`)
      .join('\n');

    return {
      type: 'instant',
      embeds: [
        {
          title: 'Available Commands',
          description: commandList || 'No commands available.',
          color: 0x5865f2, // Discord blurple
          footer: {
            text: 'Built with Discord Bot Template',
          },
        },
      ],
    };
  },
};

export default command;
