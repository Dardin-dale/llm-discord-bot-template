/**
 * Ping Command
 *
 * Simple command to check if the bot is online.
 * Example of an instant response command.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';

const command: Command = {
  name: 'ping',
  description: 'Check if the bot is online',

  definition: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is online')
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    return {
      type: 'instant',
      content: 'Pong! Bot is online and ready.',
    };
  },
};

export default command;
